"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createAnthropicClient } from "@/lib/anthropic";
import { assembleBlogHtml, type AssemblableBlog } from "@/lib/blog-content";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// A handful of well-known, stable root pages from genuinely authoritative SEO/marketing
// publishers - the only external domains the model is allowed to cite (see the system prompt
// below). Deep-linking to a specific article the model can't verify exists is how you end up
// with hallucinated 404s in published content; linking to each publisher's own stable hub page
// avoids that while still giving the post real outbound citations.
const EXTERNAL_CITATION_WHITELIST = [
    { name: "Google Search Central", url: "https://developers.google.com/search/docs" },
    { name: "Moz Blog", url: "https://moz.com/blog" },
    { name: "Search Engine Journal", url: "https://www.searchenginejournal.com" },
    { name: "Ahrefs Blog", url: "https://ahrefs.com/blog" },
    { name: "HubSpot Blog", url: "https://blog.hubspot.com" },
];

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
    // Real pages this post is allowed to link to internally (see getInternalLinkCandidates in
    // src/actions/autopilot.ts) - a closed list of actual existing URLs, never left open-ended,
    // so the model can't invent a broken internal link the way it could with a free-text target.
    internalLinkCandidates: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
});

export type BlogInput = z.infer<typeof BlogInputSchema>;

// Output Schema structure (concept)
const GeneratorResponseSchema = z.object({
    titles: z.array(z.string()),
    meta_descriptions: z.array(z.string()),
    meta_keywords: z.array(z.string()),
    // Short (2-5 word) visual search phrase used to auto-illustrate the post via Unsplash - see
    // assembleBlogHtml in src/lib/blog-content.ts. Optional because image resolution itself is
    // best-effort (a query that returns nothing just means no image for that slot).
    hero_image_query: z.string().optional(),
    sections: z.array(z.object({
        h2: z.string(),
        content: z.string(), // HTML or Markdown
        image_query: z.string().optional(),
    })),
    faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
    })).optional(),
});

export async function generateBlogContent(
    input: BlogInput
): Promise<{ success: true; data: z.infer<typeof GeneratorResponseSchema> }> {
    const client = createAnthropicClient();

    const externalLinksNote = EXTERNAL_CITATION_WHITELIST.map(s => `${s.name}: ${s.url}`).join("; ");

    const internalLinksNote = input.internalLinkCandidates?.length
        ? `You may naturally hyperlink to relevant pages from this exact list where topically appropriate (use the EXACT url given, do not alter or invent others): ${input.internalLinkCandidates.map(c => `"${c.title}" -> ${c.url}`).join("; ")}. Embed ${input.internalLinksTarget ?? "2-4"} of these as real <a href="..."> tags inside the section content, with natural anchor text - never a raw URL as the visible text.`
        : "";

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
    ${internalLinksNote}
    You may also cite 1-2 of these authoritative sources as external links where genuinely relevant, using their EXACT url (never a different page on that domain, never a different domain): ${externalLinksNote}.
    For "hero_image_query" and each section's "image_query", give a short (2-5 word) concrete visual search phrase describing a real-world photo that would illustrate that part of the article (e.g. "team analyzing marketing charts", not an abstract concept like "growth" alone).
    Each section's "content" should be HTML (paragraphs and lists only, no h1/h2 tags within it, no <img> tags - images are inserted separately from image_query).`;

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

// Client-callable wrapper around assembleBlogHtml (src/lib/blog-content.ts) - the manual Blog
// Generator UI (src/app/(app)/generators/blog/page.tsx) is a client component and the Unsplash
// key must stay server-side, so it can't call assembleBlogHtml directly.
export async function renderBlogHtml(generated: AssemblableBlog): Promise<string> {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }
    return assembleBlogHtml(generated);
}
