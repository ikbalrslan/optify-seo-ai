"use client";

import { ScrollReveal } from "./ScrollReveal";
import { ApexChart } from "@/components/shared/ApexChart";

export function ClientSuccess() {
    return (
        <section className="py-20 md:py-32 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            The <span className="bg-gradient-to-r from-[#1DB954] to-[#0fa968] bg-clip-text text-transparent">Optify</span> Effect
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            See how our users grow their organic traffic month after month
                        </p>
                    </div>
                </ScrollReveal>

                {/* Growth Chart */}
                <ScrollReveal>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Organic Traffic</p>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">+247%</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#1DB954]" />
                                    <span className="text-sm text-gray-600">With Optify</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                                    <span className="text-sm text-gray-600">Without</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Visualization */}
                        <div className="relative h-64 md:h-80 w-full">
                            <ApexChart
                                type="area"
                                height="100%"
                                width="100%"
                                options={{
                                    chart: {
                                        type: 'area',
                                        toolbar: { show: false },
                                        fontFamily: 'inherit',
                                        animations: {
                                            enabled: true,
                                            speed: 800,
                                            animateGradually: { enabled: true, delay: 150 },
                                            dynamicAnimation: { enabled: true, speed: 350 }
                                        }
                                    },
                                    colors: ['#1DB954', '#9ca3af'], // Green, Gray
                                    stroke: { curve: 'smooth', width: 3 },
                                    fill: {
                                        type: ['gradient', 'solid'],
                                        gradient: {
                                            shadeIntensity: 1,
                                            opacityFrom: 0.4,
                                            opacityTo: 0.05,
                                            stops: [0, 90, 100]
                                        },
                                        solid: { opacity: 0.1 }
                                    },
                                    dataLabels: { enabled: false },
                                    xaxis: {
                                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                        axisBorder: { show: false },
                                        axisTicks: { show: false },
                                        labels: { style: { colors: '#9ca3af', fontSize: '12px' } }
                                    },
                                    yaxis: { show: false },
                                    grid: {
                                        show: true,
                                        borderColor: '#f3f4f6',
                                        strokeDashArray: 4,
                                        padding: { top: 0, right: 0, bottom: 0, left: 10 }
                                    },
                                    legend: { show: false },
                                    tooltip: {
                                        y: { formatter: (val: number) => `${val}%` }
                                    }
                                }}
                                series={[
                                    {
                                        name: 'With Optify',
                                        data: [30, 45, 80, 160, 230, 312]
                                    },
                                    {
                                        name: 'Without',
                                        data: [20, 25, 30, 35, 38, 42]
                                    }
                                ]}
                            />
                        </div>
                    </div>
                </ScrollReveal>

                {/* Success Story */}
                <ScrollReveal>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 max-w-3xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=founder1"
                                    alt="Success Story"
                                    className="w-20 h-20 rounded-full border-4 border-[#1DB954]/20"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <span className="text-2xl font-bold text-[#1DB954]">+312%</span>
                                    <span className="text-gray-600">organic traffic increase</span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Optify transformed our content strategy. We went from 2,000 to 15,000 monthly visitors in just 4 months without hiring a single writer."
                                </p>
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="font-semibold text-gray-900">Sarah Johnson</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">Founder, TechStartup.io</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
