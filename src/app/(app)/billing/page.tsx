"use client";

import { CreditCard, Download, Calendar, TrendingUp, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function SlotDigit({ value }: { value: string }) {
    const isNumber = !isNaN(parseInt(value));
    const height = 40; // Slightly increased for safety

    if (!isNumber) return <span className="text-4xl font-bold">{value}</span>;

    return (
        <div style={{ height }} className="relative overflow-hidden w-[1.4em] tabular-nums">
            <motion.div
                initial={false}
                animate={{ y: -1 * parseInt(value) * height }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="flex flex-col items-center absolute top-0 left-0 right-0 text-slate-900 dark:text-white"
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <span
                        key={i}
                        className="text-4xl font-bold flex items-center justify-center leading-none"
                        style={{ height }}
                    >
                        {i}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

function RollingPrice({ price }: { price: number }) {
    const digits = price.toString().split("").reverse();

    return (
        <div className="flex items-center h-10 overflow-hidden relative font-sans">
            <span className="text-4xl font-bold mr-1 relative -top-[1px]">$</span>
            <motion.div
                layout
                className="flex flex-row-reverse items-center"
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {digits.map((d, i) => (
                        <SlotDigit key={i} value={d} />
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default function BillingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
    const [sliderValue, setSliderValue] = useState(0);
    const router = useRouter();

    const prices = {
        monthly: { starter: 7, growth: 28 },
        yearly: { starter: 89, growth: 199 }
    };

    const currentPrices = prices[billingCycle];

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header with Back Button */}
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-8 top-8 gap-2"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            </div>

            {/* Plan Selector Section */}
            <div className="flex flex-col items-center space-y-8">
                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-4 relative">
                    <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all relative z-10",
                                billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Monthly
                            {billingCycle === "monthly" && (
                                <motion.div
                                    layoutId="activeCycle"
                                    className="absolute inset-0 bg-white dark:bg-slate-950 shadow-sm rounded-md -z-10 ring-2 ring-[#E55F37] ring-offset-2 dark:ring-offset-slate-900"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all relative z-10",
                                billingCycle === "yearly" ? "text-slate-900 dark:text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Yearly
                            {billingCycle === "yearly" && (
                                <motion.div
                                    layoutId="activeCycle"
                                    className="absolute inset-0 bg-white dark:bg-slate-950 shadow-sm rounded-md -z-10 ring-2 ring-[#E55F37] ring-offset-2 dark:ring-offset-slate-900"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    </div>
                    {/* Handwritten annotation effect */}
                    <div className="absolute -top-8 -right-16 hidden md:block">
                        <div className="relative text-[#E55F37] rotate-6">
                            <span
                                className="text-sm font-medium whitespace-nowrap absolute -top-4 left-4"
                                style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
                            >
                                2 months free
                            </span>
                            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform translate-y-2">
                                <path d="M50 5C45 15 35 25 10 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M15 28L10 35L20 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl pt-4">
                    {/* Starter Plan */}
                    <div className="border bg-card rounded-2xl p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <RollingPrice price={currentPrices.starter} />
                                <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
                            </div>
                            {billingCycle === "yearly" && (
                                <p className="text-[#E55F37] text-sm font-medium mt-2">✓ Save $18</p>
                            )}
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">10k monthly events</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">1 website</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">1 team member</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">3 years of data retention</span>
                            </li>
                        </ul>

                        <Button className="w-full bg-[#E55F37] hover:bg-[#D44E28] text-white font-medium">
                            Pick Starter plan
                        </Button>
                    </div>

                    {/* Growth Plan */}
                    <div className="border bg-card rounded-2xl p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Growth</h3>
                            <div className="flex items-baseline gap-1">
                                <RollingPrice price={currentPrices.growth} />
                                <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
                            </div>
                            {billingCycle === "yearly" && (
                                <p className="text-[#E55F37] text-sm font-medium mt-2">✓ Save $38</p>
                            )}
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">10k monthly events</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">30 websites</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">30 team members</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
                                <span className="text-sm">5+ years of data retention</span>
                            </li>
                        </ul>

                        <Button className="w-full bg-[#E55F37] hover:bg-[#D44E28] text-white font-medium">
                            Pick Growth plan
                        </Button>
                    </div>
                </div>
            </div>

            {/* Separator */}
            <hr className="my-12 border-t border-border/50" />

            {/* Existing Billing History Section (Preserved) */}
            <div className="space-y-6">
                <div className="border rounded-lg p-6 bg-card">
                    <h2 className="text-xl font-semibold mb-4">Billing History</h2>
                    <div className="space-y-3">
                        {[
                            { date: "Jan 1, 2026", amount: "$29.00", status: "Paid", invoice: "INV-2026-001" },
                            { date: "Dec 1, 2025", amount: "$29.00", status: "Paid", invoice: "INV-2025-012" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">{item.invoice}</p>
                                        <p className="text-sm text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">{item.amount}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                        {item.status}
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
