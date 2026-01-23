"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import { cn } from "@/lib/utils";

import { createCheckoutSession } from "@/actions/stripe";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Pricing() {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedPlanName, setSelectedPlanName] = useState("PRO");

    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.name === selectedPlanName) || SUBSCRIPTION_PLANS[0];

    const handleSubscribe = async () => {
        if (!session?.user) {
            // Redirect to signin with a callbackUrl to our new Checkout Bridge page
            // The structure is: /signin?callbackUrl=/checkout/[planName]
            const callbackUrl = `/checkout/${encodeURIComponent(selectedPlan.name)}`;
            router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            return;
        }

        try {
            await createCheckoutSession(selectedPlan.name);
        } catch (error) {
            console.error("Subscription error:", error);
            // Optionally add toast notification here
        }
    };

    return (
        <section id="pricing" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        Choose the right plan for you
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
                        Scale your content production with plans tailored to your needs.
                    </p>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <button
                                key={plan.name}
                                onClick={() => setSelectedPlanName(plan.name)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                                    selectedPlanName === plan.name
                                        ? "bg-black text-white shadow-md scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {plan.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Plan Display */}
                <div className="max-w-lg mx-auto">
                    <Card key={selectedPlan.name} className={cn(
                        "p-8 border-2 shadow-xl rounded-2xl relative overflow-hidden flex flex-col transition-all duration-300",
                        selectedPlan.popular ? "border-green-500 ring-4 ring-green-500/10" : "border-gray-100"
                    )}>
                        {selectedPlan.popular && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1.5 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedPlan.name}</h3>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <span className="text-5xl font-bold text-gray-900">${selectedPlan.price}</span>
                                <span className="text-gray-500 text-lg">/mo</span>
                            </div>
                            <p className="text-gray-500 text-sm">Cancel anytime</p>
                        </div>

                        <div className="flex-1 mb-8">
                            <div className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">What's included:</div>
                            <ul className="space-y-4">
                                {selectedPlan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-gray-700">
                                        <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-sm leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* "Initialize Subscription" Button - As requested */}
                        <div className="mt-auto">
                            <Button
                                onClick={handleSubscribe}
                                className={cn(
                                    "w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]",
                                    selectedPlan.popular
                                        ? "bg-[#1DB954] hover:bg-[#1ed760] text-white"
                                        : "bg-black hover:bg-gray-900 text-white"
                                )}
                            >
                                Initialize Subscription
                            </Button>
                            <p className="text-xs text-center text-gray-400 mt-4">
                                You will be redirected to Stripe to complete your purchase securely.
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-500 text-sm">Need a custom plan with more than 300 articles? <a href="#" className="underline">Contact Sales</a></p>
                </div>

            </div>
        </section>
    );
}
