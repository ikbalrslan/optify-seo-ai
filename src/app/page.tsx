import { Archivo, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { AccountDeletedPopup } from "@/components/shared/AccountDeletedPopup";
import { cn } from "@/lib/utils";

// Landing-only faces. They are attached to <main> below, so the logged-in app keeps Inter.
// Archivo's width axis gives headings their expanded, "masthead" feel; Public Sans keeps
// running text plain and readable; Plex Mono is for dates, slugs and prices.
const display = Archivo({
    subsets: ["latin"],
    axes: ["wdth"],
    variable: "--lp-font-display",
    display: "swap",
});

const text = Public_Sans({
    subsets: ["latin"],
    variable: "--lp-font-text",
    display: "swap",
});

const mono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--lp-font-mono",
    display: "swap",
});

export default function Home() {
    return (
        <main
            className={cn(
                "landing min-h-screen bg-paper text-ink-body selection:bg-brand/20 selection:text-ink",
                display.variable,
                text.variable,
                mono.variable
            )}
        >
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <FAQ />
            <Footer />
            <AccountDeletedPopup />
        </main>
    );
}
