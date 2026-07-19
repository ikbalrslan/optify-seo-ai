"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { ensurePersonalOrganization } from "@/lib/org";

const prisma = new PrismaClient();

export async function register(formData: FormData, redirectTo: string = "/dashboard") {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const captchaToken = formData.get("captchaToken") as string;

    if (!email || !password) {
        throw new Error("Missing required fields");
    }

    if (!captchaToken) {
        throw new Error("Missing Captcha Token");
    }

    // Verify Captcha
    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error("Invalid Captcha");
        }
    } catch (error) {
        throw new Error("Captcha verification failed");
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // If user exists but has no password (e.g. Google auth), you might want to handle merge account logic.
            // For simple signup, we'll throw error.
            throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: email.split("@")[0], // Default name
                role: "USER"
            },
        });

        await ensurePersonalOrganization(newUser.id, newUser.name ?? email, email);

        // Auto sign-in after registration. redirectTo is validated by NextAuth's default
        // redirect callback (no custom one is configured), which only allows same-origin
        // targets - safe even though it can come from a user-visible callbackUrl query param.
        await signIn("credentials", {
            email,
            password,
            redirectTo,
        });

    } catch (error) {
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            throw error; // Let Next.js handle redirect
        }
        console.error("Registration error:", error);
        throw new Error(error instanceof Error ? error.message : "Something went wrong");
    }
}
