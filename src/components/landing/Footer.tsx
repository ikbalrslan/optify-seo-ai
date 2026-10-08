import { OptifyLogo } from "@/components/brand/OptifyMark";

const columns = [
    {
        title: "Product",
        links: [
            { href: "#features", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
            { href: "/blog", label: "Blog" },
            { href: "/signin", label: "Log in" },
        ],
    },
    {
        title: "Legal",
        links: [
            { href: "#", label: "Privacy Policy" },
            { href: "#", label: "Terms of Service" },
            { href: "#", label: "DPA" },
        ],
    },
    {
        title: "Social",
        links: [
            { href: "#", label: "Twitter" },
            { href: "#", label: "GitHub" },
            { href: "#", label: "Discord" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-line py-14 md:py-20">
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 sm:px-8">
                <div className="grid grid-cols-3 gap-x-6 gap-y-10 md:grid-cols-12">
                    <div className="col-span-3 flex flex-col gap-4 md:col-span-6">
                        <OptifyLogo size={24} className="font-lp-display" />
                        <p className="max-w-[38ch] text-sm leading-relaxed text-ink-muted">
                            SEO on autopilot, built for founders. Optify plans your content, writes the articles and
                            publishes them, so your site keeps growing while you build the business.
                        </p>
                    </div>

                    {columns.map((col) => (
                        <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4 md:col-span-2">
                            <h2 className="lp-label text-ink-faint">{col.title}</h2>
                            <ul className="flex flex-col gap-2.5 text-sm">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-ink-body transition-colors hover:text-brand-deep">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <p className="border-t border-line pt-6 text-sm text-ink-faint">
                    © {new Date().getFullYear()} Optify. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
