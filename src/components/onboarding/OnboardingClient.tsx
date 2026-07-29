"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ONBOARDING_STEPS } from "@/config/onboarding";
import { BusinessStep } from "@/components/onboarding/steps/BusinessStep";
import { AudienceCompetitorsStep } from "@/components/onboarding/steps/AudienceCompetitorsStep";
import { BlogStep } from "@/components/onboarding/steps/BlogStep";
import { ArticlesStep } from "@/components/onboarding/steps/ArticlesStep";
import { IntroductionStep } from "@/components/onboarding/steps/IntroductionStep";
import type { ExistingProject } from "@/components/onboarding/steps/types";

const STEP_SUBTITLES = [
    "Based on your website, tell us a bit about your business so we can tailor your strategy.",
    "Who are you trying to reach, and who are you up against?",
    "Connect where your content gets published.",
    "Set the starting point for your content plan.",
    "You're all set.",
];

interface OnboardingClientProps {
    existingProject: ExistingProject | null;
}

export function OnboardingClient({ existingProject }: OnboardingClientProps) {
    // If a Project already exists (e.g. the user refreshed mid-flow), skip straight past
    // the Business step instead of risking a duplicate Project on re-submit.
    const [stepIndex, setStepIndex] = useState(existingProject ? 1 : 0);
    const [project, setProject] = useState(existingProject);

    const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
    const goContinue = () => setStepIndex((i) => Math.min(ONBOARDING_STEPS.length - 1, i + 1));

    const step = ONBOARDING_STEPS[stepIndex];

    return (
        <OnboardingShell currentIndex={stepIndex} title={step.label} subtitle={STEP_SUBTITLES[stepIndex]}>
            {stepIndex === 0 && (
                <BusinessStep existingProject={project} onProjectSaved={setProject} onContinue={goContinue} />
            )}
            {stepIndex === 1 && <AudienceCompetitorsStep onBack={goBack} onContinue={goContinue} />}
            {stepIndex === 2 && <BlogStep onBack={goBack} onContinue={goContinue} />}
            {stepIndex === 3 && <ArticlesStep onBack={goBack} onContinue={goContinue} />}
            {stepIndex === 4 && <IntroductionStep onBack={goBack} />}
        </OnboardingShell>
    );
}
