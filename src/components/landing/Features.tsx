import { ScrollReveal } from "./ScrollReveal";
import { SectionHeading } from "./SectionHeading";
import { OptifyMark } from "@/components/brand/OptifyMark";
import { ALL_IN_PLAN } from "@/config/plans";

const replaceToolsFeatures = [
    "AI-powered keyword research",
    "SEO content generation",
    "Topic clustering and strategy",
    "Auto-publishing to WordPress",
    "Content calendar and scheduling",
    "Performance analytics",
    "Multi-language support",
];

const replacedTools = [
    { name: "Ahrefs", price: 99 },
    { name: "Semrush", price: 120 },
    { name: "Surfer", price: 89 },
    { name: "Clearscope", price: 170 },
    { name: "Jasper", price: 49 },
    { name: "WordPress", price: 25 },
];

const replacedTotal = replacedTools.reduce((sum, tool) => sum + tool.price, 0);

const howItWorks = [
    {
        title: "Deep analysis of your business",
        description:
            "Add your website. Optify works out your niche, your competitors and who you sell to, and turns that into an SEO strategy for your site.",
    },
    {
        title: "A 30-day SEO content plan",
        description:
            "You get a month of articles, each aimed at a keyword and its search intent, grouped into topic clusters and laid out on a calendar.",
    },
    {
        title: "Articles written and published on autopilot",
        description: `Optify writes each article and publishes it to WordPress or to the blog we host for you. Up to ${ALL_IN_PLAN.articles} articles a month per site.`,
    },
];

export function Features() {
    return (
        <section id="features" aria-labelledby="how-it-works" className="scroll-mt-16 border-b border-line py-20 md:py-28">
            <div className="mx-auto flex max-w-6xl flex-col gap-24 px-5 sm:px-8 md:gap-32">
                {/* How it works: a real sequence, so the steps are numbered. */}
                <ScrollReveal className="flex flex-col gap-12">
                    <SectionHeading
                        id="how-it-works"
                        title="How it works"
                        lead="Three steps from adding your site to a blog that fills itself."
                    />
                    <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
                        {howItWorks.map((item, i) => (
                            <li key={item.title} className="flex flex-col gap-3 border-t-2 border-ink pt-5">
                                <span className="font-lp-mono text-sm tabular-nums text-brand-deep">Step {i + 1}</span>
                                <h3 className="lp-h3 text-ink">{item.title}</h3>
                                <p className="max-w-[42ch] leading-relaxed text-ink-muted">{item.description}</p>
                            </li>
                        ))}
                    </ol>
                </ScrollReveal>

                {/* Replace multiple tools: a priced ledger rather than another card grid. */}
                <ScrollReveal className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="flex flex-col gap-8">
                        <SectionHeading
                            title="Replace multiple tools with one"
                            lead="Keyword research, planning, writing and publishing usually means a stack of subscriptions. Optify does the whole loop in one place."
                        />
                        <ul className="grid gap-x-8 sm:grid-cols-2">
                            {replaceToolsFeatures.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center gap-3 border-b border-line-soft py-2.5 text-[0.9375rem] text-ink-body"
                                >
                                    <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl bg-paper-deep p-5 sm:p-8">
                        <table className="w-full border-collapse text-[0.9375rem]">
                            <caption className="lp-label pb-4 text-left text-ink-faint">Typical monthly stack</caption>
                            <tbody>
                                {replacedTools.map((tool) => (
                                    <tr key={tool.name} className="border-b border-line">
                                        <th scope="row" className="py-2.5 text-left font-normal text-ink-muted">
                                            {tool.name}
                                        </th>
                                        <td className="py-2.5 text-right font-lp-mono tabular-nums text-ink-muted line-through decoration-clay/70">
                                            ${tool.price}/mo
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <th scope="row" className="pb-6 pt-3 text-left font-medium text-ink">
                                        Total
                                    </th>
                                    <td className="pb-6 pt-3 text-right font-lp-mono font-medium tabular-nums text-ink">
                                        ${replacedTotal}/mo
                                    </td>
                                </tr>
                                <tr className="border-t-2 border-ink">
                                    <th scope="row" className="pt-5 text-left">
                                        <span className="flex items-center gap-2 font-lp-display text-lg font-bold text-ink">
                                            <OptifyMark size={20} />
                                            Optify
                                        </span>
                                    </th>
                                    <td className="pt-5 text-right">
                                        <span className="font-lp-display text-2xl font-bold tabular-nums text-brand-deep">
                                            ${ALL_IN_PLAN.price}
                                        </span>
                                        <span className="text-sm text-ink-muted">/mo per site</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
