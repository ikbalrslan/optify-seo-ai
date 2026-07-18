import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = ["miarslan.ikb@gmail.com", "arslanahmetsamil@gmail.com"];

// One-off: grants platform ADMIN role to the given emails. Admins no longer need a granted
// Subscription - they get unlimited autopilot access directly via a role check (see
// getEffectiveAutopilotLimit in src/actions/autopilot.ts), since Subscription is now per-Project
// rather than per-User.
async function main() {
    for (const email of ADMIN_EMAILS) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            continue;
        }

        if (user.role === "ADMIN") {
            console.log(`- ${email} is already ADMIN`);
            continue;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
        });
        console.log(`✅ Set role to ADMIN for ${email}`);
    }

    console.log("🎉 Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
