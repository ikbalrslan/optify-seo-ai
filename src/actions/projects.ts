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

export async function createProject(name: string, domain: string, country: string = "US") {
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

    await prisma.project.update({
        where: { id: projectId },
        data: {
            autopilotEnabled: input.autopilotEnabled,
            ...(input.autopilotSeedKeyword !== undefined && { autopilotSeedKeyword: input.autopilotSeedKeyword.trim() || null }),
            ...(input.autopilotConnectedSiteId !== undefined && { autopilotConnectedSiteId: input.autopilotConnectedSiteId }),
        },
    });

    revalidatePath("/generators/keyword");
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

    const subscription = await prisma.subscription.findUnique({ where: { projectId } });
    if (subscription) {
        await requireOrgRole(project.organizationId, "OWNER");
        await cancelSiteSubscriptionItem(project.organizationId, subscription.stripeSubscriptionItemId);
    }

    await prisma.project.delete({ where: { id: projectId } });

    if (subscription) {
        await recomputeOrgDiscount(project.organizationId);
    }

    revalidatePath("/organization/billing");
    revalidatePath("/generators/keyword");
    return { success: true };
}
