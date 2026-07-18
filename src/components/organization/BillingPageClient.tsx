"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrgBillingSummary, getPlan } from "@/actions/billing";
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
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Billing</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Each site is billed separately{plan && ` at $${plan.price}/mo`}
                        {summary.discountPercent > 0 && `, with an automatic ${summary.discountPercent}% volume discount applied`}.
                    </p>
                </div>
                {summary.hasPaymentMethod && (
                    <Button variant="outline" onClick={handleManageBilling} disabled={isManagingBilling}>
                        {isManagingBilling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Payment Method
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Paid Sites</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.activeSiteCount}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Volume Discount</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.discountPercent}%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Monthly Total</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        ${summary.netTotal.toFixed(2)}
                        {summary.discountPercent > 0 && (
                            <span className="text-sm text-slate-400 line-through ml-2">${summary.grossTotal.toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Site</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {summary.sites.map((site) => (
                                <tr key={site.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white">{site.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{site.domain}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {site.plan
                                            ? `${site.plan.name} ($${site.plan.price}/mo)`
                                            : plan
                                                ? `${plan.name} ($${plan.price}/mo)`
                                                : "Not subscribed"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {site.plan ? (
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
        </div>
    );
}
