"use client";

import { useEffect, useState } from "react";
import { createCheckoutSession } from "@/actions/stripe";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { use } from "react";

export default function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
    const router = useRouter();
    const [error, setError] = useState("");
    const resolvedParams = use(params);

    useEffect(() => {
        const initCheckout = async () => {
            try {
                // Decode just in case, though params are usually decoded
                const planName = decodeURIComponent(resolvedParams.plan);
                await createCheckoutSession(planName);
            } catch (err: any) {
                console.error("Checkout init error", err);
                setError(err.message || "Failed to start checkout");
                // Fallback to settings or pricing after delay?
                setTimeout(() => router.push("/settings"), 3000);
            }
        };

        initCheckout();
    }, [resolvedParams, router]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="text-red-500 mb-2">Error: {error}</div>
                <div className="text-sm text-gray-500">Redirecting you back...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">Redirecting to Stripe...</h1>
            <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </div>
    );
}
