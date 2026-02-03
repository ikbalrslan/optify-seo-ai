"use client";

import Link from "next/link";
import { BarChart } from "lucide-react";

export function BlogNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/blog" className="flex items-center gap-2">
                            <div className="bg-[#1DB954] p-1.5 rounded-lg">
                                <BarChart className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Optify Blog</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/blog"
                            className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors"
                        >
                            Blog Home
                        </Link>
                        <Link
                            href="/"
                            className="bg-[#1DB954] text-white hover:bg-[#1ed760] rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Optify App
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
