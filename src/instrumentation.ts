/**
 * Next.js Instrumentation file
 * This runs when the server starts and is used to initialize background jobs
 * 
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
    // Only run on server-side (Node.js runtime), not Edge
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[Instrumentation] Server starting - initializing cron jobs...');

        // Dynamically import to avoid bundling issues
        const { startAutopilotCron } = await import('./lib/cron');
        startAutopilotCron();
    }
}
