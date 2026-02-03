"use client";

import { ScrollReveal } from "./ScrollReveal";

export function ClientSuccess() {
    return (
        <section className="py-20 md:py-32 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            The <span className="bg-gradient-to-r from-[#1DB954] to-[#0fa968] bg-clip-text text-transparent">Optify</span> Effect
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            See how our users grow their organic traffic month after month
                        </p>
                    </div>
                </ScrollReveal>

                {/* Growth Chart */}
                <ScrollReveal>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Organic Traffic</p>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">+247%</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#1DB954]" />
                                    <span className="text-sm text-gray-600">With Optify</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                                    <span className="text-sm text-gray-600">Without</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Visualization */}
                        <div className="relative h-64 md:h-80">
                            <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1={60 + i * 60}
                                        x2="800"
                                        y2={60 + i * 60}
                                        stroke="#e5e7eb"
                                        strokeWidth="1"
                                    />
                                ))}

                                {/* Comparison line (without Optify) */}
                                <path
                                    d="M 0 250 Q 200 245 400 240 T 800 235"
                                    fill="none"
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                    strokeDasharray="8 4"
                                />

                                {/* Growth line (with Optify) */}
                                <defs>
                                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#1DB954" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#1DB954" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 0 250 Q 100 240 200 200 T 400 120 T 600 60 T 800 20"
                                    fill="none"
                                    stroke="#1DB954"
                                    strokeWidth="3"
                                />
                                {/* Fill under curve */}
                                <path
                                    d="M 0 250 Q 100 240 200 200 T 400 120 T 600 60 T 800 20 L 800 300 L 0 300 Z"
                                    fill="url(#greenGradient)"
                                />
                            </svg>

                            {/* Month labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 pt-2">
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Success Story */}
                <ScrollReveal>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 max-w-3xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=founder1"
                                    alt="Success Story"
                                    className="w-20 h-20 rounded-full border-4 border-[#1DB954]/20"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <span className="text-2xl font-bold text-[#1DB954]">+312%</span>
                                    <span className="text-gray-600">organic traffic increase</span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Optify transformed our content strategy. We went from 2,000 to 15,000 monthly visitors in just 4 months without hiring a single writer."
                                </p>
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="font-semibold text-gray-900">Sarah Johnson</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">Founder, TechStartup.io</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
