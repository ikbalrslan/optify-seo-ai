import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import type { OnboardingStepProps } from "@/components/onboarding/steps/types";

export function BlogStep({ onBack, onContinue }: OnboardingStepProps) {
    return (
        <div className="space-y-5">
            <div className="border border-dashed border-[#E7DFCF] rounded-xl p-8 text-center text-[#6F675A] bg-[#F5EFE4]/50">
                🚧 This step is coming soon — content for &quot;Blog&quot; will be added here later.
            </div>
            <OnboardingNav onBack={onBack} onContinue={onContinue} />
        </div>
    );
}
