import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "@/components/auth/SignInButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
            <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-sm border border-slate-100 p-12">
                <div className="flex flex-col space-y-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-end gap-[3px]">
                            <div className="w-2 h-6 bg-[#E57B5E] rounded-full"></div>
                            <div className="w-2 h-9 bg-[#E55F37] rounded-full"></div>
                            <div className="w-2 h-4 bg-[#E57B5E]/60 rounded-full"></div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-[32px] font-bold tracking-tight text-[#1a1a1a]">
                            Welcome to Optify
                        </h1>
                        <p className="text-[#4a4a4a] text-[17px] leading-relaxed">
                            Create a free account to discover your business's best marketing channels.
                        </p>
                    </div>

                    {/* Google Button */}
                    <SignInButton />

                    {/* Divider */}
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Email Sign Up */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[15px] font-medium text-[#1a1a1a]">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="zuck@meta.com"
                                className="h-12 text-lg bg-white border-slate-200 focus:border-[#E55F37] focus:ring-[#E55F37]/20 rounded-xl"
                            />
                        </div>
                        <Button className="w-full h-12 text-lg font-semibold bg-[#E55F37] hover:bg-[#D44E28] text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all">
                            Sign up with email
                        </Button>
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
