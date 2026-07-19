import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// One-off: ScheduledPost.projectId is becoming required (Phase 3's org-scoping retrofit needs
// every post anchored to a specific site for per-project autopilot quotas). Existing rows with
// no projectId predate that requirement - resolve one via the creating user's organization.
// Run BEFORE the "tighten_ownership_fks_required" migration, which will fail on any row this
// script can't resolve.
//
// Uses raw SQL rather than the generated Prisma Client for the null-projectId lookup/update:
// the client's types are generated from the *current* schema.prisma, where projectId is
// already required, so `where: { projectId: null }` no longer type-checks even though the
// live (pre-migration) database can still have such rows.
//   node --experimental-strip-types prisma/backfill-scheduledpost-project.ts
async function main() {
    const orphaned = await prisma.$queryRaw<{ id: string; userId: string }[]>`
        SELECT id, userId FROM ScheduledPost WHERE projectId IS NULL
    `;
    console.log(`Found ${orphaned.length} ScheduledPost row(s) with no projectId.`);

    let unresolved = 0;

    for (const post of orphaned) {
        const user = await prisma.user.findUnique({
            where: { id: post.userId },
            select: { activeOrganizationId: true },
        });

        let organizationId = user?.activeOrganizationId ?? null;
        if (!organizationId) {
            const membership = await prisma.organizationMember.findFirst({
                where: { userId: post.userId },
                orderBy: { createdAt: "asc" },
            });
            organizationId = membership?.organizationId ?? null;
        }

        if (!organizationId) {
            console.warn(`UNRESOLVED ScheduledPost ${post.id}: user ${post.userId} has no organization.`);
            unresolved++;
            continue;
        }

        const project = await prisma.project.findFirst({
            where: { organizationId },
            orderBy: { createdAt: "asc" },
        });

        if (!project) {
            console.warn(`UNRESOLVED ScheduledPost ${post.id}: organization ${organizationId} has no projects.`);
            unresolved++;
            continue;
        }

        await prisma.$executeRaw`UPDATE ScheduledPost SET projectId = ${project.id} WHERE id = ${post.id}`;
        console.log(`ScheduledPost ${post.id}: assigned projectId=${project.id} (org ${organizationId})`);
    }

    console.log(`Done. ${orphaned.length - unresolved} resolved, ${unresolved} unresolved.`);
    if (unresolved > 0) {
        console.error("STOP: do not run the tighten_ownership_fks_required migration until every row is resolved.");
        process.exitCode = 1;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
