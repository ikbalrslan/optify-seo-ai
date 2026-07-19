"use server";

import { prisma } from "@/lib/db";
import { getActiveOrganization, requireOrgRole, requireOrgProjectAccess } from "@/lib/org";
import { revalidatePath } from "next/cache";

// Types
export type KeywordInput = {
    keyword: string;
    projectId?: string;
    opportunity?: "High" | "Medium" | "Low";
    difficulty?: number;
    volume?: number;
    cpc?: number;
};

// Keyword.projectId is required, and every Project belongs to exactly one organization, so
// org-scoped access is checked via that relation - no separate organizationId column needed
// on Keyword itself.
async function resolveProjectId(organizationId: string, projectId?: string): Promise<string> {
    if (projectId) {
        const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } });
        if (!project) {
            throw new Error("Project not found");
        }
        return project.id;
    }

    const project = await prisma.project.findFirst({ where: { organizationId }, orderBy: { createdAt: "asc" } });
    if (!project) {
        throw new Error("Create a project first before adding keywords");
    }
    return project.id;
}

export async function getKeywordsForProject(projectId: string) {
    await requireOrgProjectAccess(projectId, "MEMBER");

    return prisma.keyword.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
    });
}

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
    sortOrder: "asc" | "desc" = "desc",
    projectId?: string
) {
    const organization = await getActiveOrganization();
    if (!organization) {
        return [];
    }
    await requireOrgRole(organization.id, "MEMBER");

    const where: any = {
        project: projectId ? { id: projectId, organizationId: organization.id } : { organizationId: organization.id },
    };

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

export async function getKeywordStats(projectId?: string): Promise<KeywordStats> {
    const organization = await getActiveOrganization();
    if (!organization) {
        return { all: 0, recommended: 0, starred: 0, queued: 0, generated: 0 };
    }
    await requireOrgRole(organization.id, "MEMBER");

    const where = projectId ? { id: projectId, organizationId: organization.id } : { organizationId: organization.id };

    const [all, recommended, starred, queued, generated] = await Promise.all([
        prisma.keyword.count({ where: { project: where } }),
        prisma.keyword.count({ where: { project: where, opportunity: "High" } }),
        prisma.keyword.count({ where: { project: where, isStarred: true } }),
        prisma.keyword.count({ where: { project: where, isQueued: true } }),
        prisma.keyword.count({ where: { project: where, isGenerated: true } }),
    ]);

    return { all, recommended, starred, queued, generated };
}

// ============================================
// CREATE KEYWORD
// ============================================

export async function createKeyword(input: KeywordInput) {
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    const { userId } = await requireOrgRole(organization.id, "MEMBER");

    const projectId = await resolveProjectId(organization.id, input.projectId);

    const keyword = await prisma.keyword.create({
        data: {
            userId,
            projectId,
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

export async function bulkCreateKeywords(keywords: string[], projectId?: string) {
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    const { userId } = await requireOrgRole(organization.id, "MEMBER");

    // Filter empty strings and duplicates
    const uniqueKeywords = [...new Set(keywords.map(k => k.trim()).filter(k => k))];

    if (uniqueKeywords.length === 0) {
        throw new Error("No valid keywords provided");
    }

    const resolvedProjectId = await resolveProjectId(organization.id, projectId);

    // Create all keywords
    const created = await prisma.keyword.createMany({
        data: uniqueKeywords.map(keyword => ({
            userId,
            projectId: resolvedProjectId,
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
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    await requireOrgRole(organization.id, "MEMBER");

    const existing = await prisma.keyword.findFirst({
        where: { id, project: { organizationId: organization.id } },
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
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    await requireOrgRole(organization.id, "MEMBER");

    const existing = await prisma.keyword.findFirst({
        where: { id, project: { organizationId: organization.id } },
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
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    await requireOrgRole(organization.id, "MEMBER");

    const existing = await prisma.keyword.findFirst({
        where: { id, project: { organizationId: organization.id } },
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
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    await requireOrgRole(organization.id, "MEMBER");

    const existing = await prisma.keyword.findFirst({
        where: { id, project: { organizationId: organization.id } },
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
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    await requireOrgRole(organization.id, "MEMBER");

    const existing = await prisma.keyword.findFirst({
        where: { id, project: { organizationId: organization.id } },
    });
    if (!existing) {
        throw new Error("Keyword not found");
    }

    await prisma.keyword.update({
        where: { id },
        data: { isGenerated: true },
    });

    revalidatePath("/keywords");
    return { success: true };
}
