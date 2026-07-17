"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { fetchTopRisingQueries } from "@/lib/seo/trends";
import { createKeyword } from "@/actions/keywords";
import { revalidatePath } from "next/cache";

function currentPeriod(): string {
    return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export async function discoverKeywords(projectId: string, seedKeyword: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.user.id },
    });
    if (!project) {
        throw new Error("Project not found");
    }

    const period = currentPeriod();
    const trimmedSeed = seedKeyword.trim();
    if (!trimmedSeed) {
        throw new Error("Seed keyword is required");
    }

    const result = await fetchTopRisingQueries(trimmedSeed, project.country, "today 1-m");
    if (!result) {
        throw new Error("Failed to fetch keyword data from SerpApi");
    }

    const rows = [
        ...result.top.map(q => ({ type: "TOP", ...q })),
        ...result.rising.map(q => ({ type: "RISING", ...q })),
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

    return getKeywordSnapshots(projectId, trimmedSeed);
}

export async function getKeywordSnapshots(projectId: string, seedKeyword: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { top: [], rising: [] };
    }

    const period = currentPeriod();
    const snapshots = await prisma.keywordSnapshot.findMany({
        where: { projectId, seedKeyword: seedKeyword.trim(), period },
        orderBy: { relativeValue: "desc" },
    });

    return {
        top: snapshots.filter(s => s.type === "TOP"),
        rising: snapshots.filter(s => s.type === "RISING"),
    };
}

export async function promoteSnapshotToKeyword(snapshotId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const snapshot = await prisma.keywordSnapshot.findFirst({
        where: { id: snapshotId, project: { userId: session.user.id } },
    });
    if (!snapshot) {
        throw new Error("Snapshot not found");
    }

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
