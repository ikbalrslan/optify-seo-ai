import { prisma } from "@/lib/db";

const ADMIN_PLAN_SLUG = "pro";

/**
 * Admins always have Pro-level access. Called on every sign-in (see src/auth.ts)
 * so it self-heals regardless of how a user's role was set to ADMIN - there's no
 * in-app role-assignment UI yet, so this is what actually enforces the invariant.
 */
export async function ensureAdminHasProPlan(userId: string): Promise<void> {
    const proPlan = await prisma.plan.upsert({
        where: { slug: ADMIN_PLAN_SLUG },
        update: {},
        create: {
            name: "Pro",
            slug: ADMIN_PLAN_SLUG,
            price: 29.99,
            autopilotPostsPerMonth: 30,
            limits: JSON.stringify({
                blogGenerations: -1,
                keywordResearch: -1,
            }),
        },
    });

    const subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription) {
        await prisma.subscription.create({
            data: { userId, planId: proPlan.id, status: "ACTIVE" },
        });
        return;
    }

    if (subscription.planId !== proPlan.id || subscription.status !== "ACTIVE") {
        await prisma.subscription.update({
            where: { userId },
            data: { planId: proPlan.id, status: "ACTIVE" },
        });
    }
}
