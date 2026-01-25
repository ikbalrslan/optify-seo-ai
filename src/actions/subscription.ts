"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SUBSCRIPTION_PLANS } from "@/config/plans";

export async function getSubscription() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        include: { plan: true }
    });

    if (!subscription) {
        return {
            planName: "Free", // Default if no sub found
            status: "active", // Free is always active
            limits: null,
            isPro: false
        };
    }

    // You can enhance this with better status logic based on Stripe status
    return {
        planName: subscription.plan.name,
        status: subscription.status,
        endData: subscription.endDate,
        isPro: true, // Or specific tier logic
        subscription
    };
}
