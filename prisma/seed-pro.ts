import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = ["miarslan.ikb@gmail.com", "arslanahmetsamil@gmail.com"];

async function main() {
    // Create or update Pro plan
    const proPlan = await prisma.plan.upsert({
        where: { slug: "pro" },
        update: {
            autopilotPostsPerMonth: 30,
        },
        create: {
            name: "Pro",
            slug: "pro",
            price: 29.99,
            autopilotPostsPerMonth: 30,
            limits: JSON.stringify({
                blogGenerations: -1, // unlimited
                keywordResearch: -1,
            }),
        },
    });

    console.log("✅ Pro plan created/updated:", proPlan);

    for (const email of ADMIN_EMAILS) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true },
        });

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            continue;
        }

        if (user.role !== "ADMIN") {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
            });
            console.log(`✅ Set role to ADMIN for ${email}`);
        }

        if (user.subscription) {
            await prisma.subscription.update({
                where: { userId: user.id },
                data: {
                    planId: proPlan.id,
                    status: "ACTIVE",
                },
            });
            console.log(`✅ Updated existing subscription to Pro plan for ${email}`);
        } else {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    planId: proPlan.id,
                    status: "ACTIVE",
                },
            });
            console.log(`✅ Created new subscription with Pro plan for ${email}`);
        }
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
