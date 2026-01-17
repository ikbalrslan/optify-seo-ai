"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut, signIn } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";

export function Navbar() {
    const { data: session } = useSession();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="sticky top-0 z-30 flex items-center p-4 border-b border-border/40 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full justify-end">
                {session?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-12 rounded-full px-2 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 bg-muted/30 rounded-full pl-1 pr-4 py-1 border border-border/50">
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt="Profile"
                                            className="h-9 w-9 rounded-full object-cover border-2 border-background shadow-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-9 w-9 bg-secondary rounded-full border border-input">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <span className="font-semibold text-sm text-foreground/90">
                                        {session.user.name?.split(" ")[0] || "User"}
                                    </span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session.user.name || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {session.user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/billing">Billing</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="gap-2"
                    >
                        <User className="h-4 w-4" />
                        Sign In
                    </Button>
                )}
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView="login"
            />
        </div>
    );
}
