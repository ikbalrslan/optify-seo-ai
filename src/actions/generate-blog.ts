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
    // Project-level preferences captured during onboarding (src/actions/onboarding.ts) - all
    // optional since not every caller has a Project to pull these from (the standalone manual
    // generator at src/app/(app)/generators/blog/page.tsx has no project context, only
    // autopilot's project-scoped generation - src/actions/autopilot.ts - populates these).
    targetAudiences: z.array(z.string()).optional(),
    articleStyle: z.string().optional(),
    customInstructions: z.string().optional(),
    internalLinksTarget: z.number().optional(),
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

export async function generateBlogContent(
    input: BlogInput
): Promise<{ success: true; data: z.infer<typeof GeneratorResponseSchema> }> {
    const client = createAnthropicClient();

    const systemPrompt = `You are an expert SEO content writer. Generate a comprehensive blog post based on the user's input.

    Ensure the content is optimized for the keyword: "${input.keyword}".
    Search Intent: ${input.intent}.
    Tone: ${input.tone}.
    ${input.articleStyle ? `Writing style: ${input.articleStyle}.` : ""}
    Approx Word Count: ${input.length}.
    ${input.targetAudiences?.length ? `Target audience(s): ${input.targetAudiences.join(", ")}.` : ""}
    ${input.competitors ? "Competitors to analyze/outrank: " + input.competitors : ""}
    ${input.customInstructions ? `Additional instructions to follow: ${input.customInstructions}` : ""}

    Provide 3 distinct options for "titles" and "meta_descriptions" (150-160 chars each).
    Provide 5-8 relevant "meta_keywords".
    ${input.internalLinksTarget ? `Suggest exactly ${input.internalLinksTarget} "internal_links" anchor-text suggestions relevant to the topic.` : ""}
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

// Next.js strips thrown Server Action error messages down to a generic digest-only string in
// production (see the identical note in src/actions/register.ts and
// src/actions/keyword-discovery.ts) - this client-facing action returns failures as data
// instead of throwing, so a real error (e.g. a missing ANTHROPIC_API_KEY) actually reaches the
// user instead of the generic "error occurred in Server Components render" box.
export async function generateBlogPost(
    input: BlogInput
): Promise<
    | { success: true; data: z.infer<typeof GeneratorResponseSchema> }
    | { success: false; error: string }
> {
    console.log("Starting generateBlogPost with input:", JSON.stringify(input));
    let session;
    try {
        session = await auth();
        console.log("Session retrieved:", session?.user?.email);
    } catch (e) {
        console.error("Auth error:", e);
        return { success: false, error: "Authentication failed" };
    }

    if (!session?.user?.email) {
        console.error("No session found");
        return { success: false, error: "Not authenticated" };
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
            return { success: false, error: `Rate limit exceeded. Please wait ${remaining} seconds.` };
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

    const parsed = BlogInputSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: "Invalid input: " + parsed.error.message };
    }

    try {
        console.log("Calling Claude API...");
        return await generateBlogContent(input);
    } catch (error) {
        console.error("Claude Error Detail:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate blog post" };
    }
}
