"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type AutopilotStats = {
    scheduled: number;
    published: number;
    failed: number;
};

export type StatsPeriod = "month" | "all";

// Toggle this to true for testing the animation
const USE_MOCK_DATA = true;

/**
 * Get autopilot stats for a given period
 */
export async function getAutopilotStats(period: StatsPeriod = "month"): Promise<AutopilotStats> {
    // Return mock data for testing animation
    if (USE_MOCK_DATA) {
        if (period === "month") {
            return { scheduled: 12, published: 56, failed: 3 };
        } else {
            return { scheduled: 45, published: 187, failed: 8 };
        }
    }

    const session = await auth();
    if (!session?.user?.id) {
        return { scheduled: 0, published: 0, failed: 0 };
    }

    const now = new Date();

    // Build where clause based on period
    const whereClause: { userId: string; scheduledDate?: { gte: Date; lte: Date } } = {
        userId: session.user.id,
    };

    if (period === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        whereClause.scheduledDate = {
            gte: startOfMonth,
            lte: endOfMonth
        };
    }

    const posts = await prisma.scheduledPost.findMany({
        where: whereClause,
        select: { status: true }
    });

    return {
        scheduled: posts.filter((p: { status: string }) => p.status === "SCHEDULED").length,
        published: posts.filter((p: { status: string }) => p.status === "PUBLISHED").length,
        failed: posts.filter((p: { status: string }) => p.status === "FAILED").length,
    };
}

