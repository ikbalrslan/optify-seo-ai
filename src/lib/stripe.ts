import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover' as any, // Cast to any to bypass strict typing if mismatched, or use exact known version
    typescript: true,
});
