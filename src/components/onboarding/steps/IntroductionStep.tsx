"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { completeOnboarding } from "@/actions/onboarding";

interface OnboardingSummaryData {
    project: { name: string; domain: string } | null;
    targetAudiences: string[];
    competitors: string[];
    connectedSiteName: string | null;
    articleStyle: string;
}

interface IntroductionStepProps {
    summary: OnboardingSummaryData;
    onBack: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#009E8A] mt-0.5 shrink-0" />
            <div>
                <span className="text-sm font-medium text-[#1C1815]">{label}: </span>
                <span className="text-sm text-[#6F675A]">{value}</span>
            </div>
        </div>
    );
}

export function IntroductionStep({ summary, onBack }: IntroductionStepProps) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isFinishing, setIsFinishing] = useState(false);

    const handleFinish = async () => {
        setError("");
        setIsFinishing(true);
        const result = await completeOnboarding();

        if (!result.success) {
            setError(result.error);
            setIsFinishing(false);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="space-y-5">
            <p className="text-sm text-[#6F675A] -mt-2">
                You&apos;re all set. Here&apos;s what we&apos;ve set up for you — you can change any of this later from Settings.
            </p>

            <div className="divide-y divide-[#F0E9DB]">
                {summary.project && (
                    <SummaryRow label="Business" value={`${summary.project.name} (${summary.project.domain})`} />
                )}
                <SummaryRow
                    label="Target audiences"
                    value={summary.targetAudiences.length > 0 ? summary.targetAudiences.join(", ") : "None added yet"}
                />
                <SummaryRow
                    label="Competitors"
                    value={summary.competitors.length > 0 ? summary.competitors.join(", ") : "None added yet"}
                />
                <SummaryRow
                    label="Blog"
                    value={summary.connectedSiteName ?? "Not connected — auto-publish unavailable until you connect a site"}
                />
                <SummaryRow label="Article style" value={summary.articleStyle} />
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

            <OnboardingNav onBack={onBack} onContinue={handleFinish} continueLabel="Finish" isLoading={isFinishing} />
        </div>
    );
}
