import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// Fixed, well-known Coupon IDs created once by prisma/seed-stripe-plans.ts - hardcoding them
// here avoids an extra env-var/lookup layer, since Stripe lets us choose Coupon IDs ourselves.
const VOLUME_DISCOUNT_TIERS: { minSites: number; couponId: string }[] = [
    { minSites: 20, couponId: "optifyseo-vol-20" },
    { minSites: 5, couponId: "optifyseo-vol-15" },
    { minSites: 2, couponId: "optifyseo-vol-10" },
];

function couponForSiteCount(count: number): string | null {
    for (const tier of VOLUME_DISCOUNT_TIERS) {
        if (count >= tier.minSites) return tier.couponId;
    }
    return null;
}

/**
 * Every site subscribes to the one shared Price (see src/config/plans.ts's single ALL_IN_PLAN),
 * and Stripe refuses to add a second subscription item using a Price that's already on the
 * subscription ("can't be added... an existing Subscription Item is already using that Price") -
 * it expects the existing item's quantity bumped instead. So an org's paid sites all share ONE
 * Stripe subscription item; quantity = how many are currently active. Every Subscription row for
 * the org stores that same shared stripeSubscriptionItemId.
 */

/**
 * Removes one site from the org's shared subscription item - decrements its quantity by 1, or
 * (mirroring the same "must have at least one active plan" constraint from
 * subscriptionItems.del) cancels the whole Stripe Subscription if this is the org's last
 * remaining active site, clearing Organization.stripeSubscriptionId to match (same as the
 * customer.subscription.deleted webhook already does for an out-of-band cancellation). Shared by
 * removeSiteFromSubscription (src/actions/stripe.ts) and deleteProject (src/actions/projects.ts).
 */
export async function cancelSiteSubscriptionItem(
    organizationId: string,
    excludeProjectId: string
): Promise<void> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { stripeSubscriptionId: true },
    });
    if (!organization?.stripeSubscriptionId) return;

    const otherActive = await prisma.subscription.findFirst({
        where: { organizationId, status: "ACTIVE", projectId: { not: excludeProjectId } },
    });

    if (otherActive?.stripeSubscriptionItemId) {
        const item = await stripe.subscriptionItems.retrieve(otherActive.stripeSubscriptionItemId);
        await stripe.subscriptionItems.update(otherActive.stripeSubscriptionItemId, {
            quantity: Math.max(1, (item.quantity ?? 1) - 1),
            proration_behavior: "create_prorations",
        });
    } else {
        await stripe.subscriptions.cancel(organization.stripeSubscriptionId);
        await prisma.organization.update({
            where: { id: organizationId },
            data: { stripeSubscriptionId: null },
        });
    }
}

/**
 * Adds one more site to the org's shared subscription item - increments its quantity by 1 if one
 * already exists (the normal case, an org adding its 2nd+ paid site), or creates it fresh at
 * quantity 1 if somehow none of the org's other ACTIVE sites have one on record yet (shouldn't
 * normally happen once stripeSubscriptionId is set, but falls back safely rather than assuming).
 */
export async function addToSharedSubscriptionItem(
    organizationId: string,
    stripeSubscriptionId: string,
    stripePriceId: string
): Promise<string> {
    const existing = await prisma.subscription.findFirst({
        where: { organizationId, status: "ACTIVE", stripeSubscriptionItemId: { not: null } },
    });

    if (existing?.stripeSubscriptionItemId) {
        const item = await stripe.subscriptionItems.retrieve(existing.stripeSubscriptionItemId);
        await stripe.subscriptionItems.update(existing.stripeSubscriptionItemId, {
            quantity: (item.quantity ?? 0) + 1,
            proration_behavior: "create_prorations",
        });
        return existing.stripeSubscriptionItemId;
    }

    const item = await stripe.subscriptionItems.create({
        subscription: stripeSubscriptionId,
        price: stripePriceId,
        quantity: 1,
    });
    return item.id;
}

/**
 * Recomputes and applies the org-wide volume discount on its Stripe subscription, based on
 * how many of its sites currently have an active paid Subscription. Call this at the end of
 * every add-site/remove-site action. A no-op if the org has no Stripe subscription yet (i.e.
 * its first site hasn't completed checkout).
 */
export async function recomputeOrgDiscount(organizationId: string): Promise<void> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { stripeSubscriptionId: true },
    });

    if (!organization?.stripeSubscriptionId) {
        return;
    }

    const activeSiteCount = await prisma.subscription.count({
        where: { organizationId, status: "ACTIVE" },
    });

    const couponId = couponForSiteCount(activeSiteCount);

    if (couponId) {
        await stripe.subscriptions.update(organization.stripeSubscriptionId, {
            discounts: [{ coupon: couponId }],
        });
        return;
    }

    // Passing `discounts: []` does NOT clear an existing discount in this API version - it's
    // a silent no-op, leaving a stale coupon applied forever. The dedicated deleteDiscount
    // endpoint is the only way to actually remove it, but it errors if none is currently
    // applied, so check first.
    const stripeSubscription = await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
    if (stripeSubscription.discounts && stripeSubscription.discounts.length > 0) {
        await stripe.subscriptions.deleteDiscount(organization.stripeSubscriptionId);
    }
}
