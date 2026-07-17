import NextAuth from "next-auth"
import authConfig from "./auth.config"

// Middleware runs on the Edge runtime, which can't load the Prisma-backed auth() from
// src/auth.ts, so it builds its own lightweight instance from the shared provider config.
// That means it does NOT get src/auth.ts's `jwt`/`session` callbacks, so `role` (set on the
// token during full sign-in) wouldn't otherwise reach `req.auth.user` here - this local
// `session` callback re-adds just that, without touching the DB.
const { auth } = NextAuth({
    ...authConfig,
    // Without this, a Host header that doesn't exactly match NEXTAUTH_URL makes auth() throw
    // UntrustedHost internally - and since that error object is still truthy, `!!req.auth`
    // below reads as "logged in" even for a signed-out visitor, bypassing the redirect below
    // entirely. src/auth.ts already sets this for the main app; this instance needs it too.
    trustHost: true,
    callbacks: {
        session({ session, token }) {
            if (session.user) {
                (session.user as { role?: string }).role = (token as { role?: string }).role ?? "USER";
            }
            return session;
        },
    },
})

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnSignIn = req.nextUrl.pathname.startsWith('/signin')
    const isRoot = req.nextUrl.pathname === '/'
    const isBlog = req.nextUrl.pathname.startsWith('/blog')
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    // Specific protected routes (or we could protect everything except login)
    // Let's protect everything except login for simplicity based on user request "show seo engine tool otherwise request login first"
    // But we must allow public assets if they fall through matcher (already handled)

    if (isRoot) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', req.nextUrl))
        }
        return // Allow access to landing page
    }

    // Allow public access to blog
    if (isBlog) {
        return // Allow access to blog pages
    }

    if (isOnSignIn) {
        if (isLoggedIn) {
            const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
            if (callbackUrl) {
                return Response.redirect(new URL(callbackUrl, req.nextUrl))
            }
            return Response.redirect(new URL('/dashboard', req.nextUrl))
        }
        return // Allow access to signin page
    }

    if (!isLoggedIn) {
        return Response.redirect(new URL('/signin', req.nextUrl))
    }

    const role = (req.auth?.user as { role?: string } | undefined)?.role
    if (isAdmin && role !== 'ADMIN') {
        return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
