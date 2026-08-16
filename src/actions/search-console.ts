"use server";

import { google } from "googleapis";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveOrganization } from "@/lib/org";

interface SearchConsoleData {
    date: string;
    clicks: number;
    impressions: number;
}

interface SearchConsoleQuery {
    query: string;
    clicks: number;
    impressions: number;
    position: number;
}

// Search Console needs a site URL formatted exactly as it's registered/verified - since we
// don't store which exact format the user verified, try the common variants until one works.
function siteUrlFormats(rawUrl: string): string[] {
    const domain = rawUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const domainWithoutWww = domain.replace(/^www\./, "");
    const domainWithWww = domain.startsWith("www.") ? domain : `www.${domain}`;

    return [
        rawUrl,
        rawUrl + "/",
        `https://${domainWithoutWww}`,
        `https://${domainWithoutWww}/`,
        `https://${domainWithWww}`,
        `https://${domainWithWww}/`,
        `http://${domainWithoutWww}`,
        `http://${domainWithWww}`,
        `sc-domain:${domainWithoutWww}`,
    ];
}

// Shared client setup for both the session-based (UI) calls below and the explicit-userId
// (cron/background) variant used by autopilot discovery - takes an explicit userId rather than
// pulling it from auth() so it works outside a request context (mirrors generateBlogContent vs
// generateBlogPost in generate-blog.ts: an auth-free variant a background job can call directly).
async function getSearchConsoleClientForUser(userId: string) {
    const googleAccount = await prisma.account.findFirst({
        where: { userId, provider: "google" }
    });
    if (!googleAccount?.access_token) {
        return null;
    }

    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;
    if (!clientId || !clientSecret) {
        return null;
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({
        access_token: googleAccount.access_token,
        refresh_token: googleAccount.refresh_token || undefined,
    });

    return google.searchconsole({ version: "v1", auth: oauth2Client });
}

export async function getSearchConsoleData(siteUrl?: string): Promise<SearchConsoleData[]> {
    const session = await auth();
    if (!session?.user?.id) {
        console.warn("User not authenticated");
        return [];
    }

    let targetSiteUrl = siteUrl;

    // If no siteUrl provided, get the organization's first connected site
    if (!targetSiteUrl) {
        const organization = await getActiveOrganization();
        const connectedSite = organization
            ? await prisma.connectedSite.findFirst({
                where: { organizationId: organization.id },
                orderBy: { createdAt: "desc" }
            })
            : null;

        if (!connectedSite) {
            console.warn("No connected site configured");
            return [];
        }
        targetSiteUrl = connectedSite.url;
    }

    const searchconsole = await getSearchConsoleClientForUser(session.user.id);
    if (!searchconsole) {
        console.warn("No Google account connected or missing OAuth configuration");
        return [];
    }

    try {
        // Get the last 30 days of data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const formatDate = (d: Date) => d.toISOString().split("T")[0];

        let response = null;
        for (const format of siteUrlFormats(targetSiteUrl)) {
            try {
                response = await searchconsole.searchanalytics.query({
                    siteUrl: format,
                    requestBody: {
                        startDate: formatDate(startDate),
                        endDate: formatDate(endDate),
                        dimensions: ["date"],
                        rowLimit: 30,
                    },
                });
                if (response.data.rows) {
                    console.log("Found Search Console data for format:", format);
                    break;
                }
            } catch (e) {
                // Try next format
                continue;
            }
        }

        if (!response?.data?.rows) {
            console.warn("No Search Console data found for site:", siteUrl);
            return [];
        }

        return response.data.rows.map((row) => ({
            date: row.keys?.[0] || "",
            clicks: Math.round(row.clicks || 0),
            impressions: Math.round(row.impressions || 0),
        }));
    } catch (error: any) {
        console.error("Error fetching Search Console data:", error.message || error);
        return [];
    }
}

/**
 * Real search queries the project's site already gets Search Console impressions for -
 * autopilot discovery's preferred keyword source (see runAutopilotDiscoveryAndScheduling in
 * src/actions/autopilot.ts) since these reflect the site's own actual search visibility, not
 * third-party trend estimates. Falls back to [] (never throws) whenever there's no connected
 * Google account, no OAuth config, or no Search Console data yet for this site - the caller
 * decides what "not enough data" means and falls back to Trends-based discovery accordingly.
 *
 * Takes an explicit userId (the Project's owner) rather than the signed-in session, since this
 * is called from a background cron run with no request/session context.
 */
export async function getTopSearchQueriesForUser(
    userId: string,
    domain: string,
    options?: { days?: number; rowLimit?: number }
): Promise<SearchConsoleQuery[]> {
    const searchconsole = await getSearchConsoleClientForUser(userId);
    if (!searchconsole) {
        return [];
    }

    try {
        const days = options?.days ?? 90;
        const rowLimit = options?.rowLimit ?? 50;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const formatDate = (d: Date) => d.toISOString().split("T")[0];

        for (const format of siteUrlFormats(domain)) {
            try {
                const response = await searchconsole.searchanalytics.query({
                    siteUrl: format,
                    requestBody: {
                        startDate: formatDate(startDate),
                        endDate: formatDate(endDate),
                        dimensions: ["query"],
                        rowLimit,
                    },
                });
                if (response.data.rows?.length) {
                    return response.data.rows.map((row) => ({
                        query: row.keys?.[0] || "",
                        clicks: Math.round(row.clicks || 0),
                        impressions: Math.round(row.impressions || 0),
                        position: row.position ?? 0,
                    }));
                }
            } catch {
                continue;
            }
        }

        return [];
    } catch (error) {
        console.error("Error fetching Search Console queries:", error instanceof Error ? error.message : error);
        return [];
    }
}

// Get list of sites the user has access to in Search Console
export async function getSearchConsoleSites(): Promise<string[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const searchconsole = await getSearchConsoleClientForUser(session.user.id);
    if (!searchconsole) return [];

    try {
        const sites = await searchconsole.sites.list();
        const siteUrls = sites.data.siteEntry?.map(s => s.siteUrl || "").filter(Boolean) || [];
        return siteUrls;
    } catch (error) {
        console.error("Error fetching Search Console sites:", error);
        return [];
    }
}
