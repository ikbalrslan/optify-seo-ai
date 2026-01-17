"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [traffic, setTraffic] = useState(0);

    const trafficLevels = [
        { label: "10k", priceMonthly: 14, priceAnnual: 9 },
        { label: "50k", priceMonthly: 29, priceAnnual: 19 },
        { label: "100k", priceMonthly: 49, priceAnnual: 39 },
        { label: "500k", priceMonthly: 99, priceAnnual: 79 },
    ];

    const currentLevel = trafficLevels[traffic];
    const price = isAnnual ? currentLevel.priceAnnual : currentLevel.priceMonthly;

    return (
        <section id="pricing" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        Simple, traffic-based pricing
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Start for free, upgrade as you grow. No credit card required.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-sm font-medium ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-black"
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? "translate-x-5" : "translate-x-0"}`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${isAnnual ? "text-gray-900" : "text-gray-500"}`}>
                            Yearly <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs ml-1">Save 2 months</span>
                        </span>
                    </div>
                </div>

                <div className="max-w-lg mx-auto">
                    <Card className="p-8 border-2 border-gray-100 shadow-xl rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-lg text-xs font-medium text-gray-600">
                            Most Popular
                        </div>

                        <h3 className="text-lg font-medium text-gray-500 mb-2">Pro Plan</h3>
                        <div className="flex items-baseline mb-8">
                            <span className="text-5xl font-bold text-gray-900">${price}</span>
                            <span className="text-gray-500 ml-2">/month</span>
                        </div>

                        {/* Slider */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-medium text-gray-900 mb-4">
                                <span>Pages Crawled / month</span>
                                <span>{currentLevel.label} pages</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="3"
                                step="1"
                                value={traffic}
                                onChange={(e) => setTraffic(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>10k</span>
                                <span>500k+</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Unlimited projects",
                                "Daily keyword ranking updates",
                                "Deep technical site audits",
                                "Backlink monitoring",
                                "Competitor analysis",
                                "White-label reports"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center text-gray-600">
                                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button className="w-full h-12 text-base font-medium bg-black hover:bg-gray-800 text-white rounded-lg">
                            Start 14-day free trial
                        </Button>
                        <div className="text-center mt-4 text-sm text-gray-500">
                            No credit card required
                        </div>
                    </Card>
                </div>

            </div>
        </section>
    );
}
