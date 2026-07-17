"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { getConnectedSites } from "@/actions/wordpress";
import { createScheduledPost } from "@/actions/autopilot";
import { getProjects } from "@/actions/projects";
import { getKeywordsForProject } from "@/actions/keywords";

const BLOG_TARGET = "BLOG";

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

    // Publish target: BLOG_TARGET or a connected site id
    const [publishTarget, setPublishTarget] = useState<string>(BLOG_TARGET);

    // Project/keyword picker (optional - fills the free-text keyword field below)
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [projectKeywords, setProjectKeywords] = useState<any[]>([]);
    const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

    const [formData, setFormData] = useState({
        keywordId: "",
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
            loadProjects();
            setError("");
            // Pre-fill keyword if provided
            if (defaultKeyword) {
                setFormData(prev => ({ ...prev, keyword: defaultKeyword }));
            }
        }
    }, [isOpen, defaultKeyword]);

    useEffect(() => {
        if (selectedProjectId) {
            loadProjectKeywords(selectedProjectId);
        } else {
            setProjectKeywords([]);
        }
    }, [selectedProjectId]);

    const loadSites = async () => {
        setIsLoadingSites(true);
        try {
            const data = await getConnectedSites();
            setSites(data);
        } catch (e) {
            console.error("Failed to load sites", e);
        } finally {
            setIsLoadingSites(false);
        }
    };

    const loadProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(data);
            if (data.length > 0 && !selectedProjectId) {
                setSelectedProjectId(data[0].id);
            }
        } catch (e) {
            console.error("Failed to load projects", e);
        }
    };

    const loadProjectKeywords = async (projectId: string) => {
        setIsLoadingKeywords(true);
        try {
            const data = await getKeywordsForProject(projectId);
            setProjectKeywords(data);
        } catch (e) {
            console.error("Failed to load keywords", e);
        } finally {
            setIsLoadingKeywords(false);
        }
    };

    const handlePickKeyword = (keywordId: string) => {
        const kw = projectKeywords.find(k => k.id === keywordId);
        if (kw) {
            setFormData(prev => ({ ...prev, keywordId: kw.id, keyword: kw.keyword }));
        }
    };

    const handleSubmit = async () => {
        if (!selectedDate || !formData.keyword.trim() || !formData.tone.trim()) {
            setError("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await createScheduledPost({
                ...formData,
                connectedSiteId: publishTarget === BLOG_TARGET ? undefined : publishTarget,
                keywordId: formData.keywordId || undefined,
                scheduledDate: selectedDate,
            });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                keywordId: "",
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

                    {/* Publish Target */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Publish To *</label>
                        {isLoadingSites ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading sites...
                            </div>
                        ) : (
                            <Select value={publishTarget} onValueChange={setPublishTarget}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select where to publish..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={BLOG_TARGET}>optifyseo.ai Blog</SelectItem>
                                    {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id}>
                                            {site.name || site.url}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Optional: pick from tracked site's keywords */}
                    {projects.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Site (for keyword picker)</label>
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Keywords</label>
                                <Select value={formData.keywordId} onValueChange={handlePickKeyword} disabled={isLoadingKeywords || projectKeywords.length === 0}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingKeywords ? "Loading..." : projectKeywords.length === 0 ? "No keywords yet" : "Pick a keyword..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectKeywords.map(kw => (
                                            <SelectItem key={kw.id} value={kw.id}>{kw.keyword}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Keyword */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Keyword *</label>
                        <Input
                            placeholder="e.g. best email marketing tools"
                            value={formData.keyword}
                            onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value, keywordId: "" }))}
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
                        disabled={isSubmitting}
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
