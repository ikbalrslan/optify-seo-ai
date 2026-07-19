"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, UserPlus, Copy, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    getOrganizationMembers,
    inviteMember,
    revokeInvite,
    updateMemberRole,
    removeMember,
} from "@/actions/organizations";
// Type-only import: erased at compile time, so this never pulls src/lib/org.ts's
// server-only code (auth()/prisma) into the client bundle.
import type { OrgRole } from "@/lib/org";

type Member = { id: string; userId: string; name: string | null; email: string | null; role: string };
type Invite = { id: string; email: string; role: string; token: string; expiresAt: Date };

export default function TeamPageClient({
    organizationId,
    organizationName,
}: {
    organizationId: string;
    organizationName: string;
}) {
    const { data: session } = useSession();
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingId, setPendingId] = useState<string | null>(null);

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
    const [inviteError, setInviteError] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getOrganizationMembers(organizationId);
            setMembers(data.members);
            setInvites(data.invites);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        load();
    }, [load]);

    const myMembership = members.find((m) => m.userId === session?.user?.id);
    const myRole = myMembership?.role ?? "MEMBER";
    const canManage = myRole === "ADMIN" || myRole === "OWNER";
    const isOwner = myRole === "OWNER";

    const handleInvite = async () => {
        setInviteError("");
        setIsInviting(true);
        try {
            const result = await inviteMember(organizationId, inviteEmail, inviteRole);
            if (!result.success) {
                setInviteError(result.error);
                return;
            }
            setInviteEmail("");
            setIsInviteOpen(false);
            await load();
        } finally {
            setIsInviting(false);
        }
    };

    const handleCopyLink = (token: string) => {
        const link = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const handleRoleChange = async (userId: string, newRole: OrgRole) => {
        setPendingId(userId);
        try {
            const result = await updateMemberRole(organizationId, userId, newRole);
            if (!result.success) {
                alert(result.error);
                return;
            }
            await load();
        } finally {
            setPendingId(null);
        }
    };

    const handleRemove = async (userId: string) => {
        setPendingId(userId);
        try {
            const result = await removeMember(organizationId, userId);
            if (!result.success) {
                alert(result.error);
                return;
            }
            await load();
        } finally {
            setPendingId(null);
        }
    };

    const handleRevokeInvite = async (inviteId: string) => {
        setPendingId(inviteId);
        try {
            await revokeInvite(organizationId, inviteId);
            await load();
        } finally {
            setPendingId(null);
        }
    };

    if (isLoading) {
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
                    <h2 className="text-lg font-semibold text-slate-900">{organizationName}</h2>
                    <p className="text-sm text-slate-500">Manage your team's members and invites</p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsInviteOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Member</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.map((member) => {
                                const canRemove =
                                    member.userId !== session?.user?.id &&
                                    ((myRole === "ADMIN" && member.role === "MEMBER") || isOwner);
                                return (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{member.name ?? "—"}</div>
                                            <div className="text-sm text-slate-500">{member.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isOwner && member.userId !== session?.user?.id ? (
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(value) => handleRoleChange(member.userId, value as OrgRole)}
                                                    disabled={pendingId === member.userId}
                                                >
                                                    <SelectTrigger className="h-8 w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MEMBER">MEMBER</SelectItem>
                                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                                        <SelectItem value="OWNER">OWNER</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {member.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {canRemove && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={pendingId === member.userId}
                                                    onClick={() => handleRemove(member.userId)}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    {pendingId === member.userId ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <X className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {invites.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Pending Invites</h3>
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invites.map((invite) => (
                                        <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-slate-900">{invite.email}</td>
                                            <td className="px-4 py-3 text-slate-500">{invite.role}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleCopyLink(invite.token)}>
                                                        {copiedToken === invite.token ? (
                                                            <Check className="h-4 w-4 mr-1 text-[#1DB954]" />
                                                        ) : (
                                                            <Copy className="h-4 w-4 mr-1" />
                                                        )}
                                                        {copiedToken === invite.token ? "Copied" : "Copy Link"}
                                                    </Button>
                                                    {canManage && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={pendingId === invite.id}
                                                            onClick={() => handleRevokeInvite(invite.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            {pendingId === invite.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite a team member</DialogTitle>
                        <DialogDescription>
                            We don't send the email for you yet - you'll get a link to copy and send however you like.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input
                            type="email"
                            placeholder="teammate@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "ADMIN" | "MEMBER")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEMBER">Member</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                        <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                            {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Send Invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
