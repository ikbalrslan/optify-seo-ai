"use server";

import { prisma } from "@/lib/db";
import { requireOrgProjectAccess } from "@/lib/org";
import { fetchTopRisingQueries } from "@/lib/seo/trends";
import { createKeyword } from "@/actions/keywords";
import { revalidatePath } from "next/cache";

function currentPeriod(): string {
    return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

// Next.js strips thrown Server Action error messages down to a generic digest-only string in
// production (see the identical note in src/actions/register.ts) - discoverKeywordsInternal
// throws (fine for the cron caller in autopilot.ts, which never crosses that boundary), but
// this client-facing wrapper catches it and returns the real message as data instead, so a
// SerpApi timeout actually reaches the UI as something the user can act on.
export async function discoverKeywords(
    projectId: string,
    seedKeyword: string
): Promise<
    | { success: true; top: Awaited<ReturnType<typeof getSnapshotsForPeriod>>["top"]; rising: Awaited<ReturnType<typeof getSnapshotsForPeriod>>["rising"] }
    | { success: false; error: string }
> {
    const { project } = await requireOrgProjectAccess(projectId, "MEMBER");
    try {
        const result = await discoverKeywordsInternal(project, seedKeyword);
        return { success: true, ...result };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to discover keywords" };
    }
}

// Auth-free variant for the cron context (mirrors generateBlogContent vs generateBlogPost in
// generate-blog.ts). Trusts the caller to have already resolved and scoped the project.
export async function discoverKeywordsInternal(project: { id: string; country: string }, seedKeyword: string) {
    const projectId = project.id;
    const period = currentPeriod();
    const trimmedSeed = seedKeyword.trim();
    if (!trimmedSeed) {
        throw new Error("Seed keyword is required");
    }

    const result = await fetchTopRisingQueries(trimmedSeed, project.country, "today 1-m");
    if (!result.success) {
        throw new Error(result.error);
    }

    const rows = [
        ...result.data.top.map(q => ({ type: "TOP", ...q })),
        ...result.data.rising.map(q => ({ type: "RISING", ...q })),
    ];

    for (const row of rows) {
        await prisma.keywordSnapshot.upsert({
            where: {
                projectId_seedKeyword_country_period_relatedQuery: {
                    projectId,
                    seedKeyword: trimmedSeed,
                    country: project.country,
                    period,
                    relatedQuery: row.query,
                },
            },
            update: {
                relativeValue: row.extractedValue,
                rawGrowthLabel: row.value,
                fetchedAt: new Date(),
            },
            create: {
                projectId,
                seedKeyword: trimmedSeed,
                country: project.country,
                period,
                type: row.type,
                relatedQuery: row.query,
                relativeValue: row.extractedValue,
                rawGrowthLabel: row.value,
            },
        });
    }

    revalidatePath("/generators/keyword");

    return getSnapshotsForPeriod(projectId, trimmedSeed, period);
}

async function getSnapshotsForPeriod(projectId: string, seedKeyword: string, period: string) {
    const snapshots = await prisma.keywordSnapshot.findMany({
        where: { projectId, seedKeyword: seedKeyword.trim(), period },
        orderBy: { relativeValue: "desc" },
    });

    return {
        top: snapshots.filter(s => s.type === "TOP"),
        rising: snapshots.filter(s => s.type === "RISING"),
    };
}

export async function getKeywordSnapshots(projectId: string, seedKeyword: string) {
    try {
        await requireOrgProjectAccess(projectId, "MEMBER");
    } catch {
        return { top: [], rising: [] };
    }

    return getSnapshotsForPeriod(projectId, seedKeyword, currentPeriod());
}

export async function promoteSnapshotToKeyword(snapshotId: string) {
    const snapshot = await prisma.keywordSnapshot.findUnique({ where: { id: snapshotId } });
    if (!snapshot) {
        throw new Error("Snapshot not found");
    }

    await requireOrgProjectAccess(snapshot.projectId, "MEMBER");

    // Rising queries can report growth in the thousands (Google's "Breakout" sentinel is 5000+),
    // which doesn't fit the same 0-100 scale as Top queries' relative popularity - clamp so the
    // Keywords table's volume column stays readable, and flag rising queries as high opportunity
    // since "trending up" is itself the signal, independent of its clamped display value.
    const volume = Math.min(snapshot.relativeValue, 100);
    const opportunity = snapshot.type === "RISING" ? "High" : volume >= 70 ? "High" : volume >= 40 ? "Medium" : "Low";

    return createKeyword({
        keyword: snapshot.relatedQuery,
        projectId: snapshot.projectId,
        volume,
        opportunity,
    });
}
