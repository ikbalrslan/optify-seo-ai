"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

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

    // Save to DB
    const encryptedPassword = encrypt(appPassword);

    // Extract site name from URL or generic
    const siteName = cleanUrl.replace(/^https?:\/\//, "");

    await prisma.wordPressSite.create({
        data: {
            userId: session.user.id,
            name: siteName,
            url: cleanUrl,
            username: username,
            encryptedAppPassword: encryptedPassword,
        }
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function getWordPressSites() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const sites = await prisma.wordPressSite.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    // Return without sensitive data
    return sites.map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        username: site.username,
        createdAt: site.createdAt,
    }));
}

export async function deleteWordPressSite(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    await prisma.wordPressSite.delete({
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

    const site = await prisma.wordPressSite.findUnique({
        where: { id: siteId, userId: session.user.id }
    });

    if (!site) throw new Error("Site not found");

    const appPassword = decrypt(site.encryptedAppPassword);
    const credentials = btoa(`${site.username}:${appPassword}`);

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
