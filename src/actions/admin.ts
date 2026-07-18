"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ensureAdminHasProPlan } from "@/lib/admin";
import { revalidatePath } from "next/cache";

// The middleware already blocks non-admins from reaching /admin/* pages, but server
// actions can be invoked directly, so every admin action re-checks role itself.
//
// This deliberately re-reads role from the database rather than trusting session.user.role:
// role is baked into the JWT at sign-in and cached in the session cookie for the life of that
// session (see src/auth.ts), so a user demoted while still logged in would otherwise keep
// passing this check with their stale "ADMIN" claim - including being able to call
// updateUserRole on themselves and silently re-grant their own admin access. Querying the
// live value closes that off; it costs one extra indexed read per admin action, same
// trade-off already accepted for org-role checks in src/lib/org.ts.
async function requireAdmin(): Promise<{ userId: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authorized");
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
    }
    return { userId: session.user.id };
}

export async function getUsers() {
    await requireAdmin();

    const users = await prisma.user.findMany({
        include: {
            subscription: { include: { plan: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        planName: u.subscription?.plan.name ?? null,
        planId: u.subscription?.planId ?? null,
    }));
}

export async function getPlans() {
    await requireAdmin();
    return prisma.plan.findMany({ orderBy: { price: "asc" } });
}

export async function updateUserRole(
    userId: string,
    role: "USER" | "ADMIN"
): Promise<{ success: true } | { success: false; error: string }> {
    const { userId: adminId } = await requireAdmin();

    if (userId === adminId && role !== "ADMIN") {
        return { success: false, error: "You cannot remove your own admin role." };
    }

    await prisma.user.update({ where: { id: userId }, data: { role } });

    if (role === "ADMIN") {
        await ensureAdminHasProPlan(userId);
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateUserPlan(
    userId: string,
    planId: string
): Promise<{ success: true } | { success: false; error: string }> {
    await requireAdmin();

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
        return { success: false, error: "Plan not found." };
    }

    await prisma.subscription.upsert({
        where: { userId },
        update: { planId: plan.id, status: "ACTIVE" },
        create: { userId, planId: plan.id, status: "ACTIVE" },
    });

    revalidatePath("/admin/users");
    return { success: true };
}
