import axios from 'axios';

export interface RelatedQuery {
    query: string;
    value: string; // e.g. "+250%", "Breakout", or a relative popularity score
    extractedValue: number; // numeric form (5000 = Google's "Breakout" sentinel for rising queries)
}

export interface TopRisingQueries {
    top: RelatedQuery[];
    rising: RelatedQuery[];
}

type FetchResult =
    | { success: true; data: TopRisingQueries }
    | { success: false; error: string };

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;

function describeError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            return "SerpApi timed out. Please try again.";
        }
        if (error.response) {
            return `SerpApi request failed (${error.response.status}). Please try again shortly.`;
        }
    }
    return "Could not reach SerpApi. Please try again.";
}

// Timeouts and connection failures are worth one retry (SerpApi/Google Trends is occasionally
// slow, not usually actually down) - a 4xx/5xx response with a real status code won't be fixed
// by retrying immediately, so only network-level failures get the extra attempt.
function isRetryable(error: unknown): boolean {
    return axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || !error.response);
}

export async function fetchTopRisingQueries(
    seedKeyword: string,
    country: string,
    period: string = 'today 1-m'
): Promise<FetchResult> {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        return { success: false, error: "Missing API Key. Please configure SERPAPI_KEY." };
    }

    const endpoint = 'https://serpapi.com/search.json';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const response = await axios.get(endpoint, {
                params: {
                    engine: 'google_trends',
                    data_type: 'RELATED_QUERIES',
                    q: seedKeyword,
                    geo: country,
                    date: period,
                    api_key: apiKey,
                },
                timeout: 20000,
            });

            const related = response.data.related_queries;
            if (!related) {
                return { success: true, data: { top: [], rising: [] } };
            }

            const mapEntry = (entry: any): RelatedQuery => ({
                query: entry.query,
                value: String(entry.value),
                extractedValue: entry.extracted_value ?? 0,
            });

            return {
                success: true,
                data: {
                    top: (related.top ?? []).map(mapEntry),
                    rising: (related.rising ?? []).map(mapEntry),
                },
            };
        } catch (error) {
            console.warn(`SerpApi Google Trends request failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, error);

            if (attempt < MAX_ATTEMPTS && isRetryable(error)) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                continue;
            }

            return { success: false, error: describeError(error) };
        }
    }

    // Unreachable (the loop always returns), kept for TypeScript's control-flow analysis.
    return { success: false, error: "Could not reach SerpApi. Please try again." };
}
