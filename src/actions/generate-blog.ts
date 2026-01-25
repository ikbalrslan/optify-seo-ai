"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createOpenAIClient } from "@/lib/openai";
import { z } from "zod";

// Input Schema
const BlogInputSchema = z.object({
    keyword: z.string().min(1, "Keyword is required"),
    intent: z.enum(["informational", "commercial", "navigational"]),
    audience: z.string().min(1, "Target audience is required"),
    length: z.number().min(300).max(5000),
    tone: z.string().min(1, "Tone is required"),
    competitors: z.string().optional(),
    model: z.string().optional(),
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
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    const result = BlogInputSchema.safeParse(input);
    if (!result.success) {
        throw new Error("Invalid input: " + result.error.message);
    }

    const openai = createOpenAIClient();

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
        const completion = await openai.chat.completions.create({
            model: input.model || "tngtech/deepseek-r1t2-chimera:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate blog post for keyword: ${input.keyword}` }
            ],
            response_format: { type: "json_object" },
        });

        let content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("No content generated");
        }

        // Sanitize content: remove markdown code blocks if present
        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replace(/^```(json)?/, "").replace(/```$/, "");
        }

        const parsed = JSON.parse(content);
        // Basic validation
        const validated = GeneratorResponseSchema.parse(parsed);

        return { success: true, data: validated };

    } catch (error: any) {
        console.error("OpenAI Error:", error);
        throw new Error(error.message || "Failed to generate blog post");
    }
}
