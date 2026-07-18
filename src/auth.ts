
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { ensureAdminHasProPlan } from "@/lib/admin"
import { ensurePersonalOrganization } from "@/lib/org"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    trustHost: true,
    pages: {
        signIn: "/signin",
    },
    events: {
        // Only fires for adapter-driven user creation (Google OAuth first sign-in) - the
        // credentials/register.ts path creates User rows directly and calls
        // ensurePersonalOrganization itself, since it never touches the adapter's event system.
        async createUser({ user }) {
            if (user.id) {
                await ensurePersonalOrganization(user.id, user.name ?? user.email ?? "My");
            }
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            // When signing in with Google, ensure the tokens are saved
            if (account?.provider === "google" && user.id) {
                try {
                    // Update the account with the latest tokens
                    await prisma.account.updateMany({
                        where: {
                            userId: user.id,
                            provider: "google"
                        },
                        data: {
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            expires_at: account.expires_at,
                        }
                    });
                } catch (error) {
                    console.error("Error updating Google tokens:", error);
                }
            }

            if (user.id && (user as { role?: string }).role === "ADMIN") {
                try {
                    await ensureAdminHasProPlan(user.id);
                } catch (error) {
                    console.error("Error ensuring admin Pro plan:", error);
                }
            }

            return true;
        },
        async jwt({ token, trigger, session, account, user }) {
            if (trigger === "update" && session?.name) {
                token.name = session.name
            }
            // Only present on initial sign in - persisted in the token from then on,
            // so a role change takes effect on the user's next sign in.
            if (user) {
                token.role = (user as { role?: string }).role ?? "USER";
            }
            // Store account info in token on initial sign in
            if (account) {
                token.accessToken = account.access_token;
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
            if (session.user) {
                // `token.role` isn't a declared JWT field (next-auth's own JWT type doesn't
                // expose custom fields in this version), so it resolves as `unknown` - cast
                // explicitly rather than relying on `??`, which mistypes as `{}` against `unknown`.
                session.user.role = (token.role as string | undefined) ?? "USER";
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
