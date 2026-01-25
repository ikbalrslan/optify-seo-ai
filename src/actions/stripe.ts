"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SUBSCRIPTION_PLANS } from "@/config/plans";

export async function createCheckoutSession(planName: string) {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.email) {
        throw new Error("Unauthorized");
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.name === planName);
    if (!plan) {
        throw new Error("Invalid plan");
    }

    // In a real app, you would have Stripe Price IDs in your plans config.
    // For now, we are creating "Price" objects on the fly or assuming a mapping.
    // Best practice: Store stripePriceId in SUBSCRIPTION_PLANS.

    // NOTE: Since we don't have real price IDs yet, we will use 'price_data' with currency/amount
    // This creates a product on the fly if needed, or better, we ask user to provide Price IDs.
    // For this implementation, I will simulate using a known pattern or placeholder logic.
    // Ideally, we should add `stripePriceId` to SUBSCRIPTION_PLANS.

    // Dynamic price_data for demonstration (NOT recommended for production subscriptions usually, but easier for setup)
    // Subscriptions usually require an existing Price ID.
    // Let's assume we pass a placeholder or try to find one.

    // For a robust implementation, we should CREATE prices. 
    // But since I cannot run "stripe" CLI to create them, I will use line_items with price_data (one-time) 
    // OR create a subscription with `price_data` (recurring).

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${plan.name} Subscription`,
                        description: `${plan.articles} articles/mo`,
                    },
                    unit_amount: Math.round(plan.price * 100), // cents
                    recurring: {
                        interval: "month",
                    },
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId: user.id || "",
            planName: plan.name,
        },
        customer_email: user.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?canceled=true`,
    });

    if (checkoutSession.url) {
        redirect(checkoutSession.url);
    }
}
