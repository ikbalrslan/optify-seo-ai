"use client";

import { Card } from "@/components/ui/card";

const testimonials = [
    {
        name: "Alex Smith",
        handle: "@alexsmith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        content: "SEO Engine identified critical technical issues we missed for months. Our organic traffic doubled in 60 days.",
        date: "2 days ago"
    },
    {
        name: "Sarah Johnson",
        handle: "@sjohnson_dev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        content: "The best keyword research tool I've used. Found low hanging fruit keywords that were easy to rank for.",
        date: "1 week ago"
    },
    {
        name: "Michael Chen",
        handle: "@mchen_design",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        content: "Simple interface, powerful data. The competitor analysis feature helped us pivot our content strategy.",
        date: "3 days ago"
    },
    {
        name: "Emily Davis",
        handle: "@emilyd_ux",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        content: "Automated site audits save me hours every week. I just forward the report to my dev team.",
        date: "Yesterday"
    },
    {
        name: "David Wilson",
        handle: "@dwilson_tech",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        content: "Worth every penny. The backlink monitor alone has saved us from negative SEO attacks.",
        date: "5 days ago"
    },
    {
        name: "Jessica Brown",
        handle: "@jessb_founder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        content: "Finally an SEO tool that isn't clunky and overpriced. SEO Engine is now part of our daily stack.",
        date: "Just now"
    }
];

export function Testimonials() {
    return (
        <section id="reviews" className="py-24 bg-[#F5EFE4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#1C1815] mb-6">
                        Loved by founders worldwide
                    </h2>
                    <p className="text-lg text-[#6F675A] max-w-2xl mx-auto">
                        Join thousands of others who are growing their business with data, not guesswork.
                    </p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {testimonials.map((t, i) => (
                        <Card key={i} className="p-6 bg-white border border-[#E7DFCF] shadow-sm break-inside-avoid hover:shadow-md transition-shadow rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#F5EFE4] overflow-hidden">
                                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#1C1815] text-sm">{t.name}</p>
                                    <p className="text-[#9B927F] text-xs">{t.handle}</p>
                                </div>
                                <div className="ml-auto text-[#D9CFBB]">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </div>
                            </div>
                            <p className="text-[#1C1815]/80 leading-relaxed text-sm">
                                "{t.content}"
                            </p>
                            <div className="mt-4 pt-4 border-t border-[#F0E9DB] text-xs text-[#9B927F]">
                                {t.date}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
