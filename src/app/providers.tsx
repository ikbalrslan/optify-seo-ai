"use client"

import { SessionProvider } from "next-auth/react"
import { type Session } from "next-auth"

import { ThemeProvider } from "@/components/providers/theme-provider"

export function Providers({ session, children }: { session: Session | null, children: React.ReactNode }) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
