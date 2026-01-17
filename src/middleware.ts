import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnSignIn = req.nextUrl.pathname.startsWith('/signin')
    const isRoot = req.nextUrl.pathname === '/'

    // Specific protected routes (or we could protect everything except login)
    // Let's protect everything except login for simplicity based on user request "show seo engine tool otherwise request login first"
    // But we must allow public assets if they fall through matcher (already handled)

    if (isRoot) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', req.nextUrl))
        }
        return // Allow access to landing page
    }

    if (isOnSignIn) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', req.nextUrl))
        }
        return // Allow access to signin page
    }

    if (!isLoggedIn) {
        return Response.redirect(new URL('/signin', req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
