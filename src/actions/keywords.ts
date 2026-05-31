"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Types
export type KeywordInput = {
    keyword: string;
    opportunity?: "High" | "Medium" | "Low";
    difficulty?: number;
    volume?: number;
    cpc?: number;
};

export type KeywordFilter = "all" | "recommended" | "starred" | "queued" | "generated";

export type KeywordStats = {
    all: number;
    recommended: number;
    starred: number;
    queued: number;
    generated: number;
};

// ============================================
// GET KEYWORDS
// ============================================

export async function getKeywords(
    filter: KeywordFilter = "all",
    search?: string,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const where: any = { userId: session.user.id };

    // Apply filter
    switch (filter) {
        case "recommended":
            where.opportunity = "High";
            break;
        case "starred":
            where.isStarred = true;
            break;
        case "queued":
            where.isQueued = true;
            break;
        case "generated":
            where.isGenerated = true;
            break;
    }

    // Apply search
    if (search && search.trim()) {
        where.keyword = { contains: search.trim(), mode: "insensitive" };
    }

    const keywords = await prisma.keyword.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
    });

    return keywords;
}

// ============================================
// GET KEYWORD STATS
// ============================================

export async function getKeywordStats(): Promise<KeywordStats> {
    const session = await auth();
    if (!session?.user?.id) {
        return { all: 0, recommended: 0, starred: 0, queued: 0, generated: 0 };
    }

    const userId = session.user.id;

    const [all, recommended, starred, queued, generated] = await Promise.all([
        prisma.keyword.count({ where: { userId } }),
        prisma.keyword.count({ where: { userId, opportunity: "High" } }),
        prisma.keyword.count({ where: { userId, isStarred: true } }),
        prisma.keyword.count({ where: { userId, isQueued: true } }),
        prisma.keyword.count({ where: { userId, isGenerated: true } }),
    ]);

    return { all, recommended, starred, queued, generated };
}

// ============================================
// CREATE KEYWORD
// ============================================

export async function createKeyword(input: KeywordInput) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const keyword = await prisma.keyword.create({
        data: {
            userId: session.user.id,
            keyword: input.keyword,
            opportunity: input.opportunity || "Medium",
            difficulty: input.difficulty ?? 50,
            volume: input.volume ?? 0,
            cpc: input.cpc ?? 0,
        },
    });

    revalidatePath("/keywords");
    return { success: true, id: keyword.id };
}

// ============================================
// BULK CREATE KEYWORDS
// ============================================

export async function bulkCreateKeywords(keywords: string[]) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    // Filter empty strings and duplicates
    const uniqueKeywords = [...new Set(keywords.map(k => k.trim()).filter(k => k))];

    if (uniqueKeywords.length === 0) {
        throw new Error("No valid keywords provided");
    }

    const userId = session.user.id;

    // Create all keywords
    const created = await prisma.keyword.createMany({
        data: uniqueKeywords.map(keyword => ({
            userId,
            keyword,
            opportunity: "Medium" as const,
            difficulty: 50,
            volume: 0,
            cpc: 0,
        })),
    });

    revalidatePath("/keywords");
    return { success: true, count: created.count };
}

// ============================================
// UPDATE KEYWORD
// ============================================

export async function updateKeyword(id: string, input: Partial<KeywordInput>) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const existing = await prisma.keyword.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        throw new Error("Keyword not found");
    }

    await prisma.keyword.update({
        where: { id },
        data: input,
    });

    revalidatePath("/keywords");
    return { success: true };
}

// ============================================
// DELETE KEYWORD
// ============================================

export async function deleteKeyword(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const existing = await prisma.keyword.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        throw new Error("Keyword not found");
    }

    await prisma.keyword.delete({ where: { id } });

    revalidatePath("/keywords");
    return { success: true };
}

// ============================================
// TOGGLE STAR
// ============================================

export async function toggleStarKeyword(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const existing = await prisma.keyword.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        throw new Error("Keyword not found");
    }

    await prisma.keyword.update({
        where: { id },
        data: { isStarred: !existing.isStarred },
    });

    revalidatePath("/keywords");
    return { success: true, isStarred: !existing.isStarred };
}

// ============================================
// TOGGLE QUEUE
// ============================================

export async function toggleQueueKeyword(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const existing = await prisma.keyword.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        throw new Error("Keyword not found");
    }

    await prisma.keyword.update({
        where: { id },
        data: { isQueued: !existing.isQueued },
    });

    revalidatePath("/keywords");
    return { success: true, isQueued: !existing.isQueued };
}

// ============================================
// MARK AS GENERATED
// ============================================

export async function markKeywordAsGenerated(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    await prisma.keyword.update({
        where: { id },
        data: { isGenerated: true },
    });

    revalidatePath("/keywords");
    return { success: true };
}
