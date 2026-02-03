"use client";

import { Check, Search, LineChart, Zap, Target } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const replaceToolsFeatures = [
    "AI-Powered Keyword Research",
    "SEO Content Generation",
    "Topic Clustering & Strategy",
    "Auto-Publishing to WordPress",
    "Content Calendar & Scheduling",
    "Performance Analytics",
    "Multi-Language Support",
];

const howItWorks = [
    {
        step: "1",
        title: "Deep analysis of your business",
        description: "Connect your website and we analyze your niche, competitors, and target audience to create a personalized SEO strategy.",
        icon: <Search className="w-6 h-6" />,
        color: "bg-blue-500",
    },
    {
        step: "2",
        title: "30-day SEO content plan",
        description: "Receive a complete keyword strategy with topic clusters, search intent mapping, and content recommendations.",
        icon: <Target className="w-6 h-6" />,
        color: "bg-purple-500",
    },
    {
        step: "3",
        title: "Generate articles on autopilot",
        description: "Our AI creates and publishes SEO-optimized articles directly to your blog. Sit back and watch your traffic grow.",
        icon: <Zap className="w-6 h-6" />,
        color: "bg-[#1DB954]",
    },
];

export function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Replace Multiple Tools Section */}
                <ScrollReveal>
                    <div className="mb-32">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                    Replace multiple tools with one{" "}
                                    <span className="bg-gradient-to-r from-[#1DB954] to-[#0fa968] bg-clip-text text-transparent">
                                        powerful platform
                                    </span>
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Stop paying for 5 different SEO tools. Optify combines keyword research, content generation, optimization, and publishing in one seamless workflow.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {replaceToolsFeatures.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 bg-[#1DB954] rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tools Visual */}
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#1DB954]/10 to-purple-500/10 rounded-3xl blur-2xl" />
                                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        {[
                                            { name: "Ahrefs", price: "$99/mo" },
                                            { name: "Surfer", price: "$89/mo" },
                                            { name: "Jasper", price: "$49/mo" },
                                            { name: "WordPress", price: "$25/mo" },
                                            { name: "Semrush", price: "$120/mo" },
                                            { name: "Clearscope", price: "$170/mo" },
                                        ].map((tool, i) => (
                                            <div key={i} className="bg-gray-50 rounded-lg p-3 text-center relative">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-0.5 w-full bg-red-400/60 rotate-[-10deg]" />
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium">{tool.name}</p>
                                                <p className="text-sm text-gray-500 line-through">{tool.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-[#1DB954]/10 rounded-xl p-6 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-[#1DB954] rounded-lg flex items-center justify-center">
                                                <LineChart className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-bold text-xl text-gray-900">Optify</span>
                                        </div>
                                        <p className="text-[#1DB954] font-bold text-2xl">$99/mo</p>
                                        <p className="text-gray-600 text-sm mt-1">All-in-one solution</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* How it Works */}
                <ScrollReveal>
                    <div>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                                How it works
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                From setup to traffic growth in 3 simple steps
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {howItWorks.map((item, i) => (
                                <div key={i} className="relative">
                                    {/* Connector line */}
                                    {i < howItWorks.length - 1 && (
                                        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-200" />
                                    )}

                                    <div className="bg-gray-50 rounded-2xl p-8 relative z-10 hover:shadow-lg transition-shadow h-full">
                                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-white mb-6`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Step {item.step}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

            </div>
        </section>
    );
}
