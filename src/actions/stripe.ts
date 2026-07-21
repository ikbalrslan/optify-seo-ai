"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireOrgRole } from "@/lib/org";
import { recomputeOrgDiscount, cancelSiteSubscriptionItem, addToSharedSubscriptionItem } from "@/lib/billing";
import { redirect } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getProjectWithOrg(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
    });
    if (!project?.organizationId || !project.organization) {
        throw new Error("Project not found");
    }
    return { project, organization: project.organization };
}

// There's a single all-inclusive Plan (see src/config/plans.ts) - every paid site subscribes
// to it, so callers don't pick a plan, they just subscribe.
async function getTheOnlyPlan() {
    return prisma.plan.findFirst({ where: { stripePriceId: { not: null } } });
}

/**
 * Starts checkout for an organization's first paid site. Only for organizations with no
 * Stripe subscription yet - once one exists, additional sites go through
 * addSiteToSubscription() instead (no checkout redirect needed, a payment method is already
 * on file).
 */
export async function createOrgCheckoutSession(
    projectId: string
): Promise<{ success: false; error: string } | undefined> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    const { project, organization } = await getProjectWithOrg(projectId);
    await requireOrgRole(organization.id, "OWNER");

    if (organization.stripeSubscriptionId) {
        return { success: false, error: "This organization already has a subscription - use Add Site instead." };
    }

    // A CANCELED row is expected here (re-subscribing a site that was previously removed) -
    // canceling never deletes the Subscription row, just marks its status, so only an ACTIVE
    // one should actually block a fresh checkout.
    const existingSub = await prisma.subscription.findUnique({ where: { projectId } });
    if (existingSub?.status === "ACTIVE") {
        return { success: false, error: "This site already has an active subscription." };
    }

    const plan = await getTheOnlyPlan();
    if (!plan?.stripePriceId) {
        return { success: false, error: "No plan is available for checkout yet." };
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        metadata: { organizationId: organization.id, projectId: project.id, planId: plan.id },
        // Reuse the org's existing Stripe Customer if one's already on file (e.g. it fully
        // canceled a previous subscription and is starting a new one) instead of customer_email,
        // which would spin up a brand new Customer object and orphan the old one's payment
        // method/invoice history.
        ...(organization.stripeCustomerId
            ? { customer: organization.stripeCustomerId }
            : { customer_email: session.user.email }),
        success_url: `${APP_URL}/organization/billing?success=true`,
        cancel_url: `${APP_URL}/organization/billing?canceled=true`,
    });

    if (!checkoutSession.url) {
        return { success: false, error: "Failed to create checkout session." };
    }

    redirect(checkoutSession.url);
}

/**
 * Adds another paid site to an organization that already has a Stripe subscription - no
 * checkout redirect, since a payment method is already on file. Stripe prorates the new item
 * automatically.
 */
export async function addSiteToSubscription(
    projectId: string
): Promise<{ success: true } | { success: false; error: string }> {
    const { project, organization } = await getProjectWithOrg(projectId);
    await requireOrgRole(organization.id, "OWNER");

    if (!organization.stripeSubscriptionId) {
        return { success: false, error: "This organization has no active subscription yet - use checkout for its first site instead." };
    }

    // Same as createOrgCheckoutSession - a CANCELED row here means re-subscribing a previously
    // removed site, which is expected and fine; only an already-ACTIVE one should block this.
    const existingSub = await prisma.subscription.findUnique({ where: { projectId } });
    if (existingSub?.status === "ACTIVE") {
        return { success: false, error: "This site already has an active subscription." };
    }

    const plan = await getTheOnlyPlan();
    if (!plan?.stripePriceId) {
        return { success: false, error: "No plan is available yet." };
    }

    // Every site shares the one Price (see src/config/plans.ts), and Stripe refuses to add a
    // second item with a Price that's already on the subscription - so this bumps the existing
    // shared item's quantity instead of creating a new item.
    const stripeSubscriptionItemId = await addToSharedSubscriptionItem(
        organization.id,
        organization.stripeSubscriptionId,
        plan.stripePriceId
    );

    // upsert, not create - projectId is unique, and a previously-canceled row (existingSub, if
    // any) needs to be reactivated in place rather than crashing on that constraint.
    await prisma.subscription.upsert({
        where: { projectId },
        create: {
            organizationId: organization.id,
            projectId: project.id,
            planId: plan.id,
            status: "ACTIVE",
            stripeSubscriptionItemId,
        },
        update: {
            planId: plan.id,
            status: "ACTIVE",
            stripeSubscriptionItemId,
            endDate: null,
        },
    });

    await recomputeOrgDiscount(organization.id);

    return { success: true };
}

/**
 * Removes a site's paid subscription (prorated). The site itself isn't deleted, just its
 * billing - Phase 3's ownership retrofit determines what happens to a site with no active
 * subscription.
 */
export async function removeSiteFromSubscription(
    projectId: string
): Promise<{ success: true } | { success: false; error: string }> {
    const { organization } = await getProjectWithOrg(projectId);
    await requireOrgRole(organization.id, "OWNER");

    // Canceling never deletes the row (just marks its status) - checking existence alone would
    // let this run again on an already-canceled site, decrementing the shared item's quantity
    // (and the bill) a second time for a site that was already removed.
    const subscription = await prisma.subscription.findUnique({ where: { projectId } });
    if (!subscription || subscription.status !== "ACTIVE") {
        return { success: false, error: "This site has no active subscription to remove." };
    }

    await cancelSiteSubscriptionItem(organization.id, projectId);

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELED", endDate: new Date() },
    });

    await recomputeOrgDiscount(organization.id);

    return { success: true };
}

/**
 * Redirects to Stripe's Customer Portal for self-serve payment method / invoice management.
 */
export async function createBillingPortalSession(
    organizationId: string
): Promise<{ success: false; error: string } | undefined> {
    await requireOrgRole(organizationId, "OWNER");

    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { stripeCustomerId: true },
    });

    if (!organization?.stripeCustomerId) {
        return { success: false, error: "No billing account yet - add your first paid site to set one up." };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: organization.stripeCustomerId,
        return_url: `${APP_URL}/organization/billing`,
    });

    redirect(portalSession.url);
}
