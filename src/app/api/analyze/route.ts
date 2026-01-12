
import { NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/seo/analyzer';
import { runLighthouse } from '@/lib/seo/lighthouse';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const [analysisResult, lighthouseResult] = await Promise.all([
            analyzeUrl(url),
            runLighthouse(url)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                ...analysisResult,
                lighthouse: lighthouseResult
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
