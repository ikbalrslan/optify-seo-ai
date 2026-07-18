import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// One-off backfill: run once after the "add organizationId nullable" migration deploys, and
// before the follow-up migration that makes it NOT NULL. For every existing User with no
// organization membership yet, creates a personal Organization (OWNER), and reassigns their
// existing Project/ConnectedSite rows to it.
//   node --experimental-strip-types prisma/backfill-organizations.ts
async function main() {
    const users = await prisma.user.findMany({
        include: { memberships: true },
    });

    let created = 0;
    let skipped = 0;

    for (const user of users) {
        if (user.memberships.length > 0) {
            skipped++;
            continue;
        }

        const displayName = user.name ?? user.email ?? "My";
        const organization = await prisma.organization.create({
            data: {
                name: `${displayName}'s Organization`,
                members: { create: { userId: user.id, role: "OWNER" } },
            },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { activeOrganizationId: organization.id },
        });

        const [projects, connectedSites] = await Promise.all([
            prisma.project.updateMany({
                where: { userId: user.id, organizationId: null },
                data: { organizationId: organization.id },
            }),
            prisma.connectedSite.updateMany({
                where: { userId: user.id, organizationId: null },
                data: { organizationId: organization.id },
            }),
        ]);

        console.log(
            `Created "${organization.name}" for ${user.email ?? user.id} - reassigned ${projects.count} project(s), ${connectedSites.count} connected site(s)`
        );
        created++;
    }

    console.log(`Done. Created ${created} organization(s), skipped ${skipped} user(s) already backfilled.`);

    const orphanedProjects = await prisma.project.count({ where: { organizationId: null } });
    const orphanedSites = await prisma.connectedSite.count({ where: { organizationId: null } });
    if (orphanedProjects > 0 || orphanedSites > 0) {
        console.warn(
            `WARNING: ${orphanedProjects} project(s) and ${orphanedSites} connected site(s) still have no organizationId (likely orphaned rows with no matching User) - resolve before the follow-up NOT NULL migration.`
        );
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
