import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Reads whether the current user has finished the onboarding wizard. Coalesces a missing
 * session, missing user, or the nullable `hasCompletedOnboarding` column's null/false states
 * down to a single boolean - only a literal `true` counts as complete (see the column's comment
 * in prisma/schema.prisma for why it's nullable rather than a NOT NULL default).
 */
export async function getOnboardingStatus(): Promise<{ hasCompletedOnboarding: boolean }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { hasCompletedOnboarding: false };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hasCompletedOnboarding: true },
    });

    return { hasCompletedOnboarding: user?.hasCompletedOnboarding === true };
}
