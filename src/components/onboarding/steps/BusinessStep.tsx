"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { completeBusinessStep } from "@/actions/onboarding";
import { COUNTRIES } from "@/config/countries";
import { LANGUAGES } from "@/config/languages";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import type { ExistingProject } from "@/components/onboarding/steps/types";

interface BusinessStepProps {
    existingProject: ExistingProject | null;
    /** When set, always update this exact project (per-site setup wizard) instead of the
     * "org's first project" lookup used by the initial signup onboarding flow. */
    projectId?: string;
    onProjectSaved: (project: ExistingProject) => void;
    onContinue: () => void;
}

export function BusinessStep({ existingProject, projectId, onProjectSaved, onContinue }: BusinessStepProps) {
    const [domain, setDomain] = useState(existingProject?.domain ?? "");
    const [name, setName] = useState(existingProject?.name ?? "");
    const [country, setCountry] = useState(existingProject?.country ?? "US");
    const [language, setLanguage] = useState(existingProject?.language ?? "English");
    const [description, setDescription] = useState(existingProject?.description ?? "");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canContinue = name.trim().length > 0 && domain.trim().length > 0 && !isSubmitting;

    const handleContinue = async () => {
        setError("");
        setIsSubmitting(true);
        const result = await completeBusinessStep({ domain, name, country, language, description }, projectId);
        setIsSubmitting(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        onProjectSaved({
            id: result.projectId,
            name: name.trim(),
            domain: domain.trim(),
            country,
            language,
            description: description.trim() || null,
        });
        onContinue();
    };

    return (
        <div className="space-y-5">
            <p className="text-sm text-[#6F675A] -mt-2 mb-2">
                Tell us about your business so we can tailor your SEO strategy. You can update this anytime.
            </p>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1C1815]">Website URL</label>
                <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1C1815]">Business name</label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Inc."
                    className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="focus:border-[#009E8A] focus:ring-[#009E8A]/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((l) => (
                                <SelectItem key={l} value={l}>
                                    {l}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Country</label>
                    <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="focus:border-[#009E8A] focus:ring-[#009E8A]/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {COUNTRIES.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1C1815]">Description</label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does your business do?"
                    className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20 min-h-24"
                />
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

            <OnboardingNav onContinue={handleContinue} isContinueDisabled={!canContinue} isLoading={isSubmitting} />
        </div>
    );
}
