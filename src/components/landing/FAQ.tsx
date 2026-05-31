"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const faqs = [
    {
        question: "How does Optify generate content?",
        answer: "Optify uses advanced AI models to create SEO-optimized content based on your target keywords, search intent, and competitor analysis. Each article is unique, well-researched, and designed to rank on Google.",
    },
    {
        question: "Can I connect my WordPress site?",
        answer: "Yes! Optify supports direct publishing to WordPress, Webflow, Shopify, and more. Simply connect your site, and we'll automatically publish content on your schedule.",
    },
    {
        question: "How many articles can I generate per month?",
        answer: "With the All-in-One plan, you can generate up to 30 articles per month. Each article is fully optimized with proper headings, meta descriptions, and internal linking suggestions.",
    },
    {
        question: "Do I need technical SEO knowledge?",
        answer: "Not at all! Optify handles all the technical aspects of SEO for you. We take care of keyword research, content optimization, and even provide recommendations for improving your existing content.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Absolutely. There are no long-term contracts. You can cancel your subscription at any time, and you'll retain access until the end of your billing period.",
    },
    {
        question: "What makes Optify different from other AI writers?",
        answer: "Unlike generic AI writers, Optify is built specifically for SEO. We analyze search intent, competitor content, and Google's ranking factors to create content that actually ranks—not just sounds good.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Have Questions?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Everything you need to know about Optify
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                                >
                                    <span className="text-lg font-semibold text-gray-900 pr-4">
                                        {faq.question}
                                    </span>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? "bg-[#1DB954] text-white" : "bg-gray-100 text-gray-600"}`}>
                                        {openIndex === index ? (
                                            <Minus className="w-5 h-5" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                    </div>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
