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
