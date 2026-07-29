export interface OnboardingStepProps {
    onBack: () => void;
    onContinue: () => void;
}

export interface ExistingProject {
    id: string;
    name: string;
    domain: string;
    country: string;
    description: string | null;
    language: string | null;
}
