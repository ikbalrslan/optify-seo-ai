"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getAutopilotStats, type AutopilotStats, type StatsPeriod } from "@/actions/dashboard";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import Link from "next/link";

function AnimatedNumber({ value, isLoading }: { value: number; isLoading: boolean }) {
    const animatedValue = useAnimatedCounter(value, 800, !isLoading);
    return <>{animatedValue}</>;
}

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
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium">Scheduled</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                <AnimatedNumber value={stats.scheduled} isLoading={isLoading} />
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium">Published</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                                <AnimatedNumber value={stats.published} isLoading={isLoading} />
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <span className="font-medium">Failed</span>
                            </div>
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                                <AnimatedNumber value={stats.failed} isLoading={isLoading} />
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
