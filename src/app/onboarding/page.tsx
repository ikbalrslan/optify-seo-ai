import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveOrganization } from "@/lib/org";
import { getOnboardingStatus } from "@/lib/onboarding";
import { OnboardingClient } from "@/components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/signin?callbackUrl=/onboarding");
    }

    const status = await getOnboardingStatus();
    if (status.hasCompletedOnboarding) {
        redirect("/dashboard");
    }

    const organization = await getActiveOrganization();
    const existingProject = organization
        ? await prisma.project.findFirst({
            where: { organizationId: organization.id },
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, domain: true, country: true, description: true, language: true },
        })
        : null;

    return <OnboardingClient existingProject={existingProject} />;
}
