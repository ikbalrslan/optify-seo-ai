import { SectionHeading } from "./SectionHeading";

const testimonials = [
    {
        name: "Alex Smith",
        handle: "@alexsmith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        content: "SEO Engine identified critical technical issues we missed for months. Our organic traffic doubled in 60 days.",
    },
    {
        name: "Sarah Johnson",
        handle: "@sjohnson_dev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        content: "The best keyword research tool I've used. Found low hanging fruit keywords that were easy to rank for.",
    },
    {
        name: "Michael Chen",
        handle: "@mchen_design",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        content: "Simple interface, powerful data. The competitor analysis feature helped us pivot our content strategy.",
    },
    {
        name: "Emily Davis",
        handle: "@emilyd_ux",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        content: "Automated site audits save me hours every week. I just forward the report to my dev team.",
    },
    {
        name: "David Wilson",
        handle: "@dwilson_tech",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        content: "Worth every penny. The backlink monitor alone has saved us from negative SEO attacks.",
    },
    {
        name: "Jessica Brown",
        handle: "@jessb_founder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        content: "Finally an SEO tool that isn't clunky and overpriced. SEO Engine is now part of our daily stack.",
    },
];

export function Testimonials() {
    return (
        <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-16 py-20 md:py-28">
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 sm:px-8">
                <SectionHeading
                    id="reviews-title"
                    title="Loved by founders worldwide"
                    lead="Join thousands of others who are growing their business with data, not guesswork."
                />

                <div>
                    <ul className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((t) => (
                            <li key={t.handle}>
                                <figure className="flex h-full flex-col justify-between gap-6 border-t border-line pt-6">
                                    <blockquote className="leading-relaxed text-ink-body">
                                        &ldquo;{t.content}&rdquo;
                                    </blockquote>
                                    <figcaption className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={t.avatar} alt="" className="size-9 rounded-full bg-paper-deep" />
                                        <span className="flex flex-col text-sm">
                                            <span className="font-semibold text-ink">{t.name}</span>
                                            <span className="font-lp-mono text-xs text-ink-faint">{t.handle}</span>
                                        </span>
                                    </figcaption>
                                </figure>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
