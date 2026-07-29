"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveOrganization, requireOrgRole, requireOrgProjectAccess } from "@/lib/org";
import { createProject } from "@/actions/projects";
import { revalidatePath } from "next/cache";

const MAX_TAGS = 7;

interface BusinessStepInput {
    domain: string;
    name: string;
    country: string;
    language: string;
    description?: string;
}

/**
 * Business step of the onboarding wizard. Idempotent by design: if the org already has a
 * Project (e.g. the user refreshed mid-flow, or clicked Back into this step after already
 * continuing once), this updates that Project in place instead of creating a second one, since
 * src/app/onboarding/page.tsx re-renders this step whenever an existing Project is found.
 */
export async function completeBusinessStep(
    input: BusinessStepInput
): Promise<{ success: true; projectId: string } | { success: false; error: string }> {
    if (!input.name.trim() || !input.domain.trim()) {
        return { success: false, error: "Business name and website are required" };
    }

    const organization = await getActiveOrganization();
    if (!organization) {
        return { success: false, error: "No organization found" };
    }

    try {
        const existing = await prisma.project.findFirst({ where: { organizationId: organization.id } });

        if (existing) {
            await requireOrgRole(organization.id, "ADMIN");
            const project = await prisma.project.update({
                where: { id: existing.id },
                data: {
                    name: input.name.trim(),
                    domain: input.domain.trim(),
                    country: input.country,
                    description: input.description?.trim() || null,
                    language: input.language || "English",
                },
            });
            revalidatePath("/onboarding");
            return { success: true, projectId: project.id };
        }

        const project = await createProject(input.name, input.domain, input.country, {
            description: input.description,
            language: input.language || "English",
        });
        revalidatePath("/onboarding");
        return { success: true, projectId: project.id };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to save" };
    }
}

/**
 * Audience & Competitors step. Replaces the full set each time (delete + recreate Competitor
 * rows) rather than diffing, since this is a small bounded list (max 7) edited as a whole via
 * the step's tag inputs, not incrementally elsewhere.
 */
export async function completeAudienceCompetitorsStep(
    projectId: string,
    targetAudiences: string[],
    competitorDomains: string[]
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        await requireOrgProjectAccess(projectId, "MEMBER");

        const audiences = targetAudiences.map((a) => a.trim()).filter(Boolean).slice(0, MAX_TAGS);
        const competitors = competitorDomains.map((c) => c.trim()).filter(Boolean).slice(0, MAX_TAGS);

        await prisma.project.update({
            where: { id: projectId },
            data: { targetAudiences: JSON.stringify(audiences) },
        });
        await prisma.competitor.deleteMany({ where: { projectId } });
        if (competitors.length > 0) {
            await prisma.competitor.createMany({
                data: competitors.map((domain) => ({ projectId, domain })),
            });
        }

        revalidatePath("/onboarding");
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to save" };
    }
}

interface ArticlesStepInput {
    autoPublish: boolean;
    articleStyle: string;
    instructions?: string;
    internalLinks: number;
    imageStyle: string;
}

/**
 * Articles step. Persists default article-generation preferences onto the Project. Not yet
 * consumed by src/actions/generate-blog.ts or src/actions/autopilot.ts - both still hardcode
 * their own tone/length/language/publishStatus literals (see field comments in
 * prisma/schema.prisma). Wiring these defaults into actual generation is a separate follow-up.
 */
export async function completeArticlesStep(
    projectId: string,
    input: ArticlesStepInput
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        await requireOrgProjectAccess(projectId, "MEMBER");

        await prisma.project.update({
            where: { id: projectId },
            data: {
                autoPublishArticles: input.autoPublish,
                articleStyle: input.articleStyle,
                articleInstructions: input.instructions?.trim() || null,
                internalLinksPerArticle: Math.max(0, Math.min(10, input.internalLinks)),
                articleImageStyle: input.imageStyle,
            },
        });

        revalidatePath("/onboarding");
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to save" };
    }
}

/**
 * Marks the wizard finished. Deliberately just a DB write with no session/JWT update - the
 * completion check (src/lib/onboarding.ts, gated in src/app/(app)/layout.tsx) reads Prisma
 * fresh on every request, so the very next navigation to a (app) route already sees this.
 */
export async function completeOnboarding(): Promise<{ success: true } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { hasCompletedOnboarding: true },
    });

    return { success: true };
}
