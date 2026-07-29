import { Button } from "@/components/ui/button";

interface OnboardingNavProps {
    onBack?: () => void;
    onContinue: () => void;
    continueLabel?: string;
    isContinueDisabled?: boolean;
    isLoading?: boolean;
}

export function OnboardingNav({
    onBack,
    onContinue,
    continueLabel = "Continue",
    isContinueDisabled = false,
    isLoading = false,
}: OnboardingNavProps) {
    return (
        <div className="flex items-center justify-between pt-2">
            {onBack ? (
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isLoading}
                    className="border-[#E7DFCF] rounded-full"
                >
                    Back
                </Button>
            ) : (
                <span />
            )}
            <Button
                onClick={onContinue}
                disabled={isContinueDisabled || isLoading}
                className="bg-[#009E8A] hover:bg-[#00877A] text-white rounded-full px-6"
            >
                {isLoading ? "Saving..." : continueLabel}
            </Button>
        </div>
    );
}
