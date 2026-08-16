"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/autopilot/Calendar";
import { SchedulePostModal } from "@/components/autopilot/SchedulePostModal";
import { getScheduledPosts, deleteScheduledPost, retryScheduledPost } from "@/actions/autopilot";
import { getProjects } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    Trash2,
    RefreshCw,
    ExternalLink,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ScheduledPost = {
    id: string;
    keyword: string;
    intent: string;
    tone: string;
    length: number;
    language: string;
    scheduledDate: Date;
    publishStatus: string;
    status: string;
    generatedTitle?: string | null;
    publishedPostUrl?: string | null;
    errorMessage?: string | null;
    executedAt?: Date | null;
    connectedSite: { name: string; url: string } | null;
    createdAt: Date;
};

export default function AutopilotPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");

    // Modal states
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const loadData = async (showFullLoader = false) => {
        if (!selectedProjectId) return;
        if (showFullLoader) setIsLoading(true);
        try {
            const postsData = await getScheduledPosts(selectedProjectId, month, year);
            setPosts(postsData as ScheduledPost[]);
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    };

    useEffect(() => {
        getProjects().then((data) => {
            setProjects(data);
            if (data.length > 0) {
                setSelectedProjectId((prev) => prev || data[0].id);
            } else {
                // No sites yet - loadData()'s effect below never fires a real request (it bails
                // out while selectedProjectId is empty), so nothing else will ever clear the
                // loading state. Clear it here instead of leaving the spinner up forever.
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        }).catch((e) => {
            console.error("Failed to load projects", e);
            setIsLoading(false);
            setIsInitialLoad(false);
        });
    }, []);

    useEffect(() => {
        loadData(isInitialLoad);
    }, [month, year, selectedProjectId]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsScheduleModalOpen(true);
    };

    const handlePostClick = (post: { id: string }) => {
        const fullPost = posts.find(p => p.id === post.id);
        if (fullPost) {
            setSelectedPost(fullPost);
            setIsPostDetailOpen(true);
        }
    };

    const handleMonthChange = (newMonth: number, newYear: number) => {
        setMonth(newMonth);
        setYear(newYear);
    };

    const handleDelete = async () => {
        if (!selectedPost) return;
        setIsDeleting(true);
        try {
            await deleteScheduledPost(selectedPost.id);
            setIsPostDetailOpen(false);
            setSelectedPost(null);
            loadData();
        } catch (e) {
            console.error("Failed to delete", e);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleQuickDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this scheduled post?")) return;
        try {
            await deleteScheduledPost(postId);
            loadData();
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    const handleRetry = async () => {
        if (!selectedPost) return;
        setIsRetrying(true);
        try {
            await retryScheduledPost(selectedPost.id);
            setIsPostDetailOpen(false);
            setSelectedPost(null);
            loadData();
        } catch (e) {
            console.error("Failed to retry", e);
        } finally {
            setIsRetrying(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            SCHEDULED: "bg-blue-100 text-blue-700",
            GENERATING: "bg-yellow-100 text-yellow-700",
            PUBLISHED: "bg-green-100 text-green-700",
            FAILED: "bg-red-100 text-red-700",
        };
        return (
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[status] || "bg-gray-100")}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="h-8 w-8 text-[#1DB954]" />
                        Autopilot
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Schedule blog posts to be generated and published automatically.
                    </p>
                </div>
                {projects.length > 1 && (
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select site..." />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Calendar */}
            <div className="relative">
                {isInitialLoad ? (
                    <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-slate-200">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1DB954]" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-slate-200 text-center px-4">
                        <CalendarDays className="h-10 w-10 text-slate-300 mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900">No websites yet</h3>
                        <p className="text-slate-500 max-w-sm mt-1">
                            Add a website to your organization first, then come back here to schedule posts for it.
                        </p>
                    </div>
                ) : (
                    <>
                        <Calendar
                            posts={posts}
                            onDateClick={handleDateClick}
                            onPostClick={handlePostClick}
                            onPostDelete={handleQuickDelete}
                            month={month}
                            year={year}
                            onMonthChange={handleMonthChange}
                        />
                    </>
                )}
            </div>

            {/* Schedule Modal */}
            <SchedulePostModal
                isOpen={isScheduleModalOpen}
                onClose={() => {
                    setIsScheduleModalOpen(false);
                    setSelectedDate(null);
                }}
                selectedDate={selectedDate}
                onSuccess={loadData}
                projectId={selectedProjectId}
            />

            {/* Post Detail Modal */}
            <Dialog open={isPostDetailOpen} onOpenChange={setIsPostDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Scheduled Post</DialogTitle>
                        <DialogDescription>
                            {selectedPost && getStatusBadge(selectedPost.status)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPost && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Keyword</p>
                                    <p className="font-medium">{selectedPost.keyword}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Site</p>
                                    <p className="font-medium">{selectedPost.connectedSite?.name ?? "Internal Blog (optifyseo.ai)"}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Tone</p>
                                    <p className="font-medium">{selectedPost.tone}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Scheduled</p>
                                    <p className="font-medium">
                                        {new Date(selectedPost.scheduledDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Publish As</p>
                                    <p className="font-medium capitalize">{selectedPost.publishStatus}</p>
                                </div>
                            </div>

                            {selectedPost.generatedTitle && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-xs text-green-600 mb-1">Generated Title</p>
                                    <p className="text-sm font-medium text-green-900">
                                        {selectedPost.generatedTitle}
                                    </p>
                                </div>
                            )}

                            {selectedPost.errorMessage && (
                                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                    <p className="text-xs text-red-600 mb-1">Error</p>
                                    <p className="text-sm text-red-900">
                                        {selectedPost.errorMessage}
                                    </p>
                                </div>
                            )}

                            <DialogFooter className="flex gap-2">
                                {selectedPost.publishedPostUrl && (
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(selectedPost.publishedPostUrl!, "_blank")}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Post
                                    </Button>
                                )}

                                {selectedPost.status === "FAILED" && (
                                    <Button
                                        variant="outline"
                                        onClick={handleRetry}
                                        disabled={isRetrying}
                                    >
                                        {isRetrying ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                        )}
                                        Retry
                                    </Button>
                                )}

                                {selectedPost.status === "SCHEDULED" && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        Delete
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
