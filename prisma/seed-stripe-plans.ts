import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Matches src/config/plans.ts's marketing copy exactly - these are real, user-visible prices.
const PLAN_TIERS = [
    { name: "Beginner", slug: "beginner", price: 49, autopilotPostsPerMonth: 9 },
    { name: "Pro", slug: "pro", price: 99, autopilotPostsPerMonth: 20 },
    { name: "Ultimate", slug: "ultimate", price: 199, autopilotPostsPerMonth: 50 },
    { name: "Enterprise", slug: "enterprise", price: 499, autopilotPostsPerMonth: 100 },
];

// Volume discount tiers for the org-wide "more sites, less per site" pricing (see
// src/lib/billing.ts) - fixed, well-known Coupon IDs so this script is idempotent and the app
// can reference them directly without a lookup table.
const VOLUME_COUPONS = [
    { id: "optifyseo-vol-10", percent_off: 10 },
    { id: "optifyseo-vol-15", percent_off: 15 },
    { id: "optifyseo-vol-20", percent_off: 20 },
];

// Idempotent: for each Plan tier, creates a real Stripe Product + recurring monthly Price if
// missing, and 3 fixed volume-discount Coupons if missing. Run once per environment (dev,
// acceptance, prod each need their own Stripe test/live-mode objects since IDs aren't portable
// across Stripe accounts/modes).
//   node --experimental-strip-types prisma/seed-stripe-plans.ts
async function main() {
    for (const tier of PLAN_TIERS) {
        const plan = await prisma.plan.upsert({
            where: { slug: tier.slug },
            update: { name: tier.name, price: tier.price, autopilotPostsPerMonth: tier.autopilotPostsPerMonth },
            create: {
                name: tier.name,
                slug: tier.slug,
                price: tier.price,
                autopilotPostsPerMonth: tier.autopilotPostsPerMonth,
            },
        });

        if (plan.stripePriceId) {
            console.log(`- ${plan.name}: already has stripePriceId ${plan.stripePriceId}, skipping`);
            continue;
        }

        const product = await stripe.products.create({
            name: `Optify SEO - ${tier.name}`,
            description: `${tier.autopilotPostsPerMonth} articles/mo per site`,
        });

        const price = await stripe.prices.create({
            product: product.id,
            currency: "usd",
            unit_amount: Math.round(tier.price * 100),
            recurring: { interval: "month" },
        });

        await prisma.plan.update({
            where: { id: plan.id },
            data: { stripeProductId: product.id, stripePriceId: price.id },
        });

        console.log(`✅ ${plan.name}: created Product ${product.id} / Price ${price.id}`);
    }

    for (const coupon of VOLUME_COUPONS) {
        try {
            await stripe.coupons.retrieve(coupon.id);
            console.log(`- Coupon ${coupon.id}: already exists, skipping`);
        } catch {
            await stripe.coupons.create({
                id: coupon.id,
                percent_off: coupon.percent_off,
                duration: "forever",
                name: `${coupon.percent_off}% volume discount`,
            });
            console.log(`✅ Created coupon ${coupon.id} (${coupon.percent_off}% off, forever)`);
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
