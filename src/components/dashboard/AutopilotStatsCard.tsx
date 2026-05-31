"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2 } from "lucide-react";
import { getAutopilotStats, type AutopilotStats, type StatsPeriod } from "@/actions/dashboard";
import Link from "next/link";
import { ApexChart } from "@/components/shared/ApexChart";
import { ApexOptions } from "apexcharts";

export function AutopilotStatsCard() {
    const [period, setPeriod] = useState<StatsPeriod>("month");
    const [stats, setStats] = useState<AutopilotStats>({ scheduled: 0, published: 0, failed: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true);
            try {
                const data = await getAutopilotStats(period);
                setStats(data);
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, [period]);

    const total = stats.scheduled + stats.published + stats.failed;
    const hasData = total > 0;

    const chartOptions: ApexOptions = {
        chart: {
            type: "donut",
            fontFamily: "inherit",
        },
        labels: ["Scheduled", "Published", "Failed"],
        colors: ["#3B82F6", "#22C55E", "#EF4444"], // blue, green, red
        legend: {
            position: "bottom",
            fontFamily: "inherit",
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number, opts: { seriesIndex: number; w: { config: { series: number[] } } }) => {
                return opts.w.config.series[opts.seriesIndex].toString();
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: "14px",
                            fontWeight: 600,
                        },
                        value: {
                            show: true,
                            fontSize: "24px",
                            fontWeight: 700,
                        },
                        total: {
                            show: true,
                            label: "Total",
                            fontSize: "14px",
                            fontWeight: 600,
                            formatter: () => total.toString(),
                        },
                    },
                },
            },
        },
        stroke: {
            width: 2,
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (val: number) => `${val} posts`,
            },
        },
    };

    const series = [stats.scheduled, stats.published, stats.failed];

    return (
        <Card className="col-span-3 border-primary/10">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-[#1DB954]" />
                            <span>Autopilot</span>
                            <Select value={period} onValueChange={(val: StatsPeriod) => setPeriod(val)}>
                                <SelectTrigger className="w-[130px] h-7 text-sm ml-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardTitle>
                        <CardDescription>
                            Scheduled blog post activity
                        </CardDescription>
                    </div>
                    <Link
                        href="/autopilot"
                        className="text-sm text-[#1DB954] hover:underline"
                    >
                        View Calendar →
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#1DB954]" />
                    </div>
                ) : !hasData ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="text-muted-foreground mb-2">No autopilot activity yet.</div>
                        <Link href="/autopilot" className="text-sm text-primary hover:underline">
                            Schedule your first post →
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <ApexChart
                            options={chartOptions}
                            series={series}
                            type="donut"
                            height={280}
                            width="100%"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
