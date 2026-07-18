import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// One-off: collapses the old Beginner/Pro/Ultimate/Enterprise tiers down to the single
// "all-in" Plan (see src/config/plans.ts). Run seed-stripe-plans.ts first so the "all-in"
// Plan row and its real Stripe Product/Price already exist.
//   node --experimental-strip-types prisma/migrate-to-single-plan.ts
async function main() {
    const allInPlan = await prisma.plan.findUnique({ where: { slug: "all-in" } });
    if (!allInPlan?.stripePriceId) {
        throw new Error('"all-in" Plan not found or has no stripePriceId - run seed-stripe-plans.ts first');
    }

    const staleSubscriptions = await prisma.subscription.findMany({
        where: { planId: { not: allInPlan.id } },
        include: { plan: true, project: true },
    });

    for (const sub of staleSubscriptions) {
        console.log(`Migrating "${sub.project.name}" from plan "${sub.plan.name}" to "All-in"...`);

        if (sub.stripeSubscriptionItemId) {
            await stripe.subscriptionItems.update(sub.stripeSubscriptionItemId, {
                price: allInPlan.stripePriceId,
                proration_behavior: "none",
            });
        }

        await prisma.subscription.update({
            where: { id: sub.id },
            data: { planId: allInPlan.id },
        });
    }
    console.log(`Migrated ${staleSubscriptions.length} subscription(s).`);

    const deleted = await prisma.plan.deleteMany({
        where: { id: { not: allInPlan.id } },
    });
    console.log(`Deleted ${deleted.count} old plan row(s).`);

    console.log("Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
