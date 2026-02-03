"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

const rotatingKeywords = [
    "Auto-Pilot",
    "Content Generation",
    "Keyword Research",
];

export function Hero() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentKeywordIndex((prev) => (prev + 1) % rotatingKeywords.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}
                />
                {/* Green Glow Effects */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-[#1DB954]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#1ed760]/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-5xl mx-auto leading-tight">
                        Grow Organic Traffic{" "}
                        <br className="hidden md:block" />
                        <span className="relative inline-flex h-[1.1em] w-auto overflow-hidden align-bottom">
                            <span
                                className="flex flex-col transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateY(-${currentKeywordIndex * 100}%)` }}
                            >
                                {rotatingKeywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="bg-gradient-to-r from-[#1DB954] to-[#0fa968] bg-clip-text text-transparent whitespace-nowrap h-[1.1em] flex items-center"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </span>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Get recommended by ChatGPT & Rank on Google. Get done-for-you
                        Blog Posts, Keywords Research and SEO Tools while you sleep.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Button
                            variant="outline"
                            className="h-12 px-6 text-base font-medium border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Join with Google
                        </Button>
                        <Button
                            className="h-12 px-8 text-base font-medium bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg flex items-center gap-2 transition-colors"
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            Get Started for Free
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
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
                                <span className="font-bold">50k+</span> Articles Created
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating UI Elements */}
                <div className="relative mt-16 hidden lg:block">
                    {/* SEO Content Score Card - Left */}
                    <div className="absolute -left-4 top-0 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-48 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <p className="text-xs text-gray-500 font-medium mb-2">SEO Content Score</p>
                        <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14">
                                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200"
                                        strokeWidth="3"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-[#1DB954]"
                                        strokeWidth="3"
                                        strokeDasharray="97, 100"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">97%</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Excellent</p>
                                <div className="flex gap-0.5 mt-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="w-1.5 h-3 bg-[#1DB954] rounded-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Power Keywords Card - Left Bottom */}
                    <div className="absolute left-8 top-40 bg-white rounded-xl shadow-xl border border-gray-100 p-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1DB954]/10 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Power Keywords</span>
                        </div>
                    </div>

                    {/* Personal Images Tag - Right Top */}
                    <div className="absolute right-8 top-0 bg-white rounded-xl shadow-xl border border-gray-100 p-3 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Personal Images</span>
                        </div>
                    </div>

                    {/* Blog Post Card - Right */}
                    <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-56 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-medium text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full">Published</span>
                            <span className="text-[10px] text-gray-400">Just now</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">How to write blog posts that rank on Google</p>
                        <p className="text-xs text-gray-500 line-clamp-2">Complete guide to SEO content writing...</p>
                    </div>
                </div>

                {/* Video/Demo Section */}
                <div className="mt-20 lg:mt-32 relative max-w-4xl mx-auto">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#1DB954]/20 via-[#1ed760]/10 to-[#1DB954]/20 rounded-2xl blur-2xl" />
                    <div className="relative rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                        <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg cursor-pointer hover:bg-[#1ed760] transition-colors">
                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">Watch how Optify works</p>
                            </div>
                        </div>
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
