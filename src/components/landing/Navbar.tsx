"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { OptifyLogo } from "@/components/brand/OptifyMark";
import { cn } from "@/lib/utils";
import { GoogleIcon, lpButton } from "./GoogleIcon";

const links = [
    { href: "#features", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Blog" },
];

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuth = () => {
        setIsMenuOpen(false);
        setIsAuthModalOpen(true);
    };

    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md"
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
                <Link href="/" aria-label="Optify home" className="rounded-sm">
                    <OptifyLogo size={26} className="font-lp-display" />
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    <ul className="flex items-center gap-7">
                        {links.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="outline"
                            className={cn(lpButton.secondary, "h-9 px-3.5 text-sm")}
                            onClick={openAuth}
                        >
                            <GoogleIcon />
                            Join with Google
                        </Button>
                        <Button className={cn(lpButton.primary, "h-9 px-4 text-sm")} onClick={openAuth}>
                            Start for free
                        </Button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-expanded={isMenuOpen}
                    aria-controls="landing-mobile-menu"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="-mr-2 rounded-md p-2 text-ink-muted hover:text-ink md:hidden"
                >
                    {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {isMenuOpen && (
                <div id="landing-mobile-menu" className="absolute w-full border-b border-line bg-paper md:hidden">
                    <div className="flex flex-col gap-6 px-5 pb-6 pt-2">
                        <ul className="flex flex-col">
                            {links.map((link) => (
                                <li key={link.href} className="border-b border-line-soft last:border-b-0">
                                    <Link
                                        href={link.href}
                                        className="block py-3 text-base font-medium text-ink hover:text-brand-deep"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col gap-2.5">
                            <Button variant="outline" className={cn(lpButton.secondary, "w-full")} onClick={openAuth}>
                                <GoogleIcon />
                                Join with Google
                            </Button>
                            <Button className={cn(lpButton.primary, "w-full")} onClick={openAuth}>
                                Start for free
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
