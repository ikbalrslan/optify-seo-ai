"use server";

import crypto from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireOrgRole, type OrgRole } from "@/lib/org";
import { revalidatePath } from "next/cache";

const INVITE_EXPIRY_DAYS = 7;

export async function getMyOrganizations() {
    const session = await auth();
    if (!session?.user?.id) {
        return { organizations: [], activeOrganizationId: null };
    }

    const [memberships, user] = await Promise.all([
        prisma.organizationMember.findMany({
            where: { userId: session.user.id },
            include: { organization: true },
            orderBy: { createdAt: "asc" },
        }),
        prisma.user.findUnique({ where: { id: session.user.id }, select: { activeOrganizationId: true } }),
    ]);

    return {
        organizations: memberships.map((m) => ({
            id: m.organization.id,
            name: m.organization.name,
            role: m.role,
        })),
        // Falls back to the first membership, same as getActiveOrganization()'s self-heal, for
        // a brand-new user whose activeOrganizationId hasn't been set yet - but otherwise this
        // is the actual persisted value, not a guess. OrgSwitcher used to assume memberships[0]
        // was always the active org to avoid this second query; that broke the moment
        // acceptInvite()/switchActiveOrganization() set activeOrganizationId to anything else,
        // since the switcher would then think the real active org was still unselected and
        // silently no-op every click on it (handleSwitch bails out when orgId === activeId).
        activeOrganizationId: user?.activeOrganizationId ?? memberships[0]?.organizationId ?? null,
    };
}

export async function switchActiveOrganization(
    organizationId: string
): Promise<{ success: true } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    const membership = await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId, userId: session.user.id } },
    });
    if (!membership) {
        return { success: false, error: "You are not a member of this organization." };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { activeOrganizationId: organizationId },
    });

    revalidatePath("/", "layout");
    return { success: true };
}

export async function createOrganization(
    name: string
): Promise<{ success: true; id: string } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }
    if (!name.trim()) {
        return { success: false, error: "Name is required" };
    }

    const organization = await prisma.organization.create({
        data: {
            name: name.trim(),
            members: { create: { userId: session.user.id, role: "OWNER" } },
        },
    });

    await prisma.user.update({
        where: { id: session.user.id },
        data: { activeOrganizationId: organization.id },
    });

    revalidatePath("/", "layout");
    return { success: true, id: organization.id };
}

export async function getOrganizationMembers(organizationId: string) {
    await requireOrgRole(organizationId, "MEMBER");

    const [members, invites] = await Promise.all([
        prisma.organizationMember.findMany({
            where: { organizationId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" },
        }),
        prisma.organizationInvite.findMany({
            where: { organizationId, acceptedAt: null },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    return {
        members: members.map((m) => ({
            id: m.id,
            userId: m.userId,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
        })),
        invites: invites.map((i) => ({
            id: i.id,
            email: i.email,
            role: i.role,
            token: i.token,
            expiresAt: i.expiresAt,
        })),
    };
}

export async function inviteMember(
    organizationId: string,
    email: string,
    role: Extract<OrgRole, "ADMIN" | "MEMBER">
): Promise<{ success: true; token: string } | { success: false; error: string }> {
    const { userId } = await requireOrgRole(organizationId, "ADMIN");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
        return { success: false, error: "Email is required" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
        const alreadyMember = await prisma.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId, userId: existingUser.id } },
        });
        if (alreadyMember) {
            return { success: false, error: "This person is already a member." };
        }
    }

    const existingInvite = await prisma.organizationInvite.findFirst({
        where: { organizationId, email: normalizedEmail, acceptedAt: null },
    });
    if (existingInvite) {
        return { success: false, error: "This email already has a pending invite." };
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await prisma.organizationInvite.create({
        data: {
            organizationId,
            email: normalizedEmail,
            role,
            token,
            invitedByUserId: userId,
            expiresAt,
        },
    });

    revalidatePath("/organization");
    return { success: true, token };
}

export async function revokeInvite(
    organizationId: string,
    inviteId: string
): Promise<{ success: true } | { success: false; error: string }> {
    await requireOrgRole(organizationId, "ADMIN");

    await prisma.organizationInvite.deleteMany({
        where: { id: inviteId, organizationId },
    });

    revalidatePath("/organization");
    return { success: true };
}

export async function getInvitePreview(token: string) {
    const invite = await prisma.organizationInvite.findUnique({
        where: { token },
        include: { organization: { select: { name: true } } },
    });

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        return null;
    }

    return { organizationName: invite.organization.name, email: invite.email, role: invite.role };
}

export async function acceptInvite(
    token: string
): Promise<{ success: true; organizationId: string } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
        return { success: false, error: "Not authenticated" };
    }

    const invite = await prisma.organizationInvite.findUnique({ where: { token } });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        return { success: false, error: "This invite is invalid or has expired." };
    }

    if (invite.email !== session.user.email.toLowerCase()) {
        return { success: false, error: "This invite was sent to a different email address." };
    }

    await prisma.$transaction([
        prisma.organizationMember.upsert({
            where: { organizationId_userId: { organizationId: invite.organizationId, userId: session.user.id } },
            update: {},
            create: { organizationId: invite.organizationId, userId: session.user.id, role: invite.role },
        }),
        prisma.organizationInvite.update({
            where: { id: invite.id },
            data: { acceptedAt: new Date() },
        }),
        prisma.user.update({
            where: { id: session.user.id },
            data: { activeOrganizationId: invite.organizationId },
        }),
    ]);

    revalidatePath("/", "layout");
    return { success: true, organizationId: invite.organizationId };
}

export async function updateMemberRole(
    organizationId: string,
    memberUserId: string,
    newRole: OrgRole
): Promise<{ success: true } | { success: false; error: string }> {
    const { userId: actingUserId } = await requireOrgRole(organizationId, "OWNER");

    if (memberUserId === actingUserId && newRole !== "OWNER") {
        const otherOwners = await prisma.organizationMember.count({
            where: { organizationId, role: "OWNER", userId: { not: actingUserId } },
        });
        if (otherOwners === 0) {
            return { success: false, error: "An organization must have at least one owner." };
        }
    }

    await prisma.organizationMember.update({
        where: { organizationId_userId: { organizationId, userId: memberUserId } },
        data: { role: newRole },
    });

    revalidatePath("/organization");
    return { success: true };
}

export async function removeMember(
    organizationId: string,
    memberUserId: string
): Promise<{ success: true } | { success: false; error: string }> {
    const { userId: actingUserId, role: actingRole } = await requireOrgRole(organizationId, "ADMIN");

    const target = await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId, userId: memberUserId } },
    });
    if (!target) {
        return { success: false, error: "Member not found." };
    }

    // ADMINs can only remove MEMBERs; only an OWNER can remove an ADMIN or another OWNER.
    if (target.role !== "MEMBER" && actingRole !== "OWNER") {
        return { success: false, error: "Only an owner can remove an admin or owner." };
    }

    if (target.role === "OWNER") {
        const otherOwners = await prisma.organizationMember.count({
            where: { organizationId, role: "OWNER", userId: { not: memberUserId } },
        });
        if (otherOwners === 0) {
            return { success: false, error: "An organization must have at least one owner." };
        }
    }

    await prisma.organizationMember.delete({
        where: { organizationId_userId: { organizationId, userId: memberUserId } },
    });

    // If a member removes themselves and it was their active org, clear it so getActiveOrganization() re-resolves.
    if (memberUserId === actingUserId) {
        await prisma.user.updateMany({
            where: { id: actingUserId, activeOrganizationId: organizationId },
            data: { activeOrganizationId: null },
        });
    }

    revalidatePath("/organization");
    return { success: true };
}
