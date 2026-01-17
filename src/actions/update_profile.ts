"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateProfile(name: string) {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    if (!name || name.trim().length === 0) {
        throw new Error("Name is required");
    }

    try {
        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                name: name.trim(),
            },
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error("Failed to update profile");
    }
}
