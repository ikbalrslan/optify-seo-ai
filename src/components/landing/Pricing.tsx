"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ALL_IN_PLAN } from "@/config/plans";
import { cn } from "@/lib/utils";
import { lpButton } from "./GoogleIcon";
import { SectionHeading } from "./SectionHeading";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Pricing() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleSubscribe = () => {
        // Billing is per-site now (each site/project picks its own plan), so there's nothing
        // to check out directly from the marketing page - send them to sign in (if needed)
        // and land on the billing page, where they pick which site this plan applies to.
        const billingUrl = "/organization/billing";
        if (!session?.user) {
            router.push(`/signin?callbackUrl=${encodeURIComponent(billingUrl)}`);
            return;
        }
        router.push(billingUrl);
    };

    return (
        <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-16 border-t border-line bg-paper-deep py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
                <div className="flex flex-col gap-8 lg:col-span-5">
                    <SectionHeading
                        id="pricing-title"
                        title={
                            <>
                                Organic traffic growth <span className="text-brand-deep">on autopilot</span>
                            </>
                        }
                        lead="One plan, everything included. Priced per site, with an automatic volume discount as you add more."
                    />
                    <dl className="grid grid-cols-2 gap-6 border-t border-line pt-6">
                        <div className="flex flex-col gap-1">
                            <dt className="lp-label text-ink-faint">Articles</dt>
                            <dd className="text-ink">Up to {ALL_IN_PLAN.articles} a month per site</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                            <dt className="lp-label text-ink-faint">Commitment</dt>
                            <dd className="text-ink">Cancel anytime</dd>
                        </div>
                    </dl>
                    <p className="text-sm text-ink-muted">
                        Need something custom?{" "}
                        <a href="#" className="font-medium text-ink underline underline-offset-4 hover:text-brand-deep">
                            Contact sales
                        </a>
                    </p>
                </div>

                <div className="flex flex-col gap-8 rounded-xl border border-line bg-white p-6 sm:p-8 lg:col-span-7">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-6">
                        <div className="flex flex-col gap-2">
                            <h3 className="lp-label text-brand-deep">{ALL_IN_PLAN.name}</h3>
                            <p className="flex items-baseline gap-1.5">
                                <span className="font-lp-display text-5xl font-bold tabular-nums text-ink [font-variation-settings:'wdth'_112]">
                                    ${ALL_IN_PLAN.price}
                                </span>
                                <span className="text-ink-muted">/mo per site</span>
                            </p>
                        </div>
                        <p className="max-w-[22ch] text-sm text-ink-muted">Volume discount applied automatically as you add sites.</p>
                    </div>

                    <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
                        {ALL_IN_PLAN.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-ink-body">
                                <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.25} aria-hidden="true" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="flex flex-col gap-3">
                        <Button onClick={handleSubscribe} className={cn(lpButton.primary, "h-12 w-full text-base")}>
                            Choose a site and subscribe
                        </Button>
                        <p className="text-center text-xs text-ink-faint">
                            You&apos;ll pick which site the plan covers, then pay securely with Stripe.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
