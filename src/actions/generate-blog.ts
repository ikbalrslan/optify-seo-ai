"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createAnthropicClient } from "@/lib/anthropic";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Input Schema
const BlogInputSchema = z.object({
    keyword: z.string().min(1, "Keyword is required"),
    intent: z.enum(["informational", "commercial", "navigational"]),
    length: z.number().min(300).max(5000),
    tone: z.string().min(1, "Tone is required"),
    competitors: z.string().optional(),
});

export type BlogInput = z.infer<typeof BlogInputSchema>;

// Output Schema structure (concept)
const GeneratorResponseSchema = z.object({
    titles: z.array(z.string()),
    meta_descriptions: z.array(z.string()),
    meta_keywords: z.array(z.string()),
    sections: z.array(z.object({
        h2: z.string(),
        content: z.string(), // HTML or Markdown
    })),
    faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
    })).optional(),
    internal_links: z.array(z.string()).optional(),
});

export async function generateBlogContent(input: BlogInput) {
    const client = createAnthropicClient();

    const systemPrompt = `You are an expert SEO content writer. Generate a comprehensive blog post based on the user's input.

    Ensure the content is optimized for the keyword: "${input.keyword}".
    Search Intent: ${input.intent}.
    Tone: ${input.tone}.
    Approx Word Count: ${input.length}.
    ${input.competitors ? "Competitors to analyze/outrank: " + input.competitors : ""}

    Provide 3 distinct options for "titles" and "meta_descriptions" (150-160 chars each).
    Provide 5-8 relevant "meta_keywords".
    Each section's "content" should be HTML (paragraphs and lists only, no h1/h2 tags within it).`;

    const response = await client.messages.parse({
        model: "claude-sonnet-5",
        max_tokens: 16000,
        system: systemPrompt,
        messages: [
            { role: "user", content: `Generate blog post for keyword: ${input.keyword}` },
        ],
        output_config: {
            format: zodOutputFormat(GeneratorResponseSchema),
        },
    });

    if (!response.parsed_output) {
        throw new Error("No content generated");
    }

    return { success: true, data: response.parsed_output };
}

export async function generateBlogPost(input: BlogInput) {
    console.log("Starting generateBlogPost with input:", JSON.stringify(input));
    let session;
    try {
        session = await auth();
        console.log("Session retrieved:", session?.user?.email);
    } catch (e: any) {
        console.error("Auth error:", e);
        throw new Error("Authentication failed: " + e.message);
    }

    if (!session?.user?.email) {
        console.error("No session found");
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { lastBlogGeneratedAt: true }
    });

    if (user?.lastBlogGeneratedAt) {
        const now = new Date();
        const diff = now.getTime() - user.lastBlogGeneratedAt.getTime();
        const twoMinutes = 2 * 60 * 1000;

        if (diff < twoMinutes) {
            const remaining = Math.ceil((twoMinutes - diff) / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${remaining} seconds.`);
        }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { lastBlogGeneratedAt: new Date() }
        });
    } catch (e) {
        console.error("Failed to update lastBlogGeneratedAt", e);
        // Continue anyway, don't fail generation for this
    }

    const result = BlogInputSchema.safeParse(input);
    if (!result.success) {
        throw new Error("Invalid input: " + result.error.message);
    }

    try {
        console.log("Calling Claude API...");
        return await generateBlogContent(input);
    } catch (error: any) {
        console.error("Claude Error Detail:", error);
        throw new Error(error.message || "Failed to generate blog post");
    }
}
