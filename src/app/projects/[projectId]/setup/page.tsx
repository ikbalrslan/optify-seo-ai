import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireOrgProjectAccess } from "@/lib/org";
import { getConnectedSites } from "@/actions/wordpress";
import { ProjectSetupClient } from "@/components/onboarding/ProjectSetupClient";
import type { OnboardingInitialData } from "@/components/onboarding/steps/types";

export default async function ProjectSetupPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/signin?callbackUrl=/projects/${projectId}/setup`);
    }

    let project;
    try {
        ({ project } = await requireOrgProjectAccess(projectId, "ADMIN"));
    } catch {
        redirect("/organization/billing");
    }

    const [competitors, connectedSites] = await Promise.all([
        prisma.competitor.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
        getConnectedSites(projectId),
    ]);

    const initialData: OnboardingInitialData = {
        project: {
            id: project.id,
            name: project.name,
            domain: project.domain,
            country: project.country,
            description: project.description,
            language: project.language,
        },
        targetAudiences: project.targetAudiences ? JSON.parse(project.targetAudiences) : [],
        competitors: competitors.map((c) => c.domain),
        connectedSites,
        autoPublishArticles: project.autoPublishArticles,
        articleStyle: project.articleStyle ?? "Informative",
        articleInstructions: project.articleInstructions ?? "",
        internalLinksPerArticle: project.internalLinksPerArticle,
        articleImageStyle: project.articleImageStyle ?? "None",
    };

    return <ProjectSetupClient initialData={initialData} />;
}
