"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateBlogPost, generateBlogContent, type BlogInput } from "@/actions/generate-blog";
import { decrypt } from "@/lib/encryption";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

// Types
// A scheduled post either targets a connected external site (connectedSiteId set - the site's
// own `type` field, e.g. WORDPRESS, determines which publish adapter runs) or, when
// connectedSiteId is omitted, this app's own internal /blog.
export type ScheduledPostInput = {
    connectedSiteId?: string;
    keywordId?: string;
    keyword: string;
    intent: "informational" | "commercial" | "navigational";
    tone: string;
    length: number;
    language: string;
    scheduledDate: Date;
    publishStatus: "draft" | "publish";
};

async function uniqueBlogSlug(title: string): Promise<string> {
    const base = slugify(title) || "post";
    let slug = base;
    let suffix = 2;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${base}-${suffix}`;
        suffix++;
    }
    return slug;
}

export type AutopilotQuota = {
    used: number;
    limit: number; // -1 = unlimited, 0 = disabled
    remaining: number; // -1 if unlimited
};

// ============================================
// LIMIT CHECKING (Backend Only - Source of Truth)
// ============================================

async function checkAutopilotLimit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: { include: { plan: true } } }
    });

    const limit = user?.subscription?.plan?.autopilotPostsPerMonth ?? 0;

    // -1 = unlimited
    if (limit === -1) return { allowed: true, remaining: -1, limit: -1 };

    // 0 = disabled
    if (limit === 0) return { allowed: false, remaining: 0, limit: 0 };

    // Count posts created this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const used = await prisma.scheduledPost.count({
        where: {
            userId,
            createdAt: { gte: startOfMonth }
        }
    });

    return {
        allowed: used < limit,
        remaining: limit - used,
        limit
    };
}

// ============================================
// PUBLIC ACTIONS
// ============================================

/**
 * Get current user's autopilot quota
 */
export async function getAutopilotQuota(): Promise<AutopilotQuota> {
    const session = await auth();
    if (!session?.user?.id) {
        return { used: 0, limit: 0, remaining: 0 };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: { include: { plan: true } } }
    });

    const limit = user?.subscription?.plan?.autopilotPostsPerMonth ?? 0;

    if (limit === -1) {
        return { used: 0, limit: -1, remaining: -1 };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const used = await prisma.scheduledPost.count({
        where: {
            userId: session.user.id,
            createdAt: { gte: startOfMonth }
        }
    });

    return {
        used,
        limit,
        remaining: Math.max(0, limit - used)
    };
}

/**
 * Create a new scheduled post
 */
export async function createScheduledPost(input: ScheduledPostInput) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    // Backend limit check - cannot be bypassed
    const limitCheck = await checkAutopilotLimit(session.user.id);
    if (!limitCheck.allowed) {
        if (limitCheck.limit === 0) {
            throw new Error("Autopilot is not available on your current plan. Please upgrade.");
        }
        throw new Error("Monthly autopilot limit reached. Please upgrade or wait until next month.");
    }

    if (input.connectedSiteId) {
        // Verify the connected site belongs to this user
        const site = await prisma.connectedSite.findFirst({
            where: {
                id: input.connectedSiteId,
                userId: session.user.id
            }
        });

        if (!site) {
            throw new Error("Connected site not found or does not belong to you.");
        }
    }

    // Validate scheduled date is today or in the future (compare dates only, not time)
    const scheduledDate = new Date(input.scheduledDate);
    const today = new Date();
    scheduledDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (scheduledDate < today) {
        throw new Error("Scheduled date cannot be in the past.");
    }

    const post = await prisma.scheduledPost.create({
        data: {
            userId: session.user.id,
            connectedSiteId: input.connectedSiteId,
            keywordId: input.keywordId,
            keyword: input.keyword,
            intent: input.intent,
            tone: input.tone,
            length: input.length,
            language: input.language,
            scheduledDate: new Date(input.scheduledDate),
            publishStatus: input.publishStatus,
            status: "SCHEDULED",
        }
    });

    revalidatePath("/autopilot");
    return { success: true, id: post.id };
}

/**
 * Quick schedule a keyword to the next available date (one post per day)
 */
export async function quickScheduleKeyword(keyword: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    // Check limit
    const limitCheck = await checkAutopilotLimit(session.user.id);
    if (!limitCheck.allowed) {
        throw new Error(limitCheck.limit === 0
            ? "Your plan does not include Autopilot. Upgrade to access this feature."
            : "You have reached your monthly Autopilot limit.");
    }

    // Get user's first connected site (or throw if none)
    const site = await prisma.connectedSite.findFirst({
        where: { userId: session.user.id }
    });

    if (!site) {
        throw new Error("No connected site found. Please add one in Settings first.");
    }

    // Find the next available date (starting from today)
    const nextDate = await getNextAvailableDate(session.user.id);

    // Create the scheduled post with default settings
    const post = await prisma.scheduledPost.create({
        data: {
            userId: session.user.id,
            connectedSiteId: site.id,
            keyword: keyword,
            intent: "informational",
            tone: "professional",
            length: 1500,
            language: "en",
            scheduledDate: nextDate,
            publishStatus: "draft",
            status: "SCHEDULED",
        }
    });

    revalidatePath("/autopilot");
    revalidatePath("/keywords");
    return { success: true, id: post.id, scheduledDate: nextDate };
}

/**
 * Find the next available date that has no scheduled posts for this user
 */
async function getNextAvailableDate(userId: string): Promise<Date> {
    // Start from today
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0); // Set to 9 AM

    // Get all scheduled post dates for this user from today onwards
    const existingPosts = await prisma.scheduledPost.findMany({
        where: {
            userId,
            scheduledDate: { gte: startDate },
            status: "SCHEDULED"
        },
        select: { scheduledDate: true },
        orderBy: { scheduledDate: "asc" }
    });

    // Create a set of date strings (YYYY-MM-DD) that are occupied
    const occupiedDates = new Set<string>();
    for (const post of existingPosts) {
        const dateStr = post.scheduledDate.toISOString().split("T")[0];
        occupiedDates.add(dateStr);
    }

    // Find the first available date
    const checkDate = new Date(startDate);
    for (let i = 0; i < 365; i++) { // Check up to a year ahead
        const dateStr = checkDate.toISOString().split("T")[0];
        if (!occupiedDates.has(dateStr)) {
            return new Date(checkDate);
        }
        checkDate.setDate(checkDate.getDate() + 1);
    }

    // If somehow all dates are occupied, just use the date a year from now
    return new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
}

/**
 * Update an existing scheduled post (only if not yet executed)
 */
export async function updateScheduledPost(id: string, input: Partial<ScheduledPostInput>) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const existing = await prisma.scheduledPost.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!existing) {
        throw new Error("Scheduled post not found.");
    }

    if (existing.status !== "SCHEDULED") {
        throw new Error("Cannot edit a post that has already been processed.");
    }

    // If changing connected site, verify ownership
    if (input.connectedSiteId && input.connectedSiteId !== existing.connectedSiteId) {
        const site = await prisma.connectedSite.findFirst({
            where: { id: input.connectedSiteId, userId: session.user.id }
        });
        if (!site) {
            throw new Error("Connected site not found or does not belong to you.");
        }
    }

    await prisma.scheduledPost.update({
        where: { id },
        data: {
            ...(input.connectedSiteId && { connectedSiteId: input.connectedSiteId }),
            ...(input.keyword && { keyword: input.keyword }),
            ...(input.intent && { intent: input.intent }),
            ...(input.tone && { tone: input.tone }),
            ...(input.length && { length: input.length }),
            ...(input.language && { language: input.language }),
            ...(input.scheduledDate && { scheduledDate: new Date(input.scheduledDate) }),
            ...(input.publishStatus && { publishStatus: input.publishStatus }),
        }
    });

    revalidatePath("/autopilot");
    return { success: true };
}

/**
 * Delete a scheduled post
 */
export async function deleteScheduledPost(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const existing = await prisma.scheduledPost.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!existing) {
        throw new Error("Scheduled post not found.");
    }

    await prisma.scheduledPost.delete({
        where: { id }
    });

    revalidatePath("/autopilot");
    return { success: true };
}

/**
 * Get scheduled posts for a specific month/year (calendar view)
 */
export async function getScheduledPosts(month: number, year: number) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const posts = await prisma.scheduledPost.findMany({
        where: {
            userId: session.user.id,
            scheduledDate: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            connectedSite: {
                select: { name: true, url: true, type: true }
            }
        },
        orderBy: { scheduledDate: "asc" }
    });

    return posts.map(post => ({
        id: post.id,
        keyword: post.keyword,
        intent: post.intent,
        tone: post.tone,
        length: post.length,
        language: post.language,
        scheduledDate: post.scheduledDate,
        publishStatus: post.publishStatus,
        status: post.status,
        generatedTitle: post.generatedTitle,
        publishedPostUrl: post.publishedPostUrl,
        errorMessage: post.errorMessage,
        executedAt: post.executedAt,
        connectedSite: post.connectedSite,
        createdAt: post.createdAt,
    }));
}

/**
 * Get a single scheduled post by ID
 */
export async function getScheduledPostById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const post = await prisma.scheduledPost.findFirst({
        where: { id, userId: session.user.id },
        include: {
            connectedSite: {
                select: { id: true, name: true, url: true, type: true }
            }
        }
    });

    if (!post) {
        throw new Error("Scheduled post not found.");
    }

    return post;
}

/**
 * Process all due scheduled posts (called by cron)
 * This is the main autopilot execution function
 */
export async function processDueScheduledPosts() {
    const now = new Date();

    // Get all posts that are due and still scheduled
    const duePosts = await prisma.scheduledPost.findMany({
        where: {
            scheduledDate: { lte: now },
            status: "SCHEDULED"
        },
        include: {
            connectedSite: true,
            user: true
        }
    });

    console.log(`[Autopilot] Found ${duePosts.length} due posts to process`);

    for (const post of duePosts) {
        try {
            // Mark as generating
            await prisma.scheduledPost.update({
                where: { id: post.id },
                data: { status: "GENERATING" }
            });

            console.log(`[Autopilot] Generating post for keyword: ${post.keyword}`);

            // Generate blog content
            const blogInput: BlogInput = {
                keyword: post.keyword,
                intent: post.intent as "informational" | "commercial" | "navigational",
                length: post.length,
                tone: post.tone,
                competitors: "",
            };

            // Note: We call the generation logic directly here
            // We need to bypass auth since this is a cron job
            const result = await generateBlogContent(blogInput);

            if (!result.success || !result.data) {
                throw new Error("Blog generation failed");
            }

            const generated = result.data;
            const selectedTitle = generated.titles[0];
            const selectedDescription = generated.meta_descriptions[0];
            const contentHTML = generated.sections
                .map((s: { h2: string; content: string }) => `<h2>${s.h2}</h2>${s.content}`)
                .join("");

            let publishedPostUrl: string;

            if (!post.connectedSite) {
                // No connected site - publish directly into this app's own /blog
                const slug = await uniqueBlogSlug(selectedTitle);
                const isPublished = post.publishStatus === "publish";

                await prisma.blogPost.create({
                    data: {
                        slug,
                        title: selectedTitle,
                        metaDescription: selectedDescription,
                        metaKeywords: JSON.stringify(generated.meta_keywords ?? []),
                        content: contentHTML,
                        status: isPublished ? "PUBLISHED" : "DRAFT",
                        publishedAt: isPublished ? new Date() : null,
                        scheduledPostId: post.id,
                    },
                });

                publishedPostUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/blog/${slug}`;
            } else {
                // Publish to a connected external site - dispatch on its type.
                // Add a new case here (plus a matching credential shape in ConnectedSite.credentials)
                // when a new site type is added.
                switch (post.connectedSite.type) {
                    case "WORDPRESS": {
                        const creds = JSON.parse(post.connectedSite.credentials) as { username: string; encryptedAppPassword: string };
                        const appPassword = decrypt(creds.encryptedAppPassword);
                        const credentials = btoa(`${creds.username}:${appPassword}`);
                        const endpoint = `${post.connectedSite.url}/wp-json/optify/v1/publish`;

                        const wpResponse = await fetch(endpoint, {
                            method: "POST",
                            headers: {
                                "Authorization": `Basic ${credentials}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                title: selectedTitle,
                                content: contentHTML,
                                meta_description: selectedDescription,
                                focus_keyword: post.keyword,
                                status: post.publishStatus
                            })
                        });

                        const wpResult = await wpResponse.json();

                        if (!wpResponse.ok) {
                            throw new Error(wpResult.message || `WordPress publishing failed: ${wpResponse.status}`);
                        }

                        publishedPostUrl = wpResult.permalink;
                        break;
                    }
                    default:
                        throw new Error(`Unsupported connected site type: ${post.connectedSite.type}`);
                }
            }

            // Mark as published
            await prisma.scheduledPost.update({
                where: { id: post.id },
                data: {
                    status: "PUBLISHED",
                    generatedTitle: selectedTitle,
                    generatedContent: contentHTML,
                    generatedDescription: selectedDescription,
                    publishedPostUrl,
                    executedAt: new Date()
                }
            });

            console.log(`[Autopilot] Successfully published: ${selectedTitle}`);

        } catch (error: any) {
            console.error(`[Autopilot] Failed to process post ${post.id}:`, error);

            // Mark as failed
            await prisma.scheduledPost.update({
                where: { id: post.id },
                data: {
                    status: "FAILED",
                    errorMessage: error.message || "Unknown error",
                    executedAt: new Date()
                }
            });
        }
    }

    return { processed: duePosts.length };
}

/**
 * Retry a failed post
 */
export async function retryScheduledPost(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const post = await prisma.scheduledPost.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!post) {
        throw new Error("Scheduled post not found.");
    }

    if (post.status !== "FAILED") {
        throw new Error("Only failed posts can be retried.");
    }

    // Reset to scheduled so cron will pick it up
    await prisma.scheduledPost.update({
        where: { id },
        data: {
            status: "SCHEDULED",
            errorMessage: null,
            executedAt: null
        }
    });

    revalidatePath("/autopilot");
    return { success: true };
}

// ============================================
// FULLY AUTONOMOUS MONTHLY DISCOVERY + SCHEDULING (called by cron)
// ============================================

const MAX_AUTO_SCHEDULED_PER_PROJECT_PER_RUN = 5; // cap per run even on unlimited plans

/**
 * For every project with autopilot enabled: discover this month's rising keywords for its
 * seed keyword, skip ones already scheduled for that project, and auto-create scheduled
 * posts (spaced via getNextAvailableDate) up to the user's remaining monthly quota.
 */
export async function runAutopilotDiscoveryAndScheduling() {
    const { discoverKeywordsInternal } = await import("@/actions/keyword-discovery");

    const projects = await prisma.project.findMany({
        where: {
            autopilotEnabled: true,
            autopilotSeedKeyword: { not: null },
        },
    });

    console.log(`[Autopilot] Monthly discovery: ${projects.length} project(s) enabled`);

    let totalScheduled = 0;

    for (const project of projects) {
        try {
            const limitCheck = await checkAutopilotLimit(project.userId);
            if (!limitCheck.allowed) {
                console.log(`[Autopilot] Skipping project ${project.id} - quota exhausted`);
                continue;
            }

            const discovery = await discoverKeywordsInternal(project, project.autopilotSeedKeyword!);

            const existing = await prisma.scheduledPost.findMany({
                where: { projectId: project.id },
                select: { keyword: true },
            });
            const usedKeywords = new Set(existing.map(p => p.keyword));

            const slots = limitCheck.remaining === -1
                ? MAX_AUTO_SCHEDULED_PER_PROJECT_PER_RUN
                : Math.min(limitCheck.remaining, MAX_AUTO_SCHEDULED_PER_PROJECT_PER_RUN);

            const candidates = discovery.rising
                .filter(row => !usedKeywords.has(row.relatedQuery))
                .slice(0, slots);

            for (const candidate of candidates) {
                const nextDate = await getNextAvailableDate(project.userId);
                await prisma.scheduledPost.create({
                    data: {
                        userId: project.userId,
                        projectId: project.id,
                        connectedSiteId: project.autopilotConnectedSiteId,
                        keyword: candidate.relatedQuery,
                        intent: "informational",
                        tone: "professional",
                        length: 1500,
                        language: "en",
                        scheduledDate: nextDate,
                        publishStatus: "draft",
                        status: "SCHEDULED",
                    },
                });
                totalScheduled++;
            }

            console.log(`[Autopilot] Project ${project.id}: scheduled ${candidates.length} post(s)`);
        } catch (error) {
            console.error(`[Autopilot] Discovery/scheduling failed for project ${project.id}:`, error);
        }
    }

    revalidatePath("/autopilot");
    return { projectsProcessed: projects.length, scheduled: totalScheduled };
}

