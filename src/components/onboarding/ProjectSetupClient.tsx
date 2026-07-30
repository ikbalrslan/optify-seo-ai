"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { SITE_SETUP_STEPS } from "@/config/onboarding";
import { BusinessStep } from "@/components/onboarding/steps/BusinessStep";
import { AudienceCompetitorsStep } from "@/components/onboarding/steps/AudienceCompetitorsStep";
import { BlogStep } from "@/components/onboarding/steps/BlogStep";
import { ArticlesStep } from "@/components/onboarding/steps/ArticlesStep";
import type { OnboardingInitialData } from "@/components/onboarding/steps/types";

const STEP_SUBTITLES = [
    "Confirm this site's details.",
    "Who are you trying to reach, and who are you up against?",
    "Connect where your content gets published.",
    "Set the starting point for this site's content plan.",
];

interface ProjectSetupClientProps {
    initialData: OnboardingInitialData;
}

/**
 * Per-site setup wizard for websites added after the initial signup onboarding (e.g. via
 * Billing's "Add Website" dialog, which only collects a name/domain) - reuses the exact same
 * step components as src/components/onboarding/OnboardingClient.tsx, scoped to one explicit
 * existing Project rather than "the org's first project". No Introduction/completion-flag step
 * since this doesn't gate anything - it just ends after Articles.
 */
export function ProjectSetupClient({ initialData }: ProjectSetupClientProps) {
    const router = useRouter();
    const [stepIndex, setStepIndex] = useState(0);
    const [project, setProject] = useState(initialData.project);
    const [targetAudiences, setTargetAudiences] = useState(initialData.targetAudiences);
    const [competitors, setCompetitors] = useState(initialData.competitors);
    const [connectedSiteName, setConnectedSiteName] = useState<string | null>(
        initialData.connectedSites[0]?.name ?? null
    );

    const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
    const goContinue = () => {
        if (stepIndex === SITE_SETUP_STEPS.length - 1) {
            router.push("/organization/billing");
            return;
        }
        setStepIndex((i) => i + 1);
    };

    // page.tsx guarantees a Project exists before rendering this component at all.
    if (!project) {
        return null;
    }

    const step = SITE_SETUP_STEPS[stepIndex];

    return (
        <OnboardingShell
            currentIndex={stepIndex}
            steps={SITE_SETUP_STEPS}
            title={step.label}
            subtitle={STEP_SUBTITLES[stepIndex]}
        >
            {stepIndex === 0 && (
                <BusinessStep
                    existingProject={project}
                    projectId={project.id}
                    onProjectSaved={setProject}
                    onContinue={goContinue}
                />
            )}
            {stepIndex === 1 && (
                <AudienceCompetitorsStep
                    projectId={project.id}
                    initialTargetAudiences={targetAudiences}
                    initialCompetitors={competitors}
                    onSaved={(data) => {
                        setTargetAudiences(data.targetAudiences);
                        setCompetitors(data.competitors);
                    }}
                    onBack={goBack}
                    onContinue={goContinue}
                />
            )}
            {stepIndex === 2 && (
                <BlogStep
                    projectId={project.id}
                    initialConnectedSites={initialData.connectedSites}
                    onSaved={(data) => setConnectedSiteName(data.connectedSiteName)}
                    onBack={goBack}
                    onContinue={goContinue}
                />
            )}
            {stepIndex === 3 && (
                <ArticlesStep
                    projectId={project.id}
                    initialAutoPublish={initialData.autoPublishArticles}
                    initialArticleStyle={initialData.articleStyle}
                    initialInstructions={initialData.articleInstructions}
                    initialInternalLinks={initialData.internalLinksPerArticle}
                    initialImageStyle={initialData.articleImageStyle}
                    hasConnectedSite={connectedSiteName !== null}
                    onSaved={() => {}}
                    onBack={goBack}
                    onContinue={goContinue}
                    continueLabel="Done"
                />
            )}
        </OnboardingShell>
    );
}
