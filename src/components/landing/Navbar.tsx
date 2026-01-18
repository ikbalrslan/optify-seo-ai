"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, BarChart } from "lucide-react";
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
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#pricing" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            Pricing
                        </Link>
                        <Link href="#faq" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            FAQ
                        </Link>
                        <Link href="#reviews" className="text-gray-600 hover:text-[#1DB954] font-medium text-sm transition-colors">
                            Reviews
                        </Link>
                        <Button
                            variant="default"
                            className="bg-[#1DB954] text-white hover:bg-[#1ed760] rounded-lg px-5 h-9 text-sm font-medium transition-colors"
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            Log in
                        </Button>
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
                            href="#reviews"
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#1DB954] hover:bg-green-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Reviews
                        </Link>
                        <div className="pt-2">
                            <Button
                                className="w-full bg-[#1DB954] text-white hover:bg-[#1ed760] justify-center transition-colors"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsAuthModalOpen(true);
                                }}
                            >
                                Log in
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
