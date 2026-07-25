"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function BlogNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF6EF]/85 backdrop-blur-md border-b border-[#E7DFCF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/blog" className="flex items-center gap-2">
                            <div className="bg-[#009E8A] p-1.5 rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" strokeWidth={1.75} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-[#1C1815]">Optify Blog</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/blog"
                            className="text-[#6F675A] hover:text-[#009E8A] font-medium text-sm transition-colors"
                        >
                            Blog Home
                        </Link>
                        <Link
                            href="/"
                            className="bg-[#009E8A] text-white hover:bg-[#00877A] rounded-full px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Optify App
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
