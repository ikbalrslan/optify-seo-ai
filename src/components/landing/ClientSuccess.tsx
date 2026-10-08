"use client";

import { ScrollReveal } from "./ScrollReveal";
import { SectionHeading } from "./SectionHeading";
import { ApexChart } from "@/components/shared/ApexChart";

// Chart colours mirror the landing tokens in globals.css (ApexCharts needs literal values).
const BRAND = "#009E8A";
const BASELINE = "#B8AC94";
const FAINT = "#9B927F";
const GRID = "#EBE2D2";

export function ClientSuccess() {
    const reduceMotion =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return (
        <section aria-labelledby="optify-effect" className="bg-paper-deep py-20 md:py-28">
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 sm:px-8">
                <SectionHeading
                    id="optify-effect"
                    title="The Optify effect"
                    lead="See how our users grow their organic traffic month after month."
                />

                <ScrollReveal className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
                    <div className="flex flex-col gap-6 rounded-xl border border-line bg-white p-5 sm:p-8 lg:col-span-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-ink-muted">Total organic traffic</p>
                                <p className="font-lp-display text-4xl font-bold tabular-nums text-ink [font-variation-settings:'wdth'_112]">
                                    +247%
                                </p>
                            </div>
                            <ul className="flex items-center gap-5 text-sm text-ink-muted">
                                <li className="flex items-center gap-2">
                                    <span className="h-0.5 w-4 bg-brand" aria-hidden="true" />
                                    With Optify
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="h-0.5 w-4" style={{ background: BASELINE }} aria-hidden="true" />
                                    Without
                                </li>
                            </ul>
                        </div>

                        <div className="relative h-64 w-full md:h-72">
                            <ApexChart
                                type="area"
                                height="100%"
                                width="100%"
                                options={{
                                    chart: {
                                        type: "area",
                                        toolbar: { show: false },
                                        zoom: { enabled: false },
                                        fontFamily: "inherit",
                                        animations: { enabled: !reduceMotion, speed: 700 },
                                    },
                                    colors: [BRAND, BASELINE],
                                    stroke: { curve: "smooth", width: [2.5, 2] },
                                    fill: {
                                        type: ["gradient", "solid"],
                                        gradient: {
                                            shadeIntensity: 1,
                                            opacityFrom: 0.28,
                                            opacityTo: 0.02,
                                            stops: [0, 90, 100],
                                        },
                                        solid: { opacity: 0.06 },
                                    },
                                    dataLabels: { enabled: false },
                                    xaxis: {
                                        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                                        axisBorder: { show: false },
                                        axisTicks: { show: false },
                                        labels: { style: { colors: FAINT, fontSize: "12px" } },
                                    },
                                    yaxis: { show: false },
                                    grid: {
                                        show: true,
                                        borderColor: GRID,
                                        strokeDashArray: 3,
                                        padding: { top: 0, right: 0, bottom: 0, left: 10 },
                                    },
                                    legend: { show: false },
                                    tooltip: {
                                        y: { formatter: (val: number) => `${val}%` },
                                    },
                                }}
                                series={[
                                    { name: "With Optify", data: [30, 45, 80, 160, 230, 312] },
                                    { name: "Without", data: [20, 25, 30, 35, 38, 42] },
                                ]}
                            />
                        </div>
                    </div>

                    <figure className="flex flex-col gap-5 lg:col-span-4 lg:pt-4">
                        <p className="flex items-baseline gap-2">
                            <span className="font-lp-display text-3xl font-bold tabular-nums text-brand-deep">+312%</span>
                            <span className="text-ink-muted">organic traffic</span>
                        </p>
                        <blockquote className="text-lg leading-relaxed text-ink">
                            &ldquo;Optify transformed our content strategy. We went from 2,000 to 15,000 monthly visitors in
                            just 4 months without hiring a single writer.&rdquo;
                        </blockquote>
                        <figcaption className="flex items-center gap-3 border-t border-line pt-5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=founder1"
                                alt=""
                                className="size-10 rounded-full bg-paper"
                            />
                            <span className="flex flex-col text-sm">
                                <span className="font-semibold text-ink">Sarah Johnson</span>
                                <span className="text-ink-muted">Founder, TechStartup.io</span>
                            </span>
                        </figcaption>
                    </figure>
                </ScrollReveal>
            </div>
        </section>
    );
}
