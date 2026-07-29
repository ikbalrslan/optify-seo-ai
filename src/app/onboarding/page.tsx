import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveOrganization } from "@/lib/org";
import { getOnboardingStatus } from "@/lib/onboarding";
import { getConnectedSites } from "@/actions/wordpress";
import { OnboardingClient } from "@/components/onboarding/OnboardingClient";
import type { OnboardingInitialData } from "@/components/onboarding/steps/types";

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
        })
        : null;

    const [competitors, connectedSites] = await Promise.all([
        existingProject
            ? prisma.competitor.findMany({ where: { projectId: existingProject.id }, orderBy: { createdAt: "asc" } })
            : Promise.resolve([]),
        existingProject ? getConnectedSites(existingProject.id) : Promise.resolve([]),
    ]);

    const initialData: OnboardingInitialData = {
        project: existingProject
            ? {
                id: existingProject.id,
                name: existingProject.name,
                domain: existingProject.domain,
                country: existingProject.country,
                description: existingProject.description,
                language: existingProject.language,
            }
            : null,
        targetAudiences: existingProject?.targetAudiences ? JSON.parse(existingProject.targetAudiences) : [],
        competitors: competitors.map((c) => c.domain),
        connectedSites,
        autoPublishArticles: existingProject?.autoPublishArticles ?? false,
        articleStyle: existingProject?.articleStyle ?? "Informative",
        articleInstructions: existingProject?.articleInstructions ?? "",
        internalLinksPerArticle: existingProject?.internalLinksPerArticle ?? 3,
        articleImageStyle: existingProject?.articleImageStyle ?? "None",
    };

    return <OnboardingClient initialData={initialData} />;
}
