"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createGeminiClient } from "@/lib/gemini";
import { z } from "zod";

// Input Schema
const BlogInputSchema = z.object({
    keyword: z.string().min(1, "Keyword is required"),
    intent: z.enum(["informational", "commercial", "navigational"]),
    audience: z.string().min(1, "Target audience is required"),
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

    console.log("Creating Gemini client...");
    const genAI = createGeminiClient();
    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `You are an expert SEO content writer. Generate a comprehensive blog post based on the user's input.
    
    Output JSON format only:
    {
      "titles": ["Option 1", "Option 2", "Option 3"],
      "meta_descriptions": ["Option 1 (150-160 chars)", "Option 2", "Option 3"],
      "meta_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "sections": [
        { "h2": "Section Heading", "content": "Section content in HTML format (paragraphs, lists only, no h1/h2 tags within content)" }
      ],
      "faq": [
        { "question": "...", "answer": "..." }
      ],
      "internal_links": ["suggested anchor text 1", "suggested anchor text 2"]
    }
    
    Ensure the content is optimized for the keyword: "${input.keyword}".
    Search Intent: ${input.intent}.
    Target Audience: ${input.audience}.
    Tone: ${input.tone}.
    Approx Word Count: ${input.length}.
    ${input.competitors ? "Competitors to analyze/outrank: " + input.competitors : ""}
    
    Provide 3 distinct options for "titles" and "meta_descriptions".
    Provide 5-8 relevant "meta_keywords".
    `;

    try {
        console.log("Calling Gemini API...");
        const result = await model.generateContent([
            systemPrompt,
            `Generate blog post for keyword: ${input.keyword}`
        ]);

        console.log("Gemini Response received");
        const response = result.response;
        let content = response.text();

        if (!content) {
            throw new Error("No content generated");
        }

        // Sanitize content: remove markdown code blocks if present (Gemini might add them even with JSON mode sometimes, though responseMimeType usually parses it)
        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replace(/^```(json)?/, "").replace(/```$/, "");
        }

        const parsed = JSON.parse(content);
        // Basic validation
        const validated = GeneratorResponseSchema.parse(parsed);

        return { success: true, data: validated };

    } catch (error: any) {
        console.error("Gemini Error Detail:", error);
        throw new Error(error.message || "Failed to generate blog post");
    }
}
