"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";

export function Hero() {
    return (
        <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
            {/* Badge/Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-600 mb-8 border border-gray-200">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                Now with AI-powered suggestions
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl">
                Premium SEO Analysis <br className="hidden md:block" />
                for modern websites
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                Stop guessing why your site isn't ranking. <br className="hidden md:block" />
                Get a comprehensive audit and actionable steps in seconds.
            </p>

            {/* CTA Input Group */}
            <div className="flex flex-col sm:flex-row w-full max-w-md gap-3 mb-12">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">https://</span>
                    </div>
                    <Input
                        type="text"
                        placeholder="your-website.com"
                        className="pl-20 h-12 text-base bg-white border-gray-300 focus-visible:ring-gray-400 rounded-lg"
                    />
                </div>
                <Button className="h-12 px-8 text-base font-medium bg-[#bc5338] hover:bg-[#a64730] text-white rounded-lg transition-colors">
                    Audit my website
                </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mb-20">
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                        </div>
                    ))}
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                        <span className="font-bold">11,842</span> happy founders
                    </p>
                </div>
            </div>

            {/* Dashboard Preview */}
            <div className="w-full relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full w-full pointer-events-none -bottom-1"></div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden max-w-5xl mx-auto">
                    <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Mock Chart Area */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
                                    <h2 className="text-3xl font-bold text-gray-900 mt-1">$124,592.00</h2>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">7D</div>
                                    <div className="px-3 py-1 bg-black text-white rounded-md text-xs font-medium">30D</div>
                                    <div className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">All</div>
                                </div>
                            </div>
                            {/* Placeholder Bar Chart */}
                            <div className="h-64 flex items-end justify-between gap-1 md:gap-2 px-2">
                                {[60, 45, 75, 50, 80, 55, 90, 65, 85, 70, 95, 80].map((h, i) => (
                                    <div key={i} className="w-full bg-gray-900 rounded-t-sm opacity-90 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Mock Metrics Side */}
                        <div className="space-y-4">
                            {[
                                { label: "Active Users", value: "2,402", change: "+12%" },
                                { label: "Conversion Rate", value: "4.2%", change: "+0.8%" },
                                { label: "Avg. Session", value: "3m 42s", change: "-2%" },
                                { label: "Bounce Rate", value: "34%", change: "-5%" },
                            ].map((metric, i) => (
                                <div key={i} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                                    <p className="text-xs text-gray-500 font-medium uppercase">{metric.label}</p>
                                    <div className="flex justify-between items-end mt-1">
                                        <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                                        <span className={`text-xs font-medium ${metric.change.startsWith("+") ? "text-green-600" : "text-green-600"}`}>{metric.change}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
