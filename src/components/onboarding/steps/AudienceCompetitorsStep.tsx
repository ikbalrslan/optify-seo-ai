"use client";

import { useState } from "react";
import { TagInput } from "@/components/onboarding/TagInput";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { completeAudienceCompetitorsStep } from "@/actions/onboarding";

const MAX_TAGS = 7;

interface AudienceCompetitorsStepProps {
    projectId: string;
    initialTargetAudiences: string[];
    initialCompetitors: string[];
    onSaved: (data: { targetAudiences: string[]; competitors: string[] }) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function AudienceCompetitorsStep({
    projectId,
    initialTargetAudiences,
    initialCompetitors,
    onSaved,
    onBack,
    onContinue,
}: AudienceCompetitorsStepProps) {
    const [targetAudiences, setTargetAudiences] = useState(initialTargetAudiences);
    const [competitors, setCompetitors] = useState(initialCompetitors);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContinue = async () => {
        setError("");
        setIsSubmitting(true);
        const result = await completeAudienceCompetitorsStep(projectId, targetAudiences, competitors);
        setIsSubmitting(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        onSaved({ targetAudiences, competitors });
        onContinue();
    };

    return (
        <div className="space-y-6">
            <div className="border border-[#E7DFCF] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1C1815]">Target Audiences</h3>
                    <span className="text-xs font-medium text-[#9B927F] border border-[#E7DFCF] rounded-full px-2 py-0.5">
                        {targetAudiences.length}/{MAX_TAGS}
                    </span>
                </div>
                <p className="text-sm text-[#6F675A] mb-3">
                    Who is this content for? Better audience understanding improves relevance.
                </p>
                <TagInput
                    values={targetAudiences}
                    onChange={setTargetAudiences}
                    placeholder="Enter a target audience (e.g. Developers, Project Managers)"
                    max={MAX_TAGS}
                />
            </div>

            <div className="border border-[#E7DFCF] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1C1815]">Competitors</h3>
                    <span className="text-xs font-medium text-[#9B927F] border border-[#E7DFCF] rounded-full px-2 py-0.5">
                        {competitors.length}/{MAX_TAGS}
                    </span>
                </div>
                <p className="text-sm text-[#6F675A] mb-3">
                    Who are you competing with? We use this to discover keywords they already rank for.
                </p>
                <TagInput
                    values={competitors}
                    onChange={setCompetitors}
                    placeholder="Enter a competitor domain (e.g. example.com)"
                    max={MAX_TAGS}
                    renderTag={(domain) => (
                        <span className="flex items-center gap-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element -- external favicon, arbitrary domains, not a next/image candidate */}
                            <img
                                src={`https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(domain)}`}
                                alt=""
                                className="w-4 h-4 rounded-sm"
                            />
                            {domain}
                        </span>
                    )}
                />
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

            <OnboardingNav onBack={onBack} onContinue={handleContinue} isLoading={isSubmitting} />
        </div>
    );
}
