export interface OnboardingStep {
    key: string;
    label: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    { key: "business", label: "Business" },
    { key: "audience", label: "Audience & Competitors" },
    { key: "blog", label: "Blog" },
    { key: "articles", label: "Articles" },
    { key: "introduction", label: "Introduction" },
];

/**
 * Same shape, no "Introduction" - used by the per-site setup wizard
 * (src/app/projects/[projectId]/setup) for additional websites added after the initial
 * signup onboarding. That flow isn't gating dashboard access, so it just ends after Articles.
 */
export const SITE_SETUP_STEPS: OnboardingStep[] = ONBOARDING_STEPS.filter((s) => s.key !== "introduction");
