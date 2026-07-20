"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveOrganization, requireOrgRole, requireOrgProjectAccess } from "@/lib/org";
import { encrypt, decrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

type WordPressCredentials = {
    username: string;
    encryptedAppPassword: string;
};

// ConnectedSite is strictly one-to-one with a Project (a website) - viewing/publishing is
// MEMBER-level, adding/removing a site (structural site management) requires ADMIN. Functions
// that take an optional projectId fall back to listing across the whole org, for the couple of
// call sites (dashboard's OverviewChart, the standalone blog generator) that don't have a
// specific project selected yet.

export async function addWordPressSite(projectId: string, url: string, username: string, appPassword: string) {
    const { userId, project } = await requireOrgProjectAccess(projectId, "ADMIN");

    // Basic URL validation
    let cleanUrl = url.trim();
    if (!cleanUrl.match(/^https?:\/\//)) {
        cleanUrl = "https://" + cleanUrl;
    }
    // Remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, "");

    // Verify connection using User's credentials
    try {
        const credentials = btoa(`${username}:${appPassword}`);
        const response = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        // optionally verify 'slug' or 'name' matches input username if strict
    } catch (error: any) {
        console.error("WP Verification Error:", error);
        throw new Error("Could not verify WordPress connection. Please checks URL and credentials.");
    }

    // Extract site name from URL or generic
    const siteName = cleanUrl.replace(/^https?:\/\//, "");

    const credentials: WordPressCredentials = {
        username,
        encryptedAppPassword: encrypt(appPassword),
    };

    await prisma.connectedSite.create({
        data: {
            userId,
            organizationId: project.organizationId,
            projectId,
            type: "WORDPRESS",
            name: siteName,
            url: cleanUrl,
            credentials: JSON.stringify(credentials),
        }
    });

    revalidatePath("/settings");
    revalidatePath("/organization/billing");
    return { success: true };
}

export async function getConnectedSites(projectId?: string) {
    let organizationId: string;
    if (projectId) {
        const { project } = await requireOrgProjectAccess(projectId, "MEMBER");
        organizationId = project.organizationId;
    } else {
        const organization = await getActiveOrganization();
        if (!organization) {
            return [];
        }
        await requireOrgRole(organization.id, "MEMBER");
        organizationId = organization.id;
    }

    const sites = await prisma.connectedSite.findMany({
        where: projectId ? { projectId } : { organizationId },
        orderBy: { createdAt: "desc" }
    });

    // Return without sensitive credentials
    return sites.map(site => {
        const creds = JSON.parse(site.credentials) as Partial<WordPressCredentials>;
        return {
            id: site.id,
            type: site.type,
            name: site.name,
            url: site.url,
            username: creds.username,
            createdAt: site.createdAt,
        };
    });
}

export async function deleteConnectedSite(id: string) {
    const site = await prisma.connectedSite.findUnique({ where: { id } });
    if (!site) {
        throw new Error("Site not found");
    }
    await requireOrgProjectAccess(site.projectId, "ADMIN");

    await prisma.connectedSite.delete({ where: { id } });

    revalidatePath("/settings");
    revalidatePath("/organization/billing");
    return { success: true };
}

export async function publishToWordPress(siteId: string, postData: { title: string, content: string, meta_description?: string, focus_keyword?: string }) {
    const site = await prisma.connectedSite.findUnique({ where: { id: siteId } });
    if (!site) throw new Error("Site not found");
    await requireOrgProjectAccess(site.projectId, "MEMBER");

    if (site.type !== "WORDPRESS") throw new Error(`Unsupported site type for this action: ${site.type}`);

    const creds = JSON.parse(site.credentials) as WordPressCredentials;
    const appPassword = decrypt(creds.encryptedAppPassword);
    const credentials = btoa(`${creds.username}:${appPassword}`);

    // Use our custom endpoint
    const endpoint = `${site.url}/wp-json/optify/v1/publish`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: postData.title,
                content: postData.content,
                meta_description: postData.meta_description,
                focus_keyword: postData.focus_keyword,
                status: 'draft' // Default to draft for safety
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Publishing failed: ${response.status}`);
        }

        return { success: true, link: result.permalink, edit_link: result.edit_link };

    } catch (error: any) {
        console.error("Publishing Error:", error);
        throw new Error(error.message || "Failed to publish post");
    }
}

// Get the user's active/selected connected site (a personal UI pointer, like
// activeConnectedSiteId itself). Without a projectId, resolves across the whole org (used by
// dashboard's OverviewChart, which has no project selector yet) - the site it resolves to must
// still belong to the user's current organization, so a stale pointer from a former org can't
// leak another org's site. With a projectId, restricts both the stored pointer's validity and
// the fallback to that project's own connected sites.
export async function getActiveConnectedSite(projectId?: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const organization = await getActiveOrganization();
    if (!organization) return null;
    if (projectId) {
        await requireOrgProjectAccess(projectId, "MEMBER");
    }

    const scopeWhere = projectId ? { projectId } : { organizationId: organization.id };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { activeConnectedSiteId: true }
    });

    if (user?.activeConnectedSiteId) {
        const site = await prisma.connectedSite.findFirst({
            where: { id: user.activeConnectedSiteId, ...scopeWhere }
        });
        if (site) {
            return {
                id: site.id,
                name: site.name,
                url: site.url,
            };
        }
    }

    // Fallback to first site if no active site set (or the stored one is out of scope)
    const firstSite = await prisma.connectedSite.findFirst({
        where: scopeWhere,
        orderBy: { createdAt: "desc" }
    });

    if (firstSite) {
        // Auto-set as active
        await prisma.user.update({
            where: { id: session.user.id },
            data: { activeConnectedSiteId: firstSite.id }
        });
        return {
            id: firstSite.id,
            name: firstSite.name,
            url: firstSite.url,
        };
    }

    return null;
}

// Set the user's active/selected connected site
export async function setActiveConnectedSite(siteId: string) {
    const site = await prisma.connectedSite.findUnique({ where: { id: siteId } });
    if (!site) throw new Error("Site not found");
    const { userId } = await requireOrgProjectAccess(site.projectId, "MEMBER");

    await prisma.user.update({
        where: { id: userId },
        data: { activeConnectedSiteId: siteId }
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/autopilot");

    return { success: true };
}
