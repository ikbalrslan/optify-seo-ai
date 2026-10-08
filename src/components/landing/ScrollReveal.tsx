"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
}

// Content is always visible at rest (no opacity-0 waiting on an observer, so screenshots,
// link previews and no-JS readers see the full page). When a block first scrolls into view
// it gets a short upward settle; `prefers-reduced-motion` turns that off in globals.css.
export function ScrollReveal({ children, className }: ScrollRevealProps) {
    const [revealed, setRevealed] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") return;

        // Anything already on screen at load stays put; only blocks below the fold animate.
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.05 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} data-revealed={revealed} className={cn("lp-reveal", className)}>
            {children}
        </div>
    );
}
