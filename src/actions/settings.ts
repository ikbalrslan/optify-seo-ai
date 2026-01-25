"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";



export async function updateWordpressKey(key: string) {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    if (!key || key.trim().length === 0) {
        throw new Error("WordPress Key is required");
    }

    try {
        const encryptedKey = encrypt(key.trim());

        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                encryptedWordpressKey: encryptedKey,
            },
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating WordPress Key:", error);
        throw new Error("Failed to update WordPress Key");
    }
}
