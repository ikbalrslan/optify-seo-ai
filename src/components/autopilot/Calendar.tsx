"use client";

import { useState, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "./CalendarHeader";

// Base type for calendar - accepts posts with at least these fields
export type CalendarPost = {
    id: string;
    keyword: string;
    status: string;
    scheduledDate: Date;
    generatedTitle?: string | null;
    publishedPostUrl?: string | null;
};

interface CalendarProps {
    posts: CalendarPost[];
    onDateClick: (date: Date) => void;
    onPostClick: (post: CalendarPost) => void;
    onPostDelete?: (postId: string) => void;
    month: number;
    year: number;
    onMonthChange: (month: number, year: number) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({ posts, onDateClick, onPostClick, onPostDelete, month, year, onMonthChange }: CalendarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Count posts for current month
    const totalPostsThisMonth = posts.filter(post => {
        const postDate = new Date(post.scheduledDate);
        return postDate.getMonth() === month - 1 && postDate.getFullYear() === year;
    }).length;

    // Slide animation state
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    const prevMonth = () => {
        if (isAnimating) return;
        setSlideDirection('right');
        setIsAnimating(true);

        setTimeout(() => {
            if (month === 1) {
                onMonthChange(12, year - 1);
            } else {
                onMonthChange(month - 1, year);
            }
            setSlideDirection(null);
            setIsAnimating(false);
        }, 200);
    };

    const nextMonth = () => {
        if (isAnimating) return;
        setSlideDirection('left');
        setIsAnimating(true);

        setTimeout(() => {
            if (month === 12) {
                onMonthChange(1, year + 1);
            } else {
                onMonthChange(month + 1, year);
            }
            setSlideDirection(null);
            setIsAnimating(false);
        }, 200);
    };

    const getPostsForDate = (day: number) => {
        return posts.filter(post => {
            const postDate = new Date(post.scheduledDate);
            return postDate.getDate() === day &&
                postDate.getMonth() === month - 1 &&
                postDate.getFullYear() === year;
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SCHEDULED":
                return { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled" };
            case "GENERATING":
                return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Generating" };
            case "PUBLISHED":
                return { bg: "bg-green-100", text: "text-green-700", label: "Published" };
            case "FAILED":
                return { bg: "bg-red-100", text: "text-red-700", label: "Failed" };
            default:
                return { bg: "bg-gray-100", text: "text-gray-700", label: status };
        }
    };

    const renderDays = () => {
        const days = [];

        // Empty cells with diagonal stripe pattern for days before the month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(
                <div
                    key={`prev-${i}`}
                    className="min-h-48 border border-slate-200 rounded-lg"
                    style={{
                        background: `repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 8px,
                            rgba(226, 232, 240, 0.5) 8px,
                            rgba(226, 232, 240, 0.5) 9px
                        )`
                    }}
                />
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month - 1, day);
            const isToday = currentDate.getTime() === today.getTime();
            const isPast = currentDate < today;
            const postsForDay = getPostsForDate(day);

            days.push(
                <div
                    key={day}
                    onClick={() => !isPast && onDateClick(new Date(year, month - 1, day))}
                    className={cn(
                        "min-h-48 border border-slate-200 bg-slate-50/30 p-2 transition-colors",
                        isPast
                            ? "bg-slate-100/50 cursor-not-allowed"
                            : "hover:bg-slate-100/50 cursor-pointer",
                        isToday && "ring-2 ring-[#1DB954] ring-inset bg-white"
                    )}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                            "text-sm",
                            isToday && "text-[#1DB954] font-bold",
                            isPast && "text-slate-400"
                        )}>
                            {day}
                        </span>
                        <span className="text-xs text-slate-400">{DAYS[new Date(year, month - 1, day).getDay()]}</span>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-32">
                        {postsForDay.slice(0, 1).map(post => {
                            const statusBadge = getStatusBadge(post.status);
                            return (
                                <div
                                    key={post.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPostClick(post);
                                    }}
                                    className="group relative bg-white rounded-lg border border-slate-200 p-2.5 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    {/* Delete button */}
                                    {onPostDelete && post.status === "SCHEDULED" && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPostDelete(post.id);
                                            }}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                            title="Delete"
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    )}
                                    {/* Status badge */}
                                    <span className={cn(
                                        "inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase mb-1.5",
                                        statusBadge.bg,
                                        statusBadge.text,
                                        post.status === "GENERATING" && "animate-pulse"
                                    )}>
                                        {statusBadge.label}
                                    </span>
                                    {/* Title */}
                                    <h4 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 mb-1">
                                        {post.generatedTitle || post.keyword}
                                    </h4>
                                    {/* Keyword */}
                                    {post.generatedTitle && (
                                        <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                                            {post.keyword}
                                        </p>
                                    )}
                                    {/* View Article link for published posts */}
                                    {post.status === "PUBLISHED" && post.publishedPostUrl && (
                                        <a
                                            href={post.publishedPostUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 mt-2"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            View Article
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                        {postsForDay.length > 1 && (
                            <div className="text-xs text-slate-500 text-center py-1">
                                +{postsForDay.length - 1} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Empty cells with diagonal stripe pattern for remaining cells at month end
        const totalCells = days.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
            days.push(
                <div
                    key={`next-${i}`}
                    className="min-h-48 border border-slate-200 rounded-lg"
                    style={{
                        background: `repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 8px,
                            rgba(226, 232, 240, 0.5) 8px,
                            rgba(226, 232, 240, 0.5) 9px
                        )`
                    }}
                />
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <CalendarHeader
                month={month}
                year={year}
                totalPosts={totalPostsThisMonth}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onToday={() => {
                    const now = new Date();
                    onMonthChange(now.getMonth() + 1, now.getFullYear());
                }}
            />

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
                {DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div
                ref={gridRef}
                className={cn(
                    "grid grid-cols-7 transition-all duration-200 ease-out",
                    slideDirection === 'left' && "opacity-0 -translate-x-8",
                    slideDirection === 'right' && "opacity-0 translate-x-8",
                    !slideDirection && "opacity-100 translate-x-0"
                )}
            >
                {renderDays()}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 p-3 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-slate-600">Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-xs text-slate-600">Generating</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs text-slate-600">Published</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-xs text-slate-600">Failed</span>
                </div>
            </div>
        </div>
    );
}
