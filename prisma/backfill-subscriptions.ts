import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// One-off backfill: run once after the "subscription_per_project_nullable" migration deploys,
// and before the follow-up migration that drops userId/stripeSubscriptionId and makes
// organizationId/projectId required. For every existing per-user Subscription row, attaches it
// to that user's organization + that organization's single Project (the "site" this
// subscription was really paying for, now that Subscription is per-Project instead of
// per-User). If the org has zero or multiple projects, we can't guess which one - logged for
// manual review rather than fabricated.
//   node --experimental-strip-types prisma/backfill-subscriptions.ts
async function main() {
    const subscriptions = await prisma.subscription.findMany({
        where: { organizationId: null },
    });

    let attached = 0;
    let skipped = 0;

    for (const sub of subscriptions) {
        if (!sub.userId) {
            console.warn(`WARNING: Subscription ${sub.id} has no userId and no organizationId - cannot backfill, skipping.`);
            skipped++;
            continue;
        }

        const membership = await prisma.organizationMember.findFirst({
            where: { userId: sub.userId },
            orderBy: { createdAt: "asc" },
        });

        if (!membership) {
            console.warn(`WARNING: Subscription ${sub.id}'s user ${sub.userId} has no organization - skipping.`);
            skipped++;
            continue;
        }

        const projects = await prisma.project.findMany({
            where: { organizationId: membership.organizationId },
        });

        if (projects.length !== 1) {
            console.warn(
                `WARNING: Organization ${membership.organizationId} has ${projects.length} project(s) - cannot determine which one Subscription ${sub.id} belongs to, skipping. Attach manually.`
            );
            skipped++;
            continue;
        }

        await prisma.subscription.update({
            where: { id: sub.id },
            data: {
                organizationId: membership.organizationId,
                projectId: projects[0].id,
            },
        });

        console.log(`Attached Subscription ${sub.id} -> org ${membership.organizationId}, project ${projects[0].id} (${projects[0].name})`);
        attached++;
    }

    console.log(`Done. Attached ${attached} subscription(s), skipped ${skipped}.`);

    const stillOrphaned = await prisma.subscription.count({ where: { organizationId: null } });
    if (stillOrphaned > 0) {
        console.warn(`WARNING: ${stillOrphaned} subscription(s) still have no organizationId - resolve before the follow-up NOT NULL migration.`);
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
