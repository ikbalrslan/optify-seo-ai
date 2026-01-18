"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

export async function updateApiKey(apiKey: string) {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error("API Key is required");
    }

    if (!apiKey.trim().startsWith("sk-")) {
        // OpenRouter keys also often start with sk-or- or similar, but generally verify 'sk-' prefix broadly.
        // Assuming user input "sk-or-..." matches "sk-" check.
        // If specific check is needed: 
    }

    // Simplest check: just ensure it starts with sk- (which matches sk-or-...)
    // But user specifically said "sk-or-v1" which effectively starts with "sk-". 
    // Wait, "sk-" check ALREADY covers "sk-or-". 
    // Double check if I need to do anything. 
    // "sk-or-v1..." STARTS WITH "sk-". So the existing regex/check PASSES. 
    // However, I will update the error message to be more inclusive/specific if it somehow fails, 
    // or just leave it if it works. 

    // Actually, let's explicitely allow it or ensure no whitespace issues.
    if (!apiKey.trim().startsWith("sk-")) {
        throw new Error("Invalid API Key format. Must start with 'sk-'");
    }

    try {
        const encryptedKey = encrypt(apiKey.trim());

        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                encryptedOpenAiKey: encryptedKey,
            },
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating API Key:", error);
        throw new Error("Failed to update API Key");
    }
}
