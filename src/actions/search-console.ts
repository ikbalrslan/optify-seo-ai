"use server";

import { google } from "googleapis";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface SearchConsoleData {
    date: string;
    clicks: number;
    impressions: number;
}

export async function getSearchConsoleData(siteUrl?: string): Promise<SearchConsoleData[]> {
    const session = await auth();
    if (!session?.user?.id) {
        console.warn("User not authenticated");
        return [];
    }

    let targetSiteUrl = siteUrl;

    // If no siteUrl provided, get user's first WordPress site
    if (!targetSiteUrl) {
        const wordPressSite = await prisma.wordPressSite.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        if (!wordPressSite) {
            console.warn("No WordPress site configured");
            return [];
        }
        targetSiteUrl = wordPressSite.url;
    }

    // Get user's Google OAuth tokens from their account
    const googleAccount = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: "google"
        }
    });

    if (!googleAccount?.access_token) {
        console.warn("No Google account connected or missing access token");
        return [];
    }

    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("Google OAuth credentials not configured");
        return [];
    }

    try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({
            access_token: googleAccount.access_token,
            refresh_token: googleAccount.refresh_token || undefined,
        });

        const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });

        // Get the last 30 days of data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const formatDate = (d: Date) => d.toISOString().split("T")[0];

        // Format site URL for Search Console (needs to match exactly how it's registered)
        const domain = targetSiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const domainWithoutWww = domain.replace(/^www\./, "");
        const domainWithWww = domain.startsWith("www.") ? domain : `www.${domain}`;

        const possibleFormats = [
            targetSiteUrl,
            targetSiteUrl + "/",
            `https://${domainWithoutWww}`,
            `https://${domainWithoutWww}/`,
            `https://${domainWithWww}`,
            `https://${domainWithWww}/`,
            `http://${domainWithoutWww}`,
            `http://${domainWithWww}`,
            `sc-domain:${domainWithoutWww}`,
        ];

        let response = null;
        for (const format of possibleFormats) {
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

// Get list of sites the user has access to in Search Console
export async function getSearchConsoleSites(): Promise<string[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const googleAccount = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: "google"
        }
    });

    if (!googleAccount?.access_token) return [];

    const clientId = process.env.AUTH_GOOGLE_ID;
    const clientSecret = process.env.AUTH_GOOGLE_SECRET;

    if (!clientId || !clientSecret) return [];

    try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({
            access_token: googleAccount.access_token,
            refresh_token: googleAccount.refresh_token || undefined,
        });

        const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });
        const sites = await searchconsole.sites.list();

        const siteUrls = sites.data.siteEntry?.map(s => s.siteUrl || "").filter(Boolean) || [];
        return siteUrls;
    } catch (error) {
        console.error("Error fetching Search Console sites:", error);
        return [];
    }
}

// Get user's WordPress sites for dropdown
export async function getUserWordPressSites(): Promise<{ id: string; name: string; url: string }[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const sites = await prisma.wordPressSite.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, url: true }
    });

    return sites;
}
