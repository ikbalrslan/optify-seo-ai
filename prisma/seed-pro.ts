import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Find the user
    const user = await prisma.user.findUnique({
        where: { email: "miarslan.ikb@gmail.com" },
        include: { subscription: true },
    });

    if (!user) {
        console.error("❌ User not found: miarslan.ikb@gmail.com");
        return;
    }

    // Create or update subscription for the user
    if (user.subscription) {
        await prisma.subscription.update({
            where: { userId: user.id },
            data: {
                planId: proPlan.id,
                status: "ACTIVE",
            },
        });
        console.log("✅ Updated existing subscription to Pro plan");
    } else {
        await prisma.subscription.create({
            data: {
                userId: user.id,
                planId: proPlan.id,
                status: "ACTIVE",
            },
        });
        console.log("✅ Created new subscription with Pro plan");
    }

    console.log("🎉 Done! User miarslan.ikb@gmail.com now has Pro plan with 30 autopilot credits.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
