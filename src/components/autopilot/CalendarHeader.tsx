"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CalendarHeaderProps {
    month: number;
    year: number;
    totalPosts: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function CalendarHeader({
    month,
    year,
    totalPosts,
    onPrevMonth,
    onNextMonth,
    onToday
}: CalendarHeaderProps) {
    // Countdown to next generation (every 5 minutes for testing)
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateCountdown = () => {
            const now = new Date();
            // Next 5-minute mark for testing (e.g., :00, :05, :10, :15, etc.)
            const next5Min = new Date();
            const currentMinutes = now.getMinutes();
            const nextMinuteMark = Math.ceil((currentMinutes + 1) / 5) * 5;
            next5Min.setMinutes(nextMinuteMark, 0, 0);

            // If we've passed the hour, move to next hour
            if (next5Min <= now) {
                next5Min.setMinutes(next5Min.getMinutes() + 5);
            }

            const diff = next5Min.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({ hours, minutes, seconds });
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate next month for date range display
    const nextMonthNum = month === 12 ? 1 : month + 1;
    const nextMonthYear = month === 12 ? year + 1 : year;

    return (
        <div className="p-4">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-md">
                        <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8 rounded-r-none border-r border-slate-200">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8 rounded-l-none">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToday}
                        className="text-xs font-medium"
                    >
                        Today
                    </Button>
                    <span className="text-sm font-medium text-slate-700 ml-2">
                        {SHORT_MONTHS[month - 1]} {year} - {SHORT_MONTHS[nextMonthNum - 1]} {nextMonthYear}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Next Generation Countdown */}
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <span>Next Generation:</span>
                        <span className="font-mono font-medium text-slate-700 tabular-nums">
                            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                        </span>
                    </div>

                    <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-sm text-slate-500 hover:text-slate-900 gap-1.5">
                                <HelpCircle className="h-4 w-4" />
                                Calendar Guide
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72 p-4" align="end">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-[#1DB954]" />
                                <h3 className="font-bold text-slate-900">How It Works</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1DB954] text-white flex items-center justify-center text-[10px] font-bold">
                                        1
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Click a Date</p>
                                        <p className="text-xs text-slate-500">Select any future date</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1DB954] text-white flex items-center justify-center text-[10px] font-bold">
                                        2
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Configure Post</p>
                                        <p className="text-xs text-slate-500">Set keyword, tone</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1DB954] text-white flex items-center justify-center text-[10px] font-bold">
                                        3
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Auto-Generate</p>
                                        <p className="text-xs text-slate-500">Posts generate at 9 AM</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1DB954] text-white flex items-center justify-center text-[10px] font-bold">
                                        4
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">Auto-Publish</p>
                                        <p className="text-xs text-slate-500">Content goes live on WordPress</p>
                                    </div>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            </div>

            {/* Month Title Row */}
            <div className="pt-6 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                    {MONTHS[month - 1]} {year}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {totalPosts} article{totalPosts !== 1 ? "s" : ""} this month
                </p>
            </div>
        </div>
    );
}
