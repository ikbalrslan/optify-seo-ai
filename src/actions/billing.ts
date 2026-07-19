"use server";

import { prisma } from "@/lib/db";
import { requireOrgRole } from "@/lib/org";

// There's a single all-inclusive Plan (see src/config/plans.ts) - every paid site subscribes
// to it.
export async function getPlan() {
    return prisma.plan.findFirst({ where: { stripePriceId: { not: null } } });
}

const VOLUME_DISCOUNT_TIERS = [
    { minSites: 20, percentOff: 20 },
    { minSites: 5, percentOff: 15 },
    { minSites: 2, percentOff: 10 },
];

function discountForSiteCount(count: number): number {
    for (const tier of VOLUME_DISCOUNT_TIERS) {
        if (count >= tier.minSites) return tier.percentOff;
    }
    return 0;
}

export async function getOrgBillingSummary(organizationId: string) {
    const { role: callerRole } = await requireOrgRole(organizationId, "MEMBER");

    const organization = await prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
        select: { stripeCustomerId: true },
    });

    const projects = await prisma.project.findMany({
        where: { organizationId },
        include: { subscription: { include: { plan: true } } },
        orderBy: { createdAt: "asc" },
    });

    const activeSubscriptions = projects
        .map((p) => p.subscription)
        .filter((s): s is NonNullable<typeof s> => !!s && s.status === "ACTIVE");

    const grossTotal = activeSubscriptions.reduce((sum, s) => sum + s.plan.price, 0);
    const discountPercent = discountForSiteCount(activeSubscriptions.length);
    const netTotal = grossTotal * (1 - discountPercent / 100);

    return {
        hasPaymentMethod: !!organization.stripeCustomerId,
        callerRole,
        sites: projects.map((p) => ({
            id: p.id,
            name: p.name,
            domain: p.domain,
            plan: p.subscription
                ? { id: p.subscription.plan.id, name: p.subscription.plan.name, price: p.subscription.plan.price, status: p.subscription.status }
                : null,
        })),
        activeSiteCount: activeSubscriptions.length,
        discountPercent,
        grossTotal,
        netTotal,
    };
}
