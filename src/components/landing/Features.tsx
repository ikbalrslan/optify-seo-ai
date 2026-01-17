"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, Globe, Zap, MousePointer2, Smartphone, ShieldCheck } from "lucide-react";

const features = [
    {
        title: "Rank Tracker",
        description: "Monitor your keyword rankings across Google, Bing, and Yahoo. Get daily updates and historical data.",
        icon: <Globe className="w-6 h-6" />,
        colSpan: "col-span-1 md:col-span-2",
    },
    {
        title: "Site Audit",
        description: "Identify broken links, missing meta tags, and slow pages affecting your SEO score.",
        icon: <Zap className="w-6 h-6" />,
        colSpan: "col-span-1",
    },
    {
        title: "Backlink Monitor",
        description: "Track your backlink profile and get alerted when you gain or lose links.",
        icon: <BarChart3 className="w-6 h-6" />,
        colSpan: "col-span-1",
    },
    {
        title: "Keyword Research",
        description: "Find high-volume, low-competition keywords to target for your next content piece.",
        icon: <MousePointer2 className="w-6 h-6" />,
        colSpan: "col-span-1 md:col-span-2",
    },
];

export function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* How it works */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Dominate search results <br /> in 3 steps
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our automated engine handles the technical heavy lifting so you can focus on content.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Connect Account",
                                desc: "Sync your Google Search Console to get access to accurate search data.",
                                color: "bg-blue-50 text-blue-600",
                            },
                            {
                                step: "02",
                                title: "Run Audit",
                                desc: "Our crawler analyzes your site for 100+ technical SEO factors automatically.",
                                color: "bg-yellow-50 text-yellow-600",
                            },
                            {
                                step: "03",
                                title: "Optimize",
                                desc: "Follow our prioritized checklist to fix issues and climb the rankings.",
                                color: "bg-green-50 text-green-600",
                            },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-8 relative overflow-hidden group hover:shadow-lg transition-shadow">
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl font-bold ${item.color.split(" ")[1]}`}>
                                    {item.step}
                                </div>
                                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-6 font-bold text-lg`}>
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Features Grid */}
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything you need to grow
                        </h2>
                        <p className="text-lg text-gray-600">
                            Powerful features without the enterprise bloat.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <Card key={i} className={`p-8 bg-gray-50 border-none shadow-none hover:bg-gray-100 transition-colors ${feature.colSpan}`}>
                                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm text-black">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                                {/* Visual Placeholder for features */}
                                <div className="mt-8 h-32 bg-white/50 rounded-lg border border-gray-100 w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-gray-50/50"></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
