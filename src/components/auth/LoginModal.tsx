"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SignInButton } from "./SignInButton"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Ensure Button is available if we needed a custom trigger, but we'll wrap the trigger

export function LoginModal({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Welcome Back</DialogTitle>
                    <DialogDescription className="text-center">
                        Sign in to your account to continue
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                    <SignInButton />
                </div>
            </DialogContent>
        </Dialog>
    )
}
