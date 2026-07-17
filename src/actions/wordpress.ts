"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

type WordPressCredentials = {
    username: string;
    encryptedAppPassword: string;
};

export async function addWordPressSite(url: string, username: string, appPassword: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

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
            userId: session.user.id,
            type: "WORDPRESS",
            name: siteName,
            url: cleanUrl,
            credentials: JSON.stringify(credentials),
        }
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function getConnectedSites() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const sites = await prisma.connectedSite.findMany({
        where: { userId: session.user.id },
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
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    await prisma.connectedSite.delete({
        where: {
            id: id,
            userId: session.user.id
        }
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function publishToWordPress(siteId: string, postData: { title: string, content: string, meta_description?: string, focus_keyword?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const site = await prisma.connectedSite.findUnique({
        where: { id: siteId, userId: session.user.id }
    });

    if (!site) throw new Error("Site not found");
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

// Get the user's active/selected connected site
export async function getActiveConnectedSite() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { activeConnectedSiteId: true }
    });

    if (user?.activeConnectedSiteId) {
        const site = await prisma.connectedSite.findUnique({
            where: { id: user.activeConnectedSiteId, userId: session.user.id }
        });
        if (site) {
            return {
                id: site.id,
                name: site.name,
                url: site.url,
            };
        }
    }

    // Fallback to first site if no active site set
    const firstSite = await prisma.connectedSite.findFirst({
        where: { userId: session.user.id },
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
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    // Verify the site belongs to the user
    const site = await prisma.connectedSite.findUnique({
        where: { id: siteId, userId: session.user.id }
    });

    if (!site) throw new Error("Site not found");

    await prisma.user.update({
        where: { id: session.user.id },
        data: { activeConnectedSiteId: siteId }
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/autopilot");

    return { success: true };
}
