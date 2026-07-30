"use server";

import { prisma } from "@/lib/db";
import { getActiveOrganization, requireOrgRole, requireOrgProjectAccess } from "@/lib/org";
import { recomputeOrgDiscount, cancelSiteSubscriptionItem } from "@/lib/billing";
import { revalidatePath } from "next/cache";

// Projects ("sites") are shared across an organization - any MEMBER can see and use them, but
// creating/renaming/deleting one (structural site management) requires ADMIN, same as
// ConnectedSite in wordpress.ts.

export async function getProjects() {
    const organization = await getActiveOrganization();
    if (!organization) {
        return [];
    }
    await requireOrgRole(organization.id, "MEMBER");

    return prisma.project.findMany({
        where: { organizationId: organization.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function createProject(
    name: string,
    domain: string,
    country: string = "US",
    extra?: { description?: string; language?: string }
) {
    const organization = await getActiveOrganization();
    if (!organization) {
        throw new Error("No active organization");
    }
    const { userId } = await requireOrgRole(organization.id, "ADMIN");

    if (!name.trim() || !domain.trim()) {
        throw new Error("Name and domain are required");
    }

    const project = await prisma.project.create({
        data: {
            userId,
            organizationId: organization.id,
            name: name.trim(),
            domain: domain.trim(),
            country,
            description: extra?.description?.trim() || null,
            language: extra?.language || null,
        },
    });

    revalidatePath("/generators/keyword");
    return project;
}

export async function updateProjectAutopilotSettings(
    projectId: string,
    input: { autopilotEnabled: boolean; autopilotSeedKeyword?: string; autopilotConnectedSiteId?: string | null }
) {
    const { project } = await requireOrgProjectAccess(projectId, "ADMIN");

    if (input.autopilotEnabled && !input.autopilotSeedKeyword?.trim() && !project.autopilotSeedKeyword) {
        throw new Error("A seed keyword is required to enable autopilot");
    }

    // The monthly discovery cron only runs on the 1st - without this, a project enabled on,
    // say, the 15th would sit with zero scheduled posts until the 1st of next month.
    const isNewlyEnabled = input.autopilotEnabled && !project.autopilotEnabled;

    await prisma.project.update({
        where: { id: projectId },
        data: {
            autopilotEnabled: input.autopilotEnabled,
            ...(input.autopilotSeedKeyword !== undefined && { autopilotSeedKeyword: input.autopilotSeedKeyword.trim() || null }),
            ...(input.autopilotConnectedSiteId !== undefined && { autopilotConnectedSiteId: input.autopilotConnectedSiteId }),
        },
    });

    revalidatePath("/generators/keyword");

    if (isNewlyEnabled) {
        // Not awaited - discovery+generation can take minutes (one Claude call per day left in
        // the month), and the user shouldn't have to wait for that just to save a toggle. This
        // process stays alive as a long-running container (not serverless), so the background
        // work continues after this response is sent. Errors are only logged, not surfaced to
        // this action's caller, since by then the toggle has already saved successfully.
        import("@/actions/autopilot").then(({ runAutopilotDiscoveryAndScheduling }) =>
            runAutopilotDiscoveryAndScheduling(projectId).catch(err =>
                console.error(`[Autopilot] Immediate scheduling failed for project ${projectId}:`, err)
            )
        );
    }

    return { success: true };
}

// Deletes a website entirely - not just its subscription (that's removeSiteFromSubscription in
// stripe.ts, which only cancels billing and keeps the site). Cascades (see schema.prisma) take
// care of Analysis/Keyword/KeywordSnapshot/ScheduledPost/ConnectedSite/Subscription rows, but a
// raw prisma.project.delete() would silently drop an active Subscription's DB row without ever
// canceling the real Stripe subscription item - so if one exists, that has to happen first, and
// only an OWNER (not just ADMIN) can authorize canceling real billing.
export async function deleteProject(projectId: string): Promise<{ success: true } | { success: false; error: string }> {
    const { project } = await requireOrgProjectAccess(projectId, "ADMIN");

    // A CANCELED row here means nothing left to cancel on Stripe's side - only an ACTIVE
    // subscription needs the OWNER escalation and the actual cancellation call.
    const subscription = await prisma.subscription.findUnique({ where: { projectId } });
    const hasActiveSubscription = subscription?.status === "ACTIVE";
    if (hasActiveSubscription) {
        await requireOrgRole(project.organizationId, "OWNER");
        await cancelSiteSubscriptionItem(project.organizationId, projectId);
    }

    await prisma.project.delete({ where: { id: projectId } });

    if (hasActiveSubscription) {
        await recomputeOrgDiscount(project.organizationId);
    }

    revalidatePath("/organization/billing");
    revalidatePath("/generators/keyword");
    return { success: true };
}
