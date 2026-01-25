
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db"; // Corrected import
import { SUBSCRIPTION_PLANS } from "@/config/plans"; // Import plans config for fallback
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        console.error("Stripe webhook error", error);
        return new NextResponse("Webhook error", { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;
        const subscriptionId = session.subscription as string;

        if (!userId || !planName) {
            return new NextResponse("Missing metadata", { status: 400 });
        }

        console.log(`Processing subscription for user ${userId} on plan ${planName}`);

        // Find the Plan ID from DB based on name? 
        // Or if we stored static plans in DB, we find it.
        // For now, let's assume we find the plan by name (slug) or create a placeholder logic if Plan model is strictly used.

        // IMPORTANT: The schema shows `plan Plan @relation...`
        // We need to find the `Plan` record ID first.
        let planRecord = await prisma.plan.findFirst({
            where: { name: planName } // OR slug
        });

        if (!planRecord) {
            console.log(`Plan ${planName} not found in DB, creating it...`);
            const planConfig = SUBSCRIPTION_PLANS.find(p => p.name === planName);
            if (planConfig) {
                planRecord = await prisma.plan.create({
                    data: {
                        name: planConfig.name,
                        slug: planConfig.name.toLowerCase().replace(/\s+/g, '-'), // best effort slug
                        price: planConfig.price,
                    }
                });
            } else {
                console.error("Plan configuration not found for:", planName);
                return new NextResponse("Unknown plan", { status: 400 });
            }
        }

        // Create or Update Subscription
        await prisma.subscription.upsert({
            where: { userId: userId },
            create: {
                userId: userId,
                planId: planRecord.id,
                stripeSubscriptionId: subscriptionId,
                status: "ACTIVE",
                startDate: new Date(),
                // endDate: set based on current_period_end usually
            },
            update: {
                planId: planRecord.id,
                stripeSubscriptionId: subscriptionId,
                status: "ACTIVE",
                // endDate...
            }
        });
    }

    return new NextResponse(null, { status: 200 });
}
