
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin",
    },
    callbacks: {
        async jwt({ token, trigger, session }) {
            if (trigger === "update" && session?.name) {
                token.name = session.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.name) {
                session.user.name = token.name
            }
            // Add User ID to session if needed for other queries
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            return session
        }
    },
    ...authConfig,
    providers: [
        ...authConfig.providers.filter((provider: any) => provider.id !== "credentials"), // Removing the dummy one
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) {
                    return null
                }

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (passwordsMatch) {
                    return user
                }

                return null
            }
        })
    ]
})
