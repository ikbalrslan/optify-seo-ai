"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { completeArticlesStep } from "@/actions/onboarding";

const ARTICLE_STYLES = ["Informative", "Persuasive", "Technical", "Conversational", "Storytelling"];
const IMAGE_STYLES = ["None", "Illustration", "Photographic", "Minimalist", "3D Render"];

interface ArticlesStepProps {
    projectId: string;
    initialAutoPublish: boolean;
    initialArticleStyle: string;
    initialInstructions: string;
    initialInternalLinks: number;
    initialImageStyle: string;
    /** Whether a WordPress site is connected for this project (Blog step). Auto-publish can't
     * be enabled without one - see completeArticlesStep in src/actions/onboarding.ts. */
    hasConnectedSite: boolean;
    onSaved: (data: { articleStyle: string }) => void;
    onBack: () => void;
    onContinue: () => void;
    continueLabel?: string;
}

export function ArticlesStep({
    projectId,
    initialAutoPublish,
    initialArticleStyle,
    initialInstructions,
    initialInternalLinks,
    initialImageStyle,
    hasConnectedSite,
    onSaved,
    onBack,
    onContinue,
    continueLabel = "Continue",
}: ArticlesStepProps) {
    // Auto-publish requires a connected site - if one isn't connected (yet), force this off
    // rather than trusting stale initial state from before a site was disconnected.
    const [autoPublish, setAutoPublish] = useState(initialAutoPublish && hasConnectedSite);
    const [articleStyle, setArticleStyle] = useState(initialArticleStyle);
    const [instructions, setInstructions] = useState(initialInstructions);
    const [internalLinks, setInternalLinks] = useState(initialInternalLinks);
    const [imageStyle, setImageStyle] = useState(initialImageStyle);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContinue = async () => {
        setError("");
        setIsSubmitting(true);
        const result = await completeArticlesStep(projectId, {
            autoPublish,
            articleStyle,
            instructions,
            internalLinks,
            imageStyle,
        });
        setIsSubmitting(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        onSaved({ articleStyle });
        onContinue();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-[#1C1815] text-sm mb-4">Content & SEO</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-[#1C1815]">Auto-publish</label>
                            <Switch
                                checked={autoPublish}
                                onCheckedChange={setAutoPublish}
                                disabled={!hasConnectedSite}
                            />
                        </div>
                        <p className="text-xs text-[#9B927F]">
                            {hasConnectedSite
                                ? "Publish new articles automatically"
                                : "Connect a WordPress site in the Blog step to enable this"}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#1C1815]">Internal Links</label>
                        <Input
                            type="number"
                            min={0}
                            max={10}
                            value={internalLinks}
                            onChange={(e) => setInternalLinks(Number(e.target.value))}
                            className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
                        />
                        <p className="text-xs text-[#9B927F]">Links per article</p>
                    </div>
                </div>

                <div className="space-y-1.5 mb-4">
                    <label className="text-sm font-medium text-[#1C1815]">Article Style</label>
                    <Select value={articleStyle} onValueChange={setArticleStyle}>
                        <SelectTrigger className="focus:border-[#009E8A] focus:ring-[#009E8A]/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ARTICLE_STYLES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Global Article Instructions</label>
                    <Textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Enter global instructions for all articles (e.g., 'Always include practical examples')"
                        className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20 min-h-20"
                    />
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-[#1C1815] text-sm mb-4">Engagement</h3>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Image Style</label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                        <SelectTrigger className="focus:border-[#009E8A] focus:ring-[#009E8A]/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {IMAGE_STYLES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

            <OnboardingNav
                onBack={onBack}
                onContinue={handleContinue}
                continueLabel={continueLabel}
                isLoading={isSubmitting}
            />
        </div>
    );
}
