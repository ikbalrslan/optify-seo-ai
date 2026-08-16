"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "@/components/auth/SignInButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/register";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";
import { Suspense } from 'react';

function SignInContent() {
    const [view, setView] = useState<"login" | "signup">("login"); // Default to login or check param
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Effect to set view based on URL param if needed, or default to login
    // Ideally we might want ?view=signup

    async function handleLogin(formData: FormData) {
        setIsLoading(true);
        setError("");

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
                router.push(callbackUrl);
            }
        } catch (error) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSignup(formData: FormData) {
        setIsLoading(true);
        setError("");

        try {
            const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";
            await register(formData, callbackUrl);

            // Auto login after register
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            });

            if (res?.ok) {
                const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";
                router.push(callbackUrl);
            } else {
                router.push("/signin");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    }

    // Client wrapper is less needed if we separate handlers, but let's keep it simple
    const handleSubmit = async (formData: FormData) => {
        if (view === "login") {
            await handleLogin(formData);
        } else {
            await handleSignup(formData);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
            <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col space-y-5">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-end gap-[3px]">
                            <div className="w-1.5 h-5 bg-[#009E8A] rounded-full"></div>
                            <div className="w-1.5 h-7 bg-[#191414] rounded-full"></div>
                            <div className="w-1.5 h-3 bg-[#009E8A]/60 rounded-full"></div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
                            {view === "login" ? "Welcome back" : "Welcome to Optify"}
                        </h1>
                        <p className="text-[#4a4a4a] text-[15px] leading-relaxed">
                            {view === "login"
                                ? "Sign in to continue to your dashboard."
                                : "Create a free account to discover your business's best seo strategy."}
                        </p>
                    </div>

                    {/* Google Button */}
                    <SignInButton
                        callbackUrl={searchParams.get("callbackUrl") || "/onboarding"}
                        text={view === "login" ? "Sign in with Google" : "Sign up with Google"}
                    />

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Email Form */}
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}
                        {view === "signup" && (
                            <input type="hidden" name="captchaToken" value={captchaToken || ""} />
                        )}
                        <div className="space-y-1.5">
                            <label className="text-[15px] font-medium text-[#1a1a1a]">
                                Email
                            </label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[15px] font-medium text-[#1a1a1a]">
                                Password
                            </label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#009E8A] focus:ring-[#009E8A]/20 rounded-xl"
                            />
                        </div>

                        {view === "signup" && (
                            <div className="flex justify-center scale-90 origin-center py-2">
                                <ReCAPTCHA
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                    onChange={setCaptchaToken}
                                    theme="light"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || (view === "signup" && !captchaToken)}
                            className="w-full h-11 text-[15px] font-semibold bg-[#009E8A] hover:bg-[#00877A] text-white rounded-xl shadow-lg shadow-[#009E8A]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading
                                ? (view === "login" ? "Signing in..." : "Creating account...")
                                : (view === "login" ? "Sign in with email" : "Sign up with email")}
                        </Button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-6 text-center space-y-3">
                        <div className="text-sm text-slate-500">
                            {view === "login" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button
                                        onClick={() => setView("signup")}
                                        className="font-semibold text-[#009E8A] hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => setView("login")}
                                        className="font-semibold text-[#009E8A] hover:underline"
                                    >
                                        Log in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
                <p className="text-sm text-slate-500">
                    By signing up, you agree to our <Link href="#" className="underline hover:text-slate-800">Terms of Service</Link>.
                </p>
                <Link href="#" className="block text-sm text-slate-500 hover:text-slate-800">
                    Need help?
                </Link>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
