"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CreditCard, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { getOrgBillingSummary, getPlan } from "@/actions/billing";
import { createProject } from "@/actions/projects";
import {
    createOrgCheckoutSession,
    addSiteToSubscription,
    removeSiteFromSubscription,
    createBillingPortalSession,
} from "@/actions/stripe";

type Site = {
    id: string;
    name: string;
    domain: string;
    plan: { id: string; name: string; price: number; status: string } | null;
};

type Summary = {
    hasPaymentMethod: boolean;
    callerRole: string;
    sites: Site[];
    activeSiteCount: number;
    discountPercent: number;
    grossTotal: number;
    netTotal: number;
};

type Plan = { id: string; name: string; price: number };

export default function BillingPageClient({ organizationId }: { organizationId: string }) {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingSiteId, setPendingSiteId] = useState<string | null>(null);
    const [isManagingBilling, setIsManagingBilling] = useState(false);

    const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
    const [newSiteName, setNewSiteName] = useState("");
    const [newSiteDomain, setNewSiteDomain] = useState("");
    const [addSiteError, setAddSiteError] = useState("");
    const [isAddingSite, setIsAddingSite] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryData, planData] = await Promise.all([
                getOrgBillingSummary(organizationId),
                getPlan(),
            ]);
            setSummary(summaryData);
            setPlan(planData);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSubscribe = async (siteId: string) => {
        if (!summary) return;

        setPendingSiteId(siteId);
        try {
            const result = summary.hasPaymentMethod
                ? await addSiteToSubscription(siteId)
                : await createOrgCheckoutSession(siteId);

            // createOrgCheckoutSession redirects on success and never returns - if we get a
            // result back at all, it's the {success:false, error} failure shape.
            if (result && !result.success) {
                alert(result.error);
                return;
            }
            await load();
        } finally {
            setPendingSiteId(null);
        }
    };

    const handleRemove = async (siteId: string) => {
        setPendingSiteId(siteId);
        try {
            const result = await removeSiteFromSubscription(siteId);
            if (!result.success) {
                alert(result.error);
                return;
            }
            await load();
        } finally {
            setPendingSiteId(null);
        }
    };

    const handleAddSite = async () => {
        setAddSiteError("");
        setIsAddingSite(true);
        try {
            await createProject(newSiteName, newSiteDomain);
            setNewSiteName("");
            setNewSiteDomain("");
            setIsAddSiteOpen(false);
            await load();
        } catch (e: any) {
            setAddSiteError(e.message || "Failed to add website");
        } finally {
            setIsAddingSite(false);
        }
    };

    const handleManageBilling = async () => {
        setIsManagingBilling(true);
        try {
            const result = await createBillingPortalSession(organizationId);
            if (result && !result.success) {
                alert(result.error);
            }
        } finally {
            setIsManagingBilling(false);
        }
    };

    if (isLoading || !summary) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Billing</h2>
                    <p className="text-sm text-slate-500">
                        Each site is billed separately{plan && ` at $${plan.price}/mo`}
                        {summary.discountPercent > 0 && `, with an automatic ${summary.discountPercent}% volume discount applied`}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(summary.callerRole === "ADMIN" || summary.callerRole === "OWNER") && (
                        <Button variant="outline" onClick={() => setIsAddSiteOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Website
                        </Button>
                    )}
                    {summary.hasPaymentMethod && summary.callerRole === "OWNER" && (
                        <Button variant="outline" onClick={handleManageBilling} disabled={isManagingBilling}>
                            {isManagingBilling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <CreditCard className="h-4 w-4 mr-2" />
                            Manage Payment Method
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Paid Sites</div>
                    <div className="text-2xl font-bold text-slate-900">{summary.activeSiteCount}</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Volume Discount</div>
                    <div className="text-2xl font-bold text-slate-900">{summary.discountPercent}%</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Monthly Total</div>
                    <div className="text-2xl font-bold text-slate-900">
                        ${summary.netTotal.toFixed(2)}
                        {summary.discountPercent > 0 && (
                            <span className="text-sm text-slate-400 line-through ml-2">${summary.grossTotal.toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Site</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {summary.sites.map((site) => (
                                <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{site.name}</div>
                                        <div className="text-sm text-slate-500">{site.domain}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {site.plan ? (
                                            <span className="text-slate-700">
                                                {site.plan.name} (${site.plan.price}/mo)
                                                {site.plan.status !== "ACTIVE" && (
                                                    <span className="ml-1.5 text-xs font-medium text-amber-600">({site.plan.status})</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">
                                                Not subscribed{plan ? ` ($${plan.price}/mo available)` : ""}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {summary.callerRole !== "OWNER" ? (
                                            <span className="text-xs text-slate-400">Organization owner only</span>
                                        ) : site.plan ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={pendingSiteId === site.id}
                                                onClick={() => handleRemove(site.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                {pendingSiteId === site.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                Remove
                                            </Button>
                                        ) : (
                                            <Button size="sm" disabled={pendingSiteId === site.id} onClick={() => handleSubscribe(site.id)}>
                                                {pendingSiteId === site.id && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                                Subscribe
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isAddSiteOpen} onOpenChange={setIsAddSiteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a website</DialogTitle>
                        <DialogDescription>
                            Creates a new site under this organization. It'll show up below as "Not subscribed" until
                            you click Subscribe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input
                            placeholder="Site name"
                            value={newSiteName}
                            onChange={(e) => setNewSiteName(e.target.value)}
                        />
                        <Input
                            placeholder="example.com"
                            value={newSiteDomain}
                            onChange={(e) => setNewSiteDomain(e.target.value)}
                        />
                        {addSiteError && <p className="text-sm text-red-500">{addSiteError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSiteOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSite} disabled={isAddingSite || !newSiteName.trim() || !newSiteDomain.trim()}>
                            {isAddingSite && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Website
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
