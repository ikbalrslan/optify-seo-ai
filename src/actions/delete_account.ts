"use server";

import { auth, signOut } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteAccount() {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    try {
        await prisma.user.delete({
            where: {
                email: session.user.email,
            },
        });

        await signOut({ redirectTo: "/?account_deleted=true" });
    } catch (error) {
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            throw error;
        }
        console.error("Error deleting account:", error);
        throw new Error("Failed to delete account");
    }
}
