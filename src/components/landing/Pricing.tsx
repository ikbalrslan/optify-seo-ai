"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ALL_IN_PLAN } from "@/config/plans";

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
        <section id="pricing" className="py-24 bg-[#FAF6EF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#1C1815] mb-6">
                        Organic Traffic Growth{" "}
                        <span className="text-[#009E8A]">
                            on Autopilot
                        </span>
                    </h2>
                    <p className="text-lg text-[#6F675A] max-w-2xl mx-auto mb-12">
                        One plan, everything included. Priced per site, with an automatic volume discount as you add more.
                    </p>
                </div>

                {/* Plan Display */}
                <div className="max-w-lg mx-auto">
                    <Card className="p-8 border-2 border-[#009E8A] ring-4 ring-[#009E8A]/10 shadow-xl rounded-2xl relative overflow-hidden flex flex-col transition-all duration-300 bg-white">
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold text-[#1C1815] mb-4">{ALL_IN_PLAN.name}</h3>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <span className="text-5xl font-bold text-[#1C1815]">${ALL_IN_PLAN.price}</span>
                                <span className="text-[#9B927F] text-lg">/mo per site</span>
                            </div>
                            <p className="text-[#9B927F] text-sm">Cancel anytime</p>
                        </div>

                        <div className="flex-1 mb-8">
                            <div className="text-sm font-semibold text-[#1C1815] mb-4 uppercase tracking-wide">What's included:</div>
                            <ul className="space-y-4">
                                {ALL_IN_PLAN.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-[#1C1815]/80">
                                        <div className="bg-[#009E8A]/10 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                                            <Check className="w-3 h-3 text-[#009E8A]" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-auto">
                            <Button
                                onClick={handleSubscribe}
                                className="w-full h-14 text-lg font-bold rounded-full shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-[#009E8A] hover:bg-[#00877A] text-white"
                            >
                                Initialize Subscription
                            </Button>
                            <p className="text-xs text-center text-[#9B927F] mt-4">
                                You will be redirected to Stripe to complete your purchase securely.
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[#6F675A] text-sm">Need something custom? <a href="#" className="underline hover:text-[#009E8A]">Contact Sales</a></p>
                </div>

            </div>
        </section>
    );
}
