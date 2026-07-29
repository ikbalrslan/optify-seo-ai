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
