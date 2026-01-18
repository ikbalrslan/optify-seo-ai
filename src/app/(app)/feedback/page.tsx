"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, ThumbsUp, MessageSquare, Bug, Lightbulb, CheckCircle2 } from "lucide-react";
import { submitFeedback, getFeatureRequests, toggleUpvote } from "@/actions/feedback";
import { cn } from "@/lib/utils";
import { SuccessPopup } from "@/components/shared/SuccessPopup";

export default function FeedbackPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("submit");

    // Submit Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"FEATURE" | "BUG">("FEATURE");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Feature Board State
    const [features, setFeatures] = useState<any[]>([]);
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [upvoteLoading, setUpvoteLoading] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === "features" || activeTab === "bugs") {
            loadFeatures();
        }
    }, [activeTab]);

    const loadFeatures = async () => {
        setIsLoadingFeatures(true);
        try {
            const data = await getFeatureRequests();
            setFeatures(data);
        } catch (error) {
            console.error("Failed to load features", error);
        } finally {
            setIsLoadingFeatures(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;
        setIsSubmitting(true);
        try {
            await submitFeedback({ type, title, description });
            setSuccessMessage(type === "BUG" ? "Bug reported successfully. Thank you!" : "Feature request submitted!");
            setSuccessOpen(true);
            setTitle("");
            setDescription("");
            // If feature, switch to board to see it? Maybe not immediately as it might need reload. 
            // Better to stay and let them submit more or manually switch.
            if (type === "FEATURE") {
                // optionally refresh board if we were there, but we are on submit tab
            }
        } catch (error) {
            console.error("Failed to submit", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpvote = async (id: string, currentHasUpvoted: boolean) => {
        // Optimistic update
        setFeatures(prev => prev.map(f => {
            if (f.id === id) {
                return {
                    ...f,
                    upvotes: currentHasUpvoted ? f.upvotes - 1 : f.upvotes + 1,
                    hasUpvoted: !currentHasUpvoted
                };
            }
            return f;
        }));

        setUpvoteLoading(id);
        try {
            await toggleUpvote(id);
        } catch (error) {
            console.error("Upvote failed", error);
            // Revert
            setFeatures(prev => prev.map(f => {
                if (f.id === id) {
                    return {
                        ...f,
                        upvotes: currentHasUpvoted ? f.upvotes + 1 : f.upvotes - 1, // original
                        hasUpvoted: currentHasUpvoted // original
                    };
                }
                return f;
            }));
        } finally {
            setUpvoteLoading(null);
        }
    };

    return (
        <div className="col-span-4 space-y-8 p-8 max-w-5xl mx-auto">
            <SuccessPopup
                isOpen={successOpen}
                onClose={() => setSuccessOpen(false)}
                message={successMessage}
            />

            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground">Feedback & Roadmap</h1>
                <p className="text-muted-foreground">Help us improve Optify by reporting bugs or voting on new features.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[500px] mb-8">
                    <TabsTrigger value="submit" className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Submit
                    </TabsTrigger>
                    <TabsTrigger value="features" className="gap-2">
                        <Lightbulb className="h-4 w-4" /> Features
                    </TabsTrigger>
                    <TabsTrigger value="bugs" className="gap-2">
                        <Bug className="h-4 w-4" /> Bugs
                    </TabsTrigger>
                </TabsList>

                {/* Submit Tab */}
                <TabsContent value="submit" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Submit a Request</CardTitle>
                            <CardDescription>
                                Found a bug? Have a great idea? Let us know!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Type</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setType("FEATURE")}
                                        className={cn(
                                            "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-medium",
                                            type === "FEATURE"
                                                ? "border-[#1DB954] bg-[#1DB954]/5 text-[#1DB954]"
                                                : "border-border hover:border-sidebar-border text-muted-foreground"
                                        )}
                                    >
                                        <Lightbulb className="h-5 w-5" /> Feature Request
                                    </button>
                                    <button
                                        onClick={() => setType("BUG")}
                                        className={cn(
                                            "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-medium",
                                            type === "BUG"
                                                ? "border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                                                : "border-border hover:border-sidebar-border text-muted-foreground"
                                        )}
                                    >
                                        <Bug className="h-5 w-5" /> Bug Report
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Title</label>
                                <Input
                                    placeholder={type === "FEATURE" ? "e.g. Add dark mode support" : "e.g. Error when saving API key"}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="h-12 text-lg bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <Textarea
                                    placeholder="Tell us more details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="min-h-[150px] text-base resize-none bg-background"
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !title.trim() || !description.trim()}
                                className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" /> Submit Feedback
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">Feature Requests</h2>
                        <div className="text-sm text-muted-foreground">
                            Vote on features you want to see
                        </div>
                    </div>

                    {isLoadingFeatures ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading features...</p>
                        </div>
                    ) : features.filter(f => f.type === "FEATURE").length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground">No features yet</h3>
                            <Button variant="link" onClick={() => setActiveTab("submit")} className="mt-2 text-[#1DB954]">
                                Submit one
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {features.filter(f => f.type === "FEATURE").map((feature) => (
                                <Card key={feature.id} className="group hover:shadow-md transition-all border-border bg-card">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => handleUpvote(feature.id, feature.hasUpvoted)}
                                                disabled={upvoteLoading === feature.id}
                                                className={cn(
                                                    "flex flex-col items-center justify-center w-12 h-14 rounded-xl border-2 transition-all active:scale-95",
                                                    feature.hasUpvoted
                                                        ? "border-[#1DB954] bg-[#1DB954] text-white"
                                                        : "border-border bg-card text-muted-foreground hover:border-[#1DB954] hover:text-[#1DB954]"
                                                )}
                                            >
                                                <ThumbsUp className={cn("h-4 w-4 mb-1", feature.hasUpvoted && "fill-current")} />
                                                <span className="font-bold text-xs">{feature.upvotes}</span>
                                            </button>
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-base font-bold text-foreground group-hover:text-[#1DB954] transition-colors">{feature.title}</h3>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                                    feature.status === "OPEN" ? "bg-muted text-muted-foreground dark:text-foreground" :
                                                        feature.status === "IN_PROGRESS" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                                                            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                )}>
                                                    {feature.status.replace("_", " ")}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{feature.description}</p>
                                            <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground/70">
                                                <span>Requested by {feature.user.name || "Anonymous"}</span>
                                                <span>•</span>
                                                <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Bugs Tab */}
                <TabsContent value="bugs" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground">My Bug Reports</h2>
                        <div className="text-sm text-muted-foreground">
                            Only visible to you
                        </div>
                    </div>

                    {isLoadingFeatures ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading bugs...</p>
                        </div>
                    ) : features.filter(f => f.type === "BUG").length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                            <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground">No bugs reported</h3>
                            <p className="text-muted-foreground">Found an issue?</p>
                            <Button variant="link" onClick={() => setActiveTab("submit")} className="mt-2 text-red-500">
                                Report a Bug
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {features.filter(f => f.type === "BUG").map((feature) => (
                                <Card key={feature.id} className="group hover:shadow-md transition-all border-red-100 dark:border-red-900/40 bg-red-50/10 dark:bg-red-900/10">
                                    <CardContent className="p-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <h3 className="text-base font-bold text-foreground group-hover:text-red-600 transition-colors">{feature.title}</h3>
                                                    <span className="w-fit px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                                        Private Bug
                                                    </span>
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                                    feature.status === "OPEN" ? "bg-muted text-muted-foreground dark:text-foreground" :
                                                        feature.status === "IN_PROGRESS" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                                                            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                )}>
                                                    {feature.status.replace("_", " ")}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{feature.description}</p>
                                            <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground/70">
                                                <span>Reported on {new Date(feature.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
