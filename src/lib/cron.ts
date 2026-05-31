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

    isScheduled = true;
    console.log('[Cron] Autopilot cron job scheduled - runs every 5 minutes');
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
