"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitFeedback(data: { type: "FEATURE" | "BUG", title: string, description: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    if (!data.title || !data.description) {
        throw new Error("Title and description are required");
    }

    const feedback = await prisma.feedback.create({
        data: {
            userId: session.user.id,
            type: data.type,
            title: data.title,
            description: data.description,
            status: "OPEN",
        }
    });

    revalidatePath("/feedback");
    return { success: true, feedback };
}

export async function getFeatureRequests() {
    const session = await auth();
    const userId = session?.user?.id;

    const requests = await prisma.feedback.findMany({
        where: {
            OR: [
                { type: "FEATURE" },
                {
                    type: "BUG",
                    userId: userId // Only show my own bugs
                }
            ]
        },
        include: {
            user: {
                select: { name: true, image: true }
            },
            userUpvotes: userId ? {
                where: { userId }
            } : false
        },
        orderBy: [
            { upvotes: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    return requests.map(req => ({
        ...req,
        // Check if the user has upvoted this request
        hasUpvoted: req.userUpvotes?.length > 0
    }));
}

export async function toggleUpvote(feedbackId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const userId = session.user.id;

    // Check if already upvoted
    const existingUpvote = await prisma.feedbackUpvote.findUnique({
        where: {
            feedbackId_userId: {
                feedbackId,
                userId
            }
        }
    });

    if (existingUpvote) {
        // Remove upvote
        await prisma.$transaction([
            prisma.feedbackUpvote.delete({
                where: { id: existingUpvote.id }
            }),
            prisma.feedback.update({
                where: { id: feedbackId },
                data: { upvotes: { decrement: 1 } }
            })
        ]);
        revalidatePath("/feedback");
        return { success: true, upvoted: false };
    } else {
        // Add upvote
        await prisma.$transaction([
            prisma.feedbackUpvote.create({
                data: {
                    feedbackId,
                    userId
                }
            }),
            prisma.feedback.update({
                where: { id: feedbackId },
                data: { upvotes: { increment: 1 } }
            })
        ]);
        revalidatePath("/feedback");
        return { success: true, upvoted: true };
    }
}
