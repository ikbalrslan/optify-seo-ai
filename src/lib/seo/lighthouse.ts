
import axios from 'axios';

export interface LighthouseResult {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
}

export async function runLighthouse(url: string): Promise<LighthouseResult | null> {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    // If no API key, we might hit limits or it might not work. 
    // Public usage without key is limited.

    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO${apiKey ? `&key=${apiKey}` : ''}`;

    try {
        const response = await axios.get(endpoint, { timeout: 20000 });
        const data = response.data;

        // Scores are 0-1. We convert to 0-100.
        return {
            performance: Math.round(data.lighthouseResult.categories.performance.score * 100),
            accessibility: Math.round(data.lighthouseResult.categories.accessibility.score * 100),
            bestPractices: Math.round(data.lighthouseResult.categories['best-practices'].score * 100),
            seo: Math.round(data.lighthouseResult.categories.seo.score * 100),
        };
    } catch (error) {
        console.warn("Lighthouse API failed:", error);
        return null;
    }
}
