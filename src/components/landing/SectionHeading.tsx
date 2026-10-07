import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    title: ReactNode;
    lead?: ReactNode;
    id?: string;
    className?: string;
}

// One heading pattern for every landing section: left-aligned, same scale, same gap.
export function SectionHeading({ title, lead, id, className }: SectionHeadingProps) {
    return (
        <div className={cn("flex max-w-2xl flex-col gap-4", className)}>
            <h2 id={id} className="lp-h2 text-ink">
                {title}
            </h2>
            {lead && <p className="max-w-[60ch] text-lg leading-relaxed text-ink-muted">{lead}</p>}
        </div>
    );
}
