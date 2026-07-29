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

export interface ConnectedSiteSummary {
    id: string;
    name: string;
    url: string;
    username?: string;
}

export interface OnboardingInitialData {
    project: ExistingProject | null;
    targetAudiences: string[];
    competitors: string[];
    connectedSites: ConnectedSiteSummary[];
    autoPublishArticles: boolean;
    articleStyle: string;
    articleInstructions: string;
    internalLinksPerArticle: number;
    articleImageStyle: string;
}
