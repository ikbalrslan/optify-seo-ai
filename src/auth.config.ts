import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export default {
    providers: [
        Google,
        Credentials({
            async authorize(credentials) {
                return null
            }
        })
    ],
} satisfies NextAuthConfig
