import { DefaultSession } from "next-auth";

// Session/JWT are declared in @auth/core and re-exported through "next-auth"/"next-auth/jwt".
// A duplicate @auth/core install (top-level vs the one nested under next-auth/node_modules)
// means it's not fully predictable which module resolution TS follows from any given file, so
// both paths are augmented here. Call sites that still don't pick this up read `role` via an
// inline cast instead (see src/actions/admin.ts, src/middleware.ts).
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }
}

declare module "@auth/core/types" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role?: string;
    }
}
