"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProjects() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    return prisma.project.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function createProject(name: string, domain: string, country: string = "US") {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    if (!name.trim() || !domain.trim()) {
        throw new Error("Name and domain are required");
    }

    const project = await prisma.project.create({
        data: {
            userId: session.user.id,
            name: name.trim(),
            domain: domain.trim(),
            country,
        },
    });

    revalidatePath("/generators/keyword");
    return project;
}

export async function updateProjectAutopilotSettings(
    projectId: string,
    input: { autopilotEnabled: boolean; autopilotSeedKeyword?: string; autopilotConnectedSiteId?: string | null }
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.user.id },
    });
    if (!project) {
        throw new Error("Project not found");
    }

    if (input.autopilotEnabled && !input.autopilotSeedKeyword?.trim() && !project.autopilotSeedKeyword) {
        throw new Error("A seed keyword is required to enable autopilot");
    }

    await prisma.project.update({
        where: { id: projectId },
        data: {
            autopilotEnabled: input.autopilotEnabled,
            ...(input.autopilotSeedKeyword !== undefined && { autopilotSeedKeyword: input.autopilotSeedKeyword.trim() || null }),
            ...(input.autopilotConnectedSiteId !== undefined && { autopilotConnectedSiteId: input.autopilotConnectedSiteId }),
        },
    });

    revalidatePath("/generators/keyword");
    return { success: true };
}
