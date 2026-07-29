"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ONBOARDING_STEPS } from "@/config/onboarding";
import { BusinessStep } from "@/components/onboarding/steps/BusinessStep";
import { AudienceCompetitorsStep } from "@/components/onboarding/steps/AudienceCompetitorsStep";
import { BlogStep } from "@/components/onboarding/steps/BlogStep";
import { ArticlesStep } from "@/components/onboarding/steps/ArticlesStep";
import { IntroductionStep } from "@/components/onboarding/steps/IntroductionStep";
import type { OnboardingInitialData } from "@/components/onboarding/steps/types";

const STEP_SUBTITLES = [
    "Based on your website, tell us a bit about your business so we can tailor your strategy.",
    "Who are you trying to reach, and who are you up against?",
    "Connect where your content gets published.",
    "Set the starting point for your content plan.",
    "You're all set.",
];

interface OnboardingClientProps {
    initialData: OnboardingInitialData;
}

export function OnboardingClient({ initialData }: OnboardingClientProps) {
    // If a Project already exists (e.g. the user refreshed mid-flow), skip straight past
    // the Business step instead of risking a duplicate Project on re-submit.
    const [stepIndex, setStepIndex] = useState(initialData.project ? 1 : 0);
    const [project, setProject] = useState(initialData.project);
    const [targetAudiences, setTargetAudiences] = useState(initialData.targetAudiences);
    const [competitors, setCompetitors] = useState(initialData.competitors);
    const [connectedSiteName, setConnectedSiteName] = useState<string | null>(
        initialData.connectedSites[0]?.name ?? null
    );
    const [articleStyle, setArticleStyle] = useState(initialData.articleStyle);

    const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
    const goContinue = () => setStepIndex((i) => Math.min(ONBOARDING_STEPS.length - 1, i + 1));

    const step = ONBOARDING_STEPS[stepIndex];

    return (
        <OnboardingShell currentIndex={stepIndex} title={step.label} subtitle={STEP_SUBTITLES[stepIndex]}>
            {stepIndex === 0 && (
                <BusinessStep existingProject={project} onProjectSaved={setProject} onContinue={goContinue} />
            )}
            {stepIndex === 1 && project && (
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
            {stepIndex === 2 && project && (
                <BlogStep
                    projectId={project.id}
                    initialConnectedSites={initialData.connectedSites}
                    onSaved={(data) => setConnectedSiteName(data.connectedSiteName)}
                    onBack={goBack}
                    onContinue={goContinue}
                />
            )}
            {stepIndex === 3 && project && (
                <ArticlesStep
                    projectId={project.id}
                    initialAutoPublish={initialData.autoPublishArticles}
                    initialArticleStyle={articleStyle}
                    initialInstructions={initialData.articleInstructions}
                    initialInternalLinks={initialData.internalLinksPerArticle}
                    initialImageStyle={initialData.articleImageStyle}
                    onSaved={(data) => setArticleStyle(data.articleStyle)}
                    onBack={goBack}
                    onContinue={goContinue}
                />
            )}
            {stepIndex === 4 && (
                <IntroductionStep
                    summary={{ project, targetAudiences, competitors, connectedSiteName, articleStyle }}
                    onBack={goBack}
                />
            )}
        </OnboardingShell>
    );
}
