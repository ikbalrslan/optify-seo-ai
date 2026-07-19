import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type OrgRole = "MEMBER" | "ADMIN" | "OWNER";

const ROLE_RANK: Record<OrgRole, number> = { MEMBER: 1, ADMIN: 2, OWNER: 3 };

function roleAtLeast(actual: string, min: OrgRole): boolean {
    const actualRank = ROLE_RANK[actual as OrgRole] ?? 0;
    return actualRank >= ROLE_RANK[min];
}

/**
 * Hard authorization gate for organization-scoped server actions - mirrors requireAdmin()'s
 * shape in src/actions/admin.ts. Throws (rather than returning {success:false}) because this
 * guards access to the action entirely; the UI already hides buttons a member without this
 * role wouldn't be able to use. Business-logic failures *inside* an authorized action (e.g.
 * "email already invited") should still return {success:false, error} instead of throwing -
 * see quickScheduleKeyword/createScheduledPost in src/actions/autopilot.ts for why.
 */
export async function requireOrgRole(
    organizationId: string,
    minRole: OrgRole
): Promise<{ userId: string; role: OrgRole }> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authorized");
    }

    const membership = await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId, userId: session.user.id } },
    });

    if (!membership || !roleAtLeast(membership.role, minRole)) {
        throw new Error("Not authorized");
    }

    return { userId: session.user.id, role: membership.role as OrgRole };
}

/**
 * Creates a personal organization for a brand-new user and makes them its OWNER. Called from
 * both places a User row gets created: src/auth.ts's `events.createUser` (Google OAuth, via
 * the Prisma adapter) and src/actions/register.ts (credentials signup, a direct prisma.user.create
 * that never goes through the adapter's event system) - kept here as one shared helper rather
 * than duplicating the org+membership+activeOrganizationId logic in both places.
 *
 * Skips creation when the email has a pending (unaccepted, unexpired) OrganizationInvite -
 * otherwise a teammate signing up specifically to accept an invite ended up owning a
 * throwaway solo org in addition to joining the real one, since acceptInvite() (called right
 * after, once they land back on /invite/[token]) only adds membership, it never removes an
 * org created here moments earlier.
 */
export async function ensurePersonalOrganization(userId: string, displayName: string, email?: string | null): Promise<void> {
    const existing = await prisma.organizationMember.findFirst({ where: { userId } });
    if (existing) {
        return;
    }

    if (email) {
        const pendingInvite = await prisma.organizationInvite.findFirst({
            where: { email: email.toLowerCase(), acceptedAt: null, expiresAt: { gt: new Date() } },
        });
        if (pendingInvite) {
            return;
        }
    }

    const organization = await prisma.organization.create({
        data: {
            name: `${displayName}'s Organization`,
            members: { create: { userId, role: "OWNER" } },
        },
    });

    await prisma.user.update({
        where: { id: userId },
        data: { activeOrganizationId: organization.id },
    });
}

/**
 * Combines "find the project → resolve its organization → verify the caller's role in that
 * organization" into one call - reused by every content action (keywords, keyword-discovery,
 * wordpress, autopilot) that operates on a specific project rather than the org as a whole.
 */
export async function requireOrgProjectAccess(projectId: string, minRole: OrgRole = "MEMBER") {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        throw new Error("Not authorized");
    }

    const { userId, role } = await requireOrgRole(project.organizationId, minRole);
    return { userId, role, project };
}

/**
 * Resolves the current user's active organization, self-healing if activeOrganizationId is
 * unset or points at an organization they're no longer a member of (falls back to their first
 * membership and persists it). Returns null if the user has no memberships at all.
 */
export async function getActiveOrganization() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { activeOrganizationId: true },
    });

    if (user?.activeOrganizationId) {
        const membership = await prisma.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId: user.activeOrganizationId, userId: session.user.id } },
            include: { organization: true },
        });
        if (membership) {
            return membership.organization;
        }
    }

    const firstMembership = await prisma.organizationMember.findFirst({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { createdAt: "asc" },
    });

    if (!firstMembership) {
        return null;
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { activeOrganizationId: firstMembership.organizationId },
    });

    return firstMembership.organization;
}
