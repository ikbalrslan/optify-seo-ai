"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Subscription is per-Project now (one Stripe Subscription Item per paid site), not per-User -
// this is a stopgap that summarizes the user's active organization's subscriptions into the
// simple {isPro, planName} shape src/components/shared/Sidebar.tsx and the settings page
// already expect. A proper per-site breakdown lives on the org billing page instead
// (src/app/(app)/organization/billing) once that's built.
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
        return { planName: "Free", status: "active", isPro: false };
    }

    const subscriptions = await prisma.subscription.findMany({
        where: { organizationId: user.activeOrganizationId, status: "ACTIVE" },
        include: { plan: true },
        orderBy: { plan: { price: "desc" } },
    });

    if (subscriptions.length === 0) {
        return { planName: "Free", status: "active", isPro: false };
    }

    const best = subscriptions[0];
    return {
        planName: best.plan.name,
        status: best.status,
        isPro: true,
        siteCount: subscriptions.length,
    };
}
