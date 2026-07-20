"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Subscription is per-Project (one Stripe Subscription Item per paid site), not per-org or
// per-user - this summarizes the active organization's subscriptions into the simple
// {isPro, planName} shape src/components/shared/Sidebar.tsx's "Pro" badge still just needs.
// totalSiteCount lets callers (the settings page) tell "every website is covered" apart from
// "only some are" instead of implying a single planName applies org-wide - a real per-site
// breakdown lives on the org billing page (src/app/(app)/organization/billing).
export async function getSubscription() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { activeOrganizationId: true },
    });

    if (!user?.activeOrganizationId) {
        return { planName: "Free", status: "active", isPro: false, totalSiteCount: 0 };
    }

    const [subscriptions, totalSiteCount] = await Promise.all([
        prisma.subscription.findMany({
            where: { organizationId: user.activeOrganizationId, status: "ACTIVE" },
            include: { plan: true },
            orderBy: { plan: { price: "desc" } },
        }),
        prisma.project.count({ where: { organizationId: user.activeOrganizationId } }),
    ]);

    if (subscriptions.length === 0) {
        return { planName: "Free", status: "active", isPro: false, totalSiteCount };
    }

    const best = subscriptions[0];
    return {
        planName: best.plan.name,
        status: best.status,
        isPro: true,
        siteCount: subscriptions.length,
        totalSiteCount,
    };
}
