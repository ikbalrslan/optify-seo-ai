import { NextRequest, NextResponse } from 'next/server';
import { processDueScheduledPosts } from '@/actions/autopilot';

// Secret key for protecting the cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'default-dev-secret';

/**
 * Manual trigger endpoint for autopilot cron job
 * Protected by CRON_SECRET header to prevent unauthorized access
 * 
 * Usage:
 * curl -X POST http://localhost:3000/api/cron/autopilot \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: NextRequest) {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== CRON_SECRET) {
        console.log('[API/Cron] Unauthorized access attempt');
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    console.log('[API/Cron] Manual autopilot trigger received');

    try {
        const result = await processDueScheduledPosts();

        return NextResponse.json({
            success: true,
            message: `Processed ${result.processed} scheduled posts`,
            processed: result.processed,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[API/Cron] Processing failed:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Processing failed'
            },
            { status: 500 }
        );
    }
}

// Also support GET for health checks
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'autopilot-cron',
        description: 'POST to this endpoint with CRON_SECRET to manually trigger autopilot processing'
    });
}
