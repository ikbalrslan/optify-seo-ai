"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { cn } from "@/lib/utils";
import { GoogleIcon, lpButton } from "./GoogleIcon";
import { PlanCalendar } from "./PlanCalendar";

const rotatingKeywords = ["Auto-Pilot", "Content Generation", "Keyword Research"];

export function Hero() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);

    useEffect(() => {
        // Readers who ask for reduced motion get a still headline.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const interval = setInterval(() => {
            setCurrentKeywordIndex((prev) => (prev + 1) % rotatingKeywords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="border-b border-line pb-16 pt-28 md:pb-24 md:pt-36">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 sm:px-8 md:gap-14">
                <div className="flex flex-col gap-6">
                    <p className="lp-label text-brand-deep">SEO on autopilot, built for founders</p>

                    <h1 className="lp-display text-ink">
                        <span className="sr-only">Grow Organic Traffic: {rotatingKeywords.join(", ")}</span>
                        <span aria-hidden="true" className="block">
                            Grow Organic Traffic
                            {/* All three words share one grid cell, so the line never changes height. */}
                            <span className="grid">
                                {rotatingKeywords.map((keyword, index) => (
                                    <span
                                        key={keyword}
                                        className={cn(
                                            "col-start-1 row-start-1 text-brand transition-[opacity,transform] duration-500 ease-out",
                                            index === currentKeywordIndex
                                                ? "translate-y-0 opacity-100"
                                                : "pointer-events-none translate-y-[0.25em] opacity-0"
                                        )}
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </span>
                        </span>
                    </h1>
                </div>

                <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
                    <div className="flex flex-col gap-8 lg:col-span-4 lg:pt-2">
                        <div className="flex flex-col gap-3">
                            <p className="font-lp-display text-xl font-semibold leading-snug text-ink [font-variation-settings:'wdth'_108]">
                                Get recommended by ChatGPT &amp; rank on Google.
                            </p>
                            <p className="max-w-[46ch] text-base leading-relaxed text-ink-muted md:text-lg">
                                Optify studies your business, plans a month of keyword-targeted articles, then writes and
                                publishes them for you. Done-for-you blog posts and keyword research while you sleep.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                            <Button className={lpButton.primary} onClick={() => setIsAuthModalOpen(true)}>
                                Get started for free
                                <ArrowRight className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className={lpButton.secondary}
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                <GoogleIcon />
                                Join with Google
                            </Button>
                        </div>

                        <p className="border-t border-line pt-5 text-sm text-ink-muted">
                            <span className="font-lp-mono font-medium tabular-nums text-ink">50k+</span> articles created
                            with Optify
                        </p>
                    </div>

                    <div className="lg:col-span-8">
                        <PlanCalendar />
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView="login"
            />
        </section>
    );
}
