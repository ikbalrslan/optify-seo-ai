"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers, getPlans, updateUserRole, updateUserPlan } from "@/actions/admin";

type AdminUser = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    planName: string | null;
    planId: string | null;
};

type Plan = {
    id: string;
    name: string;
};

const NO_PLAN = "NONE";

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [userList, planList] = await Promise.all([getUsers(), getPlans()]);
            setUsers(userList);
            setPlans(planList);
        } catch {
            setError("Failed to load users. You may not have admin access.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleRole = async (user: AdminUser) => {
        const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        setPendingUserId(user.id);
        try {
            const result = await updateUserRole(user.id, nextRole);
            if (!result.success) {
                alert(result.error);
                return;
            }
            await loadData();
        } finally {
            setPendingUserId(null);
        }
    };

    const handlePlanChange = async (user: AdminUser, planId: string) => {
        if (planId === NO_PLAN) return;
        setPendingUserId(user.id);
        try {
            const result = await updateUserPlan(user.id, planId);
            if (!result.success) {
                alert(result.error);
                return;
            }
            await loadData();
        } finally {
            setPendingUserId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((user) => {
                            const isSelf = user.id === session?.user?.id;
                            const disableRemoveSelf = isSelf && user.role === "ADMIN";
                            return (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        {user.name ?? "—"}
                                        {isSelf && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            user.role === "ADMIN"
                                                ? "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                                : "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                        }
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <Select
                                        value={user.planId ?? NO_PLAN}
                                        onValueChange={(value) => handlePlanChange(user, value)}
                                        disabled={pendingUserId === user.id}
                                    >
                                        <SelectTrigger className="h-8 w-40">
                                            <SelectValue placeholder="No plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {!user.planId && <SelectItem value={NO_PLAN}>No plan</SelectItem>}
                                            {plans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={pendingUserId === user.id || disableRemoveSelf}
                                        title={disableRemoveSelf ? "You can't remove your own admin role" : undefined}
                                        onClick={() => handleToggleRole(user)}
                                    >
                                        {pendingUserId === user.id ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : user.role === "ADMIN" ? (
                                            <ShieldOff className="h-4 w-4 mr-1" />
                                        ) : (
                                            <ShieldCheck className="h-4 w-4 mr-1" />
                                        )}
                                        {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                                    </Button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
