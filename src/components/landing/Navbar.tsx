"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, BarChart, ArrowRight } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-[#1DB954] p-1.5 rounded-lg">
                                <BarChart className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Optify</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="#features" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            How it works
                        </Link>
                        <Link href="#pricing" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            Pricing
                        </Link>
                        <Link href="#faq" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            FAQ
                        </Link>
                        <Link href="/blog" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            Blog
                        </Link>

                        <div className="flex items-center gap-3 ml-4">
                            <Button
                                variant="outline"
                                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Join with Google
                            </Button>
                            <Button
                                className="h-9 px-4 text-sm font-medium bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg flex items-center gap-1.5 transition-colors"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                Start for Free
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-500 hover:text-black focus:outline-none p-2"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="#features"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-green-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            How it works
                        </Link>
                        <Link
                            href="#pricing"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-green-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#faq"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-green-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/blog"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-green-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Blog
                        </Link>
                        <div className="pt-4 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-center border-gray-300"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsAuthModalOpen(true);
                                }}
                            >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Join with Google
                            </Button>
                            <Button
                                className="w-full bg-[#1DB954] text-white hover:bg-[#1ed760] justify-center transition-colors"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsAuthModalOpen(true);
                                }}
                            >
                                Start for Free
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView="login"
            />
        </nav>
    );
}
