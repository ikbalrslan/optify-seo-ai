import { Card } from "@/components/ui/card";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { OptifyMark } from "@/components/brand/OptifyMark";
import type { OnboardingStep } from "@/config/onboarding";

interface OnboardingShellProps {
    currentIndex: number;
    steps: OnboardingStep[];
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function OnboardingShell({ currentIndex, steps, title, subtitle, children }: OnboardingShellProps) {
    return (
        <div className="min-h-screen bg-[#FAF6EF] flex flex-col items-center px-4 py-12">
            {/* Logo */}
            <div className="mb-10">
                <OptifyMark size={30} />
            </div>

            <div className="mb-10 w-full">
                <OnboardingStepper currentIndex={currentIndex} steps={steps} />
            </div>

            <div className="w-full max-w-2xl text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1C1815] mb-2">{title}</h1>
                {subtitle && <p className="text-[#6F675A] text-[15px] leading-relaxed">{subtitle}</p>}
            </div>

            <Card className="w-full max-w-2xl border-[#E7DFCF] bg-white rounded-2xl shadow-sm p-8">
                {children}
            </Card>
        </div>
    );
}
