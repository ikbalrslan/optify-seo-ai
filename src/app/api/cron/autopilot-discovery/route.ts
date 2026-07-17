import { NextRequest, NextResponse } from 'next/server';
import { runAutopilotDiscoveryAndScheduling } from '@/actions/autopilot';

// Secret key for protecting the cron endpoint. No hardcoded fallback: if this isn't
// configured, the endpoint must reject every request rather than accept a fixed,
// publicly-known default value.
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Manual trigger endpoint for the monthly autopilot keyword-discovery job
 * Protected by CRON_SECRET header to prevent unauthorized access
 *
 * Usage: send a POST with an Authorization header of "Bearer <value of the CRON_SECRET env var>"
 */
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET || token !== CRON_SECRET) {
        console.log('[API/Cron] Unauthorized access attempt');
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    console.log('[API/Cron] Manual autopilot discovery trigger received');

    try {
        const result = await runAutopilotDiscoveryAndScheduling();

        return NextResponse.json({
            success: true,
            message: `Scheduled ${result.scheduled} post(s) across ${result.projectsProcessed} project(s)`,
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[API/Cron] Discovery failed:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Discovery failed'
            },
            { status: 500 }
        );
    }
}

// Also support GET for health checks
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'autopilot-discovery-cron',
        description: 'POST to this endpoint with CRON_SECRET to manually trigger monthly keyword discovery and auto-scheduling'
    });
}
