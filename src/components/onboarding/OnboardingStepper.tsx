import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/config/onboarding";

interface OnboardingStepperProps {
    /** 0-based index of the currently active step */
    currentIndex: number;
}

export function OnboardingStepper({ currentIndex }: OnboardingStepperProps) {
    return (
        <div className="flex items-start w-full max-w-2xl mx-auto">
            {ONBOARDING_STEPS.map((step, i) => (
                <Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                            className={cn(
                                "h-3.5 w-3.5 rounded-full border-2 transition-colors",
                                i < currentIndex && "bg-[#009E8A] border-[#009E8A]",
                                i === currentIndex && "bg-[#009E8A] border-[#009E8A] ring-4 ring-[#009E8A]/15",
                                i > currentIndex && "bg-white border-[#E7DFCF]"
                            )}
                        />
                        <span
                            className={cn(
                                "text-xs whitespace-nowrap",
                                i === currentIndex ? "font-semibold text-[#1C1815]" : "font-medium text-[#9B927F]"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < ONBOARDING_STEPS.length - 1 && (
                        <div
                            className={cn(
                                "flex-1 h-0.5 mx-2 mt-[7px]",
                                i < currentIndex ? "bg-[#009E8A]" : "bg-[#E7DFCF]"
                            )}
                        />
                    )}
                </Fragment>
            ))}
        </div>
    );
}
