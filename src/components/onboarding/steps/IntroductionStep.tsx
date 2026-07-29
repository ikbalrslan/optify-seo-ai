"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { completeOnboarding } from "@/actions/onboarding";

interface IntroductionStepProps {
    onBack: () => void;
}

export function IntroductionStep({ onBack }: IntroductionStepProps) {
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
            <div className="border border-dashed border-[#E7DFCF] rounded-xl p-8 text-center text-[#6F675A] bg-[#F5EFE4]/50">
                🚧 This step is coming soon — an introduction to Optify will be added here later.
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

            <OnboardingNav onBack={onBack} onContinue={handleFinish} continueLabel="Finish" isLoading={isFinishing} />
        </div>
    );
}
