import { cn } from "@/lib/utils";

interface OptifyMarkProps {
    size?: number;
    className?: string;
}

// The brand mark: a ring with a rising dot. currentColor-based so callers set the color via
// className (defaults to the brand teal/green) - this is the one place the shape is defined;
// every logo usage across the app should render through this component instead of hand-rolling
// its own icon+box markup.
export function OptifyMark({ size = 24, className }: OptifyMarkProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
            className={cn("text-[#009E8A]", className)}
        >
            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" />
            <circle cx="30.4" cy="17.6" r="6" fill="currentColor" />
        </svg>
    );
}

interface OptifyLogoProps {
    size?: number;
    label?: string;
    inverse?: boolean;
    className?: string;
}

// Mark + wordmark lockup, for navbars/footers that need the brand name next to the icon.
export function OptifyLogo({ size = 24, label = "Optify", inverse = false, className }: OptifyLogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <OptifyMark size={size} className={inverse ? "text-white" : "text-[#009E8A]"} />
            <span
                className={cn("font-bold tracking-tight", inverse ? "text-white" : "text-[#1C1815]")}
                style={{ fontSize: size * 0.72 }}
            >
                {label}
            </span>
        </div>
    );
}
