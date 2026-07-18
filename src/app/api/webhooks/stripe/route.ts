import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { recomputeOrgDiscount } from "@/lib/billing";
import Stripe from "stripe";

// This API version's Invoice no longer exposes `.subscription` directly - it moved under
// `parent.subscription_details.subscription`, which can be a string ID or an expanded object.
function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const sub = invoice.parent?.subscription_details?.subscription;
    if (!sub) return null;
    return typeof sub === "string" ? sub : sub.id;
}

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error);
        return new NextResponse("Webhook error", { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const { organizationId, projectId, planId } = session.metadata ?? {};
                const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
                const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

                if (!organizationId || !projectId || !planId || !stripeSubscriptionId || !stripeCustomerId) {
                    console.error("checkout.session.completed missing metadata/ids for session", session.id);
                    break;
                }

                const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                const item = stripeSubscription.items.data[0];

                await prisma.organization.update({
                    where: { id: organizationId },
                    data: { stripeCustomerId, stripeSubscriptionId },
                });

                await prisma.subscription.upsert({
                    where: { projectId },
                    create: {
                        organizationId,
                        projectId,
                        planId,
                        status: "ACTIVE",
                        stripeSubscriptionItemId: item?.id,
                    },
                    update: {
                        planId,
                        status: "ACTIVE",
                        stripeSubscriptionItemId: item?.id,
                    },
                });

                await recomputeOrgDiscount(organizationId);
                break;
            }

            case "customer.subscription.updated": {
                const stripeSubscription = event.data.object as Stripe.Subscription;
                const organization = await prisma.organization.findUnique({
                    where: { stripeSubscriptionId: stripeSubscription.id },
                });
                if (!organization) break;

                const activeItemIds = new Set(stripeSubscription.items.data.map((item) => item.id));
                const status =
                    stripeSubscription.status === "active" ? "ACTIVE" :
                    stripeSubscription.status === "past_due" ? "PAST_DUE" :
                    stripeSubscription.status === "canceled" ? "CANCELED" :
                    null;

                const subscriptions = await prisma.subscription.findMany({
                    where: { organizationId: organization.id },
                });

                for (const sub of subscriptions) {
                    // An item missing from the Stripe subscription means it was removed
                    // out-of-band (e.g. directly in the Stripe dashboard) - reconcile it here.
                    if (sub.stripeSubscriptionItemId && !activeItemIds.has(sub.stripeSubscriptionItemId)) {
                        await prisma.subscription.update({
                            where: { id: sub.id },
                            data: { status: "CANCELED", endDate: new Date() },
                        });
                    } else if (status) {
                        await prisma.subscription.update({
                            where: { id: sub.id },
                            data: { status },
                        });
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const stripeSubscription = event.data.object as Stripe.Subscription;
                const organization = await prisma.organization.findUnique({
                    where: { stripeSubscriptionId: stripeSubscription.id },
                });
                if (!organization) break;

                await prisma.subscription.updateMany({
                    where: { organizationId: organization.id },
                    data: { status: "CANCELED", endDate: new Date() },
                });
                await prisma.organization.update({
                    where: { id: organization.id },
                    data: { stripeSubscriptionId: null },
                });
                break;
            }

            case "invoice.payment_failed":
            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                const stripeSubscriptionId = invoiceSubscriptionId(invoice);
                if (!stripeSubscriptionId) break;

                const organization = await prisma.organization.findUnique({
                    where: { stripeSubscriptionId },
                });
                if (!organization) break;

                // Failed/succeeded payments affect the whole invoice (all of the org's sites at
                // once, since they're billed together) - no email infra exists yet to page the
                // owner individually, so this is surfaced via an in-app banner only for now.
                await prisma.subscription.updateMany({
                    where: { organizationId: organization.id, status: { not: "CANCELED" } },
                    data: { status: event.type === "invoice.payment_failed" ? "PAST_DUE" : "ACTIVE" },
                });
                break;
            }

            default:
                break;
        }
    } catch (error) {
        console.error(`Stripe webhook handler error for event ${event.type}:`, error);
        return new NextResponse("Webhook handler error", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
