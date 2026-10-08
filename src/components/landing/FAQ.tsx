"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const faqs = [
    {
        question: "How does Optify generate content?",
        answer: "Optify uses advanced AI models to create SEO-optimized content based on your target keywords, search intent, and competitor analysis. Each article is unique, well-researched, and designed to rank on Google.",
    },
    {
        question: "Can I connect my WordPress site?",
        answer: "Yes. Optify supports direct publishing to WordPress, Webflow, Shopify, and more. Connect your site, and we'll automatically publish content on your schedule.",
    },
    {
        question: "How many articles can I generate per month?",
        answer: "With the ALL-IN plan, you can generate up to 30 articles per month for each site. Each article is fully optimized with proper headings, meta descriptions, and internal linking suggestions.",
    },
    {
        question: "Do I need technical SEO knowledge?",
        answer: "No. Optify handles the technical side of SEO for you: keyword research, content optimization, and recommendations for improving your existing content.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes. There are no long-term contracts. You can cancel your subscription at any time, and you'll keep access until the end of your billing period.",
    },
    {
        question: "What makes Optify different from other AI writers?",
        answer: "Optify is built specifically for SEO. It analyzes search intent, competitor content, and Google's ranking factors so each article is written to rank, not just to read well.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
                <SectionHeading
                    id="faq-title"
                    title="Questions founders ask"
                    lead="Everything you need to know about Optify."
                    className="lg:sticky lg:top-28 lg:col-span-4"
                />

                <ul className="border-t border-line lg:col-span-8">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <li key={faq.question} className="border-b border-line">
                                <h3>
                                    <button
                                        type="button"
                                        id={`faq-q-${index}`}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-a-${index}`}
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                                    >
                                        <span className="text-lg font-semibold text-ink transition-colors group-hover:text-brand-deep">
                                            {faq.question}
                                        </span>
                                        <Plus
                                            aria-hidden="true"
                                            strokeWidth={1.75}
                                            className={cn(
                                                "size-5 shrink-0 text-ink-muted transition-transform duration-200",
                                                isOpen && "rotate-45 text-brand-deep"
                                            )}
                                        />
                                    </button>
                                </h3>
                                <div
                                    id={`faq-a-${index}`}
                                    role="region"
                                    aria-labelledby={`faq-q-${index}`}
                                    hidden={!isOpen}
                                    className="max-w-[62ch] pb-6 leading-relaxed text-ink-muted"
                                >
                                    {faq.answer}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
