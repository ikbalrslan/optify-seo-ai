"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { register } from "@/actions/register";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
    const [view, setView] = useState<"login" | "signup">(initialView);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError("");
            setCaptchaToken(null);
        }
    }, [isOpen, initialView]);

    // Reset error and captcha when switching views
    const switchView = (newView: "login" | "signup") => {
        setView(newView);
        setError("");
        setCaptchaToken(null);
    };

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.refresh();
                onClose();
                router.push("/dashboard");
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
            await register(formData);
            onClose();
        } catch (err: any) {
            if (err.message === "NEXT_REDIRECT") {
                return;
            }
            setError(err.message || "Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-8 bg-white rounded-[24px] border-slate-100 overflow-hidden">
                <div className="flex flex-col space-y-5">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-end gap-[3px]">
                            <div className="w-1.5 h-5 bg-[#E57B5E] rounded-full"></div>
                            <div className="w-1.5 h-7 bg-[#E55F37] rounded-full"></div>
                            <div className="w-1.5 h-3 bg-[#E57B5E]/60 rounded-full"></div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-1.5">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-[#1a1a1a] text-left">
                                {view === "login" ? "Welcome back" : "Welcome to Optify"}
                            </DialogTitle>
                        </DialogHeader>
                        <p className="text-[#4a4a4a] text-[15px] leading-relaxed text-left">
                            {view === "login"
                                ? "Sign in to continue to your dashboard."
                                : "Create a free account to discover your business's best seo strategy."}
                        </p>
                    </div>

                    {/* Google Button */}
                    <Button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full h-11 text-[15px] font-medium bg-[#1a1a1a] hover:bg-black text-white rounded-xl flex items-center justify-center gap-2.5 transition-all"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        {view === "login" ? "Sign in with Google" : "Sign up with Google"}
                    </Button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Forms */}
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    {view === "login" ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#1a1a1a]">
                                    Email
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#E55F37] focus:ring-[#E55F37]/20 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#1a1a1a]">
                                    Password
                                </label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#E55F37] focus:ring-[#E55F37]/20 rounded-xl"
                                />
                            </div>
                            <div className="flex justify-center scale-90 origin-center">
                                <ReCAPTCHA
                                    key="login-captcha"
                                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                    onChange={setCaptchaToken}
                                    theme="light"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !captchaToken}
                                className="w-full h-11 text-[15px] font-semibold bg-[#E55F37] hover:bg-[#D44E28] text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing in..." : "Sign in with email"}
                            </Button>
                        </form>
                    ) : (
                        <form action={handleSignup} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#1a1a1a]">
                                    Email
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#E55F37] focus:ring-[#E55F37]/20 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#1a1a1a]">
                                    Password
                                </label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#E55F37] focus:ring-[#E55F37]/20 rounded-xl"
                                />
                            </div>
                            <div className="flex justify-center scale-90 origin-center">
                                <ReCAPTCHA
                                    key="signup-captcha"
                                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                    onChange={setCaptchaToken}
                                    theme="light"
                                />
                            </div>
                            <input type="hidden" name="captchaToken" value={captchaToken || ""} />
                            <Button
                                type="submit"
                                disabled={isLoading || !captchaToken}
                                className="w-full h-11 text-[15px] font-semibold bg-[#E55F37] hover:bg-[#D44E28] text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating account..." : "Sign up with email"}
                            </Button>
                        </form>
                    )}

                    {/* Footer Toggle */}
                    <div className="mt-6 text-center space-y-3">
                        <div className="text-sm text-slate-500">
                            {view === "login" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button
                                        onClick={() => switchView("signup")}
                                        className="font-semibold text-[#E55F37] hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => switchView("login")}
                                        className="font-semibold text-[#E55F37] hover:underline"
                                    >
                                        Log in
                                    </button>
                                </>
                            )}
                        </div>
                        {view === "signup" && (
                            <p className="text-xs text-slate-500">
                                By signing up, you agree to our <Link href="#" className="underline hover:text-slate-800">Terms of Service</Link>.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
