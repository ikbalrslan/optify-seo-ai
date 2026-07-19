"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Wand2, Copy, Check, Globe } from "lucide-react";
import { generateBlogPost, type BlogInput } from "@/actions/generate-blog";
import { getConnectedSites, publishToWordPress } from "@/actions/wordpress";
import { cn } from "@/lib/utils";

export default function BlogGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");


    const [selectedTitle, setSelectedTitle] = useState("");
    const [selectedDescription, setSelectedDescription] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    // Publishing State
    const [publishOpen, setPublishOpen] = useState(false);
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState("");
    const [publishStatus, setPublishStatus] = useState("draft");
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishResult, setPublishResult] = useState<string | null>(null);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<BlogInput>({
        keyword: "okul",
        intent: "informational",
        length: 350,
        tone: "professional",
        competitors: "",
    });

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.keyword.trim()) errors.keyword = "Primary keyword is required";
        if (!formData.tone.trim()) errors.tone = "Tone & Voice is required";
        if (formData.length <= 300) errors.length = "Word count must be greater than 300";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleGenerate = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError("");
        setGeneratedContent(null);
        try {
            const result = await generateBlogPost(formData);
            if (result.success) {
                setGeneratedContent(result.data);
                if (result.data.titles?.length > 0) setSelectedTitle(result.data.titles[0]);
                if (result.data.meta_descriptions?.length > 0) setSelectedDescription(result.data.meta_descriptions[0]);
                if (result.data.meta_keywords?.length > 0) setSelectedKeywords(result.data.meta_keywords);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSites = async () => {
        try {
            const data = await getConnectedSites();
            setSites(data);
            if (data.length > 0) setSelectedSiteId(data[0].id);
        } catch (e) {
            console.error("Failed to load sites", e);
        }
    };

    const handlePublish = async () => {
        if (!selectedSiteId) return;
        setIsPublishing(true);
        setPublishResult(null);
        try {
            const contentHTML = generatedContent.sections.map((s: any) => `<h2>${s.h2}</h2>${s.content}`).join("");

            const result = await publishToWordPress(selectedSiteId, {
                title: selectedTitle,
                content: contentHTML,
                meta_description: selectedDescription,
                focus_keyword: selectedKeywords[0] || "",
            });

            if (result.success) {
                setPublishResult(result.link || "Success");
                setTimeout(() => {
                    setPublishOpen(false);
                    setPublishResult(null);
                }, 3000);
            }
        } catch (e: any) {
            setError(e.message || "Publishing failed");
        } finally {
            setIsPublishing(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedContent) return;

        let text = `# SEO OPTIONS\n\n`;
        text += `## Selected Title\n${selectedTitle}\n\n`;
        text += `## Selected Meta Description\n${selectedDescription}\n\n`;
        text += `## Selected Meta Keywords\n${selectedKeywords.join(', ')}\n\n`;

        text += `# BLOG POST: ${selectedTitle}\n\n`;
        text += `> ${selectedDescription}\n\n`;

        generatedContent.sections.forEach((section: any) => {
            text += `## ${section.h2}\n\n${section.content}\n\n`;
        });

        if (generatedContent.faq) {
            text += `## FAQ\n\n`;
            generatedContent.faq.forEach((faq: any) => {
                text += `### ${faq.question}\n${faq.answer}\n\n`;
            });
        }

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isFormValid =
        formData.keyword.trim().length > 0 &&
        formData.tone.trim().length > 0 &&
        formData.length > 300;

    return (
        <div className="col-span-4 border-primary/10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Blog Post Generator</h1>
                <p className="text-slate-500">Generate SEO-optimized blog posts in seconds.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <Card className="h-fit">
                    <CardContent className="p-6 space-y-6">


                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">
                                Primary Keyword <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g. email marketing tools"
                                value={formData.keyword}
                                onChange={(e) => {
                                    setFormData({ ...formData, keyword: e.target.value });
                                    if (formErrors.keyword) setFormErrors({ ...formErrors, keyword: "" });
                                }}
                                className={cn(formErrors.keyword && "border-red-500")}
                            />
                            {formErrors.keyword && <p className="text-xs text-red-500 font-medium">{formErrors.keyword}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">
                                    Search Intent
                                </label>
                                <Select
                                    value={formData.intent}
                                    onValueChange={(val: any) => setFormData({ ...formData, intent: val })}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">
                                    Tone & Voice <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g. professional but friendly"
                                    value={formData.tone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, tone: e.target.value });
                                        if (formErrors.tone) setFormErrors({ ...formErrors, tone: "" });
                                    }}
                                    className={cn(formErrors.tone && "border-red-500")}
                                />
                                {formErrors.tone && <p className="text-xs text-red-500 font-medium">{formErrors.tone}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">
                                    Approx Word Count ({'>'}300) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="350"
                                    value={formData.length}
                                    onChange={(e) => {
                                        setFormData({ ...formData, length: parseInt(e.target.value) || 0 });
                                        if (formErrors.length) setFormErrors({ ...formErrors, length: "" });
                                    }}
                                    className={cn(formErrors.length && "border-red-500")}
                                />
                                {formErrors.length && <p className="text-xs text-red-500 font-medium">{formErrors.length}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">
                                Competitor URLs (Optional)
                            </label>
                            <Textarea
                                placeholder="Paste competitor links or names here..."
                                value={formData.competitors}
                                onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                                className="h-24 resize-none"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            className={cn(
                                "w-full h-12 text-lg font-bold transition-all duration-300",
                                "bg-[linear-gradient(to_right,#1DB954,#1aa34a,#1ed760,#1DB954)]",
                                "bg-[length:200%_auto] animate-shimmer",
                                "text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/50",
                                "hover:scale-[1.01] active:scale-[0.99] border-0"
                            )}
                            onClick={handleGenerate}
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading ? (
                                <>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
                                    <span className="relative z-10">Generating Magic...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-5 w-5 animate-pulse" />
                                    Generate Blog Post
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Output Display */}
                <div className="space-y-6">
                    {!generatedContent ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                            <Wand2 className="h-12 w-12 mb-4 opacity-50" />
                            <p>Generated content will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="h-[700px] flex flex-col">
                                <CardContent className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
                                    <div className="flex items-center justify-end gap-2 border-b border-slate-100 pb-4 shrink-0">
                                        <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>

                                        <Dialog open={publishOpen} onOpenChange={(open) => {
                                            setPublishOpen(open);
                                            if (open) loadSites();
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="default" className="bg-[#21759b] hover:bg-[#1a5c7a] text-white gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    Publish
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Publish to WordPress</DialogTitle>
                                                </DialogHeader>

                                                {!publishResult ? (
                                                    <div className="space-y-4 pt-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Select Site</label>
                                                            {sites.length === 0 ? (
                                                                <p className="text-sm text-red-500">No sites connected. Go to Settings to connect a site.</p>
                                                            ) : (
                                                                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select site..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {sites.map(site => (
                                                                            <SelectItem key={site.id} value={site.id}>{site.name || site.url}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Post Status</label>
                                                            <Select value={publishStatus} onValueChange={setPublishStatus}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="draft">Draft</SelectItem>
                                                                    <SelectItem value="publish">Publish Immediately</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <Button
                                                            className="w-full bg-[#21759b] hover:bg-[#1a5c7a]"
                                                            onClick={handlePublish}
                                                            disabled={isPublishing || sites.length === 0}
                                                        >
                                                            {isPublishing ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                                                                </>
                                                            ) : "Publish Now"}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                                                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Check className="h-6 w-6 text-green-600" />
                                                        </div>
                                                        <p className="text-lg font-medium text-center">Published Successfully!</p>
                                                        <a href={publishResult} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                            View Post
                                                        </a>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2">
                                        {/* SEO Options */}
                                        <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                                            <div>
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">SEO Title Options (Select One)</h3>
                                                <ul className="space-y-2">
                                                    {generatedContent.titles.map((title: string, i: number) => (
                                                        <li
                                                            key={i}
                                                            onClick={() => setSelectedTitle(title)}
                                                            className={cn(
                                                                "text-lg font-bold p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                                selectedTitle === title
                                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                                                                    : "border-transparent bg-slate-50 text-slate-900 hover:bg-slate-100"
                                                            )}
                                                        >
                                                            {title}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Meta Description Options (Select One)</h3>
                                                <ul className="space-y-2">
                                                    {generatedContent.meta_descriptions.map((desc: string, i: number) => (
                                                        <li
                                                            key={i}
                                                            onClick={() => setSelectedDescription(desc)}
                                                            className={cn(
                                                                "p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                                selectedDescription === desc
                                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                                                                    : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                            )}
                                                        >
                                                            {desc}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Meta Keywords (Click to Toggle)</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {generatedContent.meta_keywords.map((keyword: string, i: number) => {
                                                        const isSelected = selectedKeywords.includes(keyword);
                                                        return (
                                                            <span
                                                                key={i}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setSelectedKeywords(prev => prev.filter(k => k !== keyword));
                                                                    } else {
                                                                        setSelectedKeywords(prev => [...prev, keyword]);
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "px-3 py-1.5 text-sm rounded-full border cursor-pointer transition-colors select-none",
                                                                    isSelected
                                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                                                )}
                                                            >
                                                                {keyword}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Blog Content */}
                                        <div className="prose prose-slate max-w-none animate-in fade-in zoom-in-95 duration-300">
                                            {generatedContent.sections.map((section: any, idx: number) => (
                                                <div key={idx} className="mb-6">
                                                    <h3 className="text-lg font-semibold mb-2">{section.h2}</h3>
                                                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                                </div>
                                            ))}

                                            {generatedContent.faq && (
                                                <div className="mt-8 pt-8 border-t border-slate-100">
                                                    <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
                                                    <dl className="space-y-4">
                                                        {generatedContent.faq.map((item: any, idx: number) => (
                                                            <div key={idx}>
                                                                <dt className="font-semibold text-slate-900">{item.question}</dt>
                                                                <dd className="text-slate-600 mt-1">{item.answer}</dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                </div>
                                            )}

                                            {generatedContent.internal_links && (
                                                <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-500 mb-3">Internal Linking Suggestions</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {generatedContent.internal_links.map((link: string, idx: number) => (
                                                            <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded text-sm text-blue-600 font-medium">
                                                                {link}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
