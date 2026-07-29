"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    max: number;
    renderTag?: (value: string) => React.ReactNode;
}

export function TagInput({ values, onChange, placeholder, max, renderTag }: TagInputProps) {
    const [draft, setDraft] = useState("");

    const addTag = () => {
        const trimmed = draft.trim();
        if (!trimmed || values.length >= max || values.includes(trimmed)) {
            setDraft("");
            return;
        }
        onChange([...values, trimmed]);
        setDraft("");
    };

    const removeTag = (value: string) => {
        onChange(values.filter((v) => v !== value));
    };

    return (
        <div className="space-y-3">
            <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                    }
                }}
                onBlur={addTag}
                placeholder={placeholder}
                disabled={values.length >= max}
                className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
            />
            {values.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {values.map((value) => (
                        <span
                            key={value}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border border-[#E7DFCF] bg-[#F5EFE4] pl-3 pr-2 py-1.5 text-sm text-[#1C1815]"
                            )}
                        >
                            {renderTag ? renderTag(value) : value}
                            <button
                                type="button"
                                onClick={() => removeTag(value)}
                                className="text-[#9B927F] hover:text-[#1C1815] transition-colors"
                                aria-label={`Remove ${value}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
