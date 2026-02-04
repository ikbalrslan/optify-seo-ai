import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export default {
    providers: [
        Google({
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/webmasters.readonly",
                    access_type: "offline",
                    prompt: "consent",
                }
            }
        }),
        Credentials({
            async authorize(credentials) {
                return null
            }
        })
    ],
} satisfies NextAuthConfig
