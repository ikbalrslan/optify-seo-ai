"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "@/components/auth/SignInButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/register";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        try {
            // Check if we are logging in or registering based on user intent?
            // For now, let's assume this form acts as a "Sign Up / Sign In" hybrid or just register.
            // User requested "normal signup".

            // Try to register first
            await register(formData);
            // Register action handles redirect on success
        } catch (err) {
            // If registration fails (e.g. user exists), try determining if it's a login attempt or just show error.
            // For simplicity based on prompt "signup not working", we'll just show the error.
            // Ideally we'd have separate forms or a "smart" check.
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    }

    // Wrap the server action in a client handler to manage state
    const clientAction = async (formData: FormData) => {
        await handleSubmit(formData);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
            <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col space-y-5">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-end gap-[3px]">
                            <div className="w-1.5 h-5 bg-[#1DB954] rounded-full"></div>
                            <div className="w-1.5 h-7 bg-[#191414] rounded-full"></div>
                            <div className="w-1.5 h-3 bg-[#1DB954]/60 rounded-full"></div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
                            Welcome to Optify
                        </h1>
                        <p className="text-[#4a4a4a] text-[15px] leading-relaxed">
                            Create a free account to discover your business&apos;s best seo strategy.
                        </p>
                    </div>

                    {/* Google Button */}
                    <SignInButton />

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Email Sign Up Form */}
                    <form action={clientAction} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}
                        <input type="hidden" name="captchaToken" value={captchaToken || ""} />
                        <div className="space-y-1.5">
                            <label className="text-[15px] font-medium text-[#1a1a1a]">
                                Email
                            </label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#1DB954] focus:ring-[#1DB954]/20 rounded-xl"
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
                                className="h-11 text-[15px] bg-white border-slate-200 focus:border-[#1DB954] focus:ring-[#1DB954]/20 rounded-xl"
                            />
                        </div>

                        <div className="flex justify-center scale-90 origin-center py-2">
                            <ReCAPTCHA
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={setCaptchaToken}
                                theme="light"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !captchaToken}
                            className="w-full h-11 text-[15px] font-semibold bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating account..." : "Sign up with email"}
                        </Button>
                    </form>

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
