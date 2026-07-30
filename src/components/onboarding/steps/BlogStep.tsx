"use client";

import { useState } from "react";
import { Download, Globe, CheckCircle2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { addWordPressSite, deleteConnectedSite } from "@/actions/wordpress";

interface ConnectedSiteSummary {
    id: string;
    name: string;
    url: string;
    username?: string;
}

interface BlogStepProps {
    projectId: string;
    initialConnectedSites: ConnectedSiteSummary[];
    onSaved: (data: { connectedSiteName: string | null }) => void;
    onBack: () => void;
    onContinue: () => void;
}

export function BlogStep({ projectId, initialConnectedSites, onSaved, onBack, onContinue }: BlogStepProps) {
    const [sites, setSites] = useState(initialConnectedSites);
    const [url, setUrl] = useState("");
    const [username, setUsername] = useState("");
    const [appPassword, setAppPassword] = useState("");
    const [error, setError] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setError("");
        setIsConnecting(true);
        try {
            await addWordPressSite(projectId, url, username, appPassword);
            const { getConnectedSites } = await import("@/actions/wordpress");
            const updated = await getConnectedSites(projectId);
            setSites(updated);
            setUrl("");
            setUsername("");
            setAppPassword("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to connect site");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDelete = async (id: string) => {
        await deleteConnectedSite(id);
        setSites((prev) => prev.filter((s) => s.id !== id));
    };

    const handleContinue = () => {
        onSaved({ connectedSiteName: sites[0]?.name ?? null });
        onContinue();
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#6F675A]">
                    Connect WordPress to enable auto-publish. You can skip this for now, but auto-publish won&apos;t be available until a site is connected.
                </p>
                <a
                    href="/plugins/optify-connector.zip"
                    download
                    className="shrink-0 text-sm font-medium text-[#009E8A] hover:underline flex items-center gap-1.5"
                >
                    <Download className="h-4 w-4" /> Download Plugin
                </a>
            </div>

            {sites.length > 0 && (
                <div className="space-y-2">
                    {sites.map((site) => (
                        <div
                            key={site.id}
                            className="flex items-center justify-between p-3 bg-[#F5EFE4] rounded-lg border border-[#E7DFCF]"
                        >
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-[#6F675A]" />
                                <div>
                                    <div className="font-medium text-sm text-[#1C1815]">{site.name}</div>
                                    <div className="text-xs text-[#9B927F]">
                                        {site.url} · {site.username}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#009E8A] bg-[#009E8A]/10 px-2 py-1 rounded-full">
                                    <CheckCircle2 className="h-3 w-3" /> Connected
                                </div>
                                <button
                                    onClick={() => handleDelete(site.id)}
                                    className="p-2 hover:bg-white rounded-full text-[#9B927F] hover:text-red-500 transition-colors"
                                    aria-label="Disconnect"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="border border-[#E7DFCF] rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-[#1C1815] text-sm">Connect a WordPress site</h3>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Site URL</label>
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://mysite.com"
                        className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Username</label>
                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1C1815]">Application Password</label>
                    <Input
                        type="password"
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        placeholder="abcd 1234 efgh 5678"
                        className="bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20"
                    />
                    <p className="text-xs text-[#9B927F]">
                        Go to Users → Profile → Application Passwords in your WordPress admin to generate this.
                    </p>
                </div>
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}
                <button
                    onClick={handleConnect}
                    disabled={isConnecting || !url.trim() || !username.trim() || !appPassword.trim()}
                    className="w-full h-9 text-sm font-medium bg-[#1C1815] hover:bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isConnecting ? "Connecting..." : "Connect Site"}
                </button>
            </div>

            <OnboardingNav onBack={onBack} onContinue={handleContinue} />
        </div>
    );
}
