import cron from 'node-cron';

// This flag prevents multiple cron jobs from being scheduled
let isScheduled = false;

export function startAutopilotCron() {
    if (isScheduled) {
        console.log('[Cron] Autopilot cron already scheduled, skipping...');
        return;
    }

    // Schedule to run every 5 minutes (for testing)
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Starting autopilot processing at', new Date().toISOString());

        try {
            // Dynamically import to avoid issues with server actions at module load
            const { processDueScheduledPosts } = await import('@/actions/autopilot');
            const result = await processDueScheduledPosts();
            console.log(`[Cron] Autopilot processing complete. Processed ${result.processed} posts.`);
        } catch (error) {
            console.error('[Cron] Autopilot processing failed:', error);
        }
    });

    // Monthly discovery + auto-scheduling for projects with autopilot enabled - 1st of the
    // month at 3 AM server time
    cron.schedule('0 3 1 * *', async () => {
        console.log('[Cron] Starting monthly autopilot discovery at', new Date().toISOString());

        try {
            const { runAutopilotDiscoveryAndScheduling } = await import('@/actions/autopilot');
            const result = await runAutopilotDiscoveryAndScheduling();
            console.log(`[Cron] Monthly discovery complete. Scheduled ${result.scheduled} post(s) across ${result.projectsProcessed} project(s).`);
        } catch (error) {
            console.error('[Cron] Monthly autopilot discovery failed:', error);
        }
    });

    isScheduled = true;
    console.log('[Cron] Autopilot cron jobs scheduled - processing every 5 minutes, discovery on the 1st of each month');
}

// For testing: manually trigger the cron job
export async function triggerAutopilotManually() {
    console.log('[Cron] Manually triggering autopilot processing...');
    try {
        const { processDueScheduledPosts } = await import('@/actions/autopilot');
        const result = await processDueScheduledPosts();
        return result;
    } catch (error) {
        console.error('[Cron] Manual trigger failed:', error);
        throw error;
    }
}

// For testing: manually trigger the monthly discovery job
export async function triggerAutopilotDiscoveryManually() {
    console.log('[Cron] Manually triggering autopilot discovery...');
    try {
        const { runAutopilotDiscoveryAndScheduling } = await import('@/actions/autopilot');
        return await runAutopilotDiscoveryAndScheduling();
    } catch (error) {
        console.error('[Cron] Manual discovery trigger failed:', error);
        throw error;
    }
}
