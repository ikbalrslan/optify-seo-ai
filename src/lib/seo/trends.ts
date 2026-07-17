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

export async function fetchTopRisingQueries(seedKeyword: string, country: string, period: string = 'today 1-m'): Promise<TopRisingQueries | null> {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        throw new Error("Missing API Key. Please configure SERPAPI_KEY.");
    }

    const endpoint = 'https://serpapi.com/search.json';

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
            return { top: [], rising: [] };
        }

        const mapEntry = (entry: any): RelatedQuery => ({
            query: entry.query,
            value: String(entry.value),
            extractedValue: entry.extracted_value ?? 0,
        });

        return {
            top: (related.top ?? []).map(mapEntry),
            rising: (related.rising ?? []).map(mapEntry),
        };
    } catch (error) {
        console.warn("SerpApi Google Trends request failed:", error);
        return null;
    }
}
