"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { getWordPressSites } from "@/actions/wordpress";
import { createScheduledPost } from "@/actions/autopilot";

interface SchedulePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    defaultKeyword?: string;
    onSuccess: () => void;
}

export function SchedulePostModal({ isOpen, onClose, selectedDate, defaultKeyword, onSuccess }: SchedulePostModalProps) {
    const [sites, setSites] = useState<any[]>([]);
    const [isLoadingSites, setIsLoadingSites] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        wordPressSiteId: "",
        keyword: "",
        intent: "informational" as "informational" | "commercial" | "navigational",
        tone: "professional",
        length: 1500,
        language: "en",
        publishStatus: "draft" as "draft" | "publish",
    });

    useEffect(() => {
        if (isOpen) {
            loadSites();
            setError("");
            // Pre-fill keyword if provided
            if (defaultKeyword) {
                setFormData(prev => ({ ...prev, keyword: defaultKeyword }));
            }
        }
    }, [isOpen, defaultKeyword]);

    const loadSites = async () => {
        setIsLoadingSites(true);
        try {
            const data = await getWordPressSites();
            setSites(data);
            if (data.length > 0 && !formData.wordPressSiteId) {
                setFormData(prev => ({ ...prev, wordPressSiteId: data[0].id }));
            }
        } catch (e) {
            console.error("Failed to load sites", e);
        } finally {
            setIsLoadingSites(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDate || !formData.wordPressSiteId || !formData.keyword.trim() || !formData.tone.trim()) {
            setError("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await createScheduledPost({
                ...formData,
                scheduledDate: selectedDate,
            });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                wordPressSiteId: sites[0]?.id || "",
                keyword: "",
                intent: "informational",
                tone: "professional",
                length: 1500,
                language: "en",
                publishStatus: "draft",
            });
        } catch (e: any) {
            setError(e.message || "Failed to schedule post");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-[#1DB954]" />
                        Schedule Blog Post
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {/* Date Display */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled for:</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedDate)}</p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    {/* WordPress Site */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">WordPress Site *</label>
                        {isLoadingSites ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading sites...
                            </div>
                        ) : sites.length === 0 ? (
                            <p className="text-sm text-red-500">No WordPress sites connected. Please add one in Settings.</p>
                        ) : (
                            <Select
                                value={formData.wordPressSiteId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, wordPressSiteId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select site..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id}>
                                            {site.name || site.url}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Keyword */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Keyword *</label>
                        <Input
                            placeholder="e.g. best email marketing tools"
                            value={formData.keyword}
                            onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                        />
                    </div>

                    {/* Intent & Tone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search Intent</label>
                            <Select
                                value={formData.intent}
                                onValueChange={(val: any) => setFormData(prev => ({ ...prev, intent: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="informational">Informational</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                    <SelectItem value="navigational">Navigational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tone & Length */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tone</label>
                            <Input
                                placeholder="e.g. professional, casual"
                                value={formData.tone}
                                onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Word Count</label>
                            <Input
                                type="number"
                                value={formData.length}
                                onChange={(e) => setFormData(prev => ({ ...prev, length: parseInt(e.target.value) || 1500 }))}
                            />
                        </div>
                    </div>

                    {/* Language & Publish Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Language</label>
                            <Select
                                value={formData.language}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, language: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="tr">Turkish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Publish Status</label>
                            <Select
                                value={formData.publishStatus}
                                onValueChange={(val: any) => setFormData(prev => ({ ...prev, publishStatus: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="publish">Publish Immediately</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || sites.length === 0}
                        className="w-full bg-[#1DB954] hover:bg-[#1aa34a] text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Scheduling...
                            </>
                        ) : (
                            "Schedule Post"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
