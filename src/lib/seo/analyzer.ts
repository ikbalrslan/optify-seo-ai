
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SeoResult {
    url: string;
    meta: {
        title: string | null;
        description: string | null;
        canonical: string | null;
    };
    headings: {
        h1: string[];
        h2: string[];
        h3: string[];
        h4: string[];
        h5: string[];
        h6: string[];
    };
    links: {
        internal: string[];
        external: string[];
    };
    files: {
        robotsTxt: boolean;
        sitemapXml: boolean;
    };
    status: number;
}

export async function analyzeUrl(url: string): Promise<SeoResult> {
    // Normalize URL
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
    }

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'SEO-Engine-Bot/1.0',
            },
            timeout: 10000
        });
        const html = response.data;
        const $ = cheerio.load(html);

        // Meta Tags
        const title = $('title').text() || $('meta[property="og:title"]').attr('content') || null;
        const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null;
        const canonical = $('link[rel="canonical"]').attr('href') || null;

        // Headings
        const headings = {
            h1: [] as string[],
            h2: [] as string[],
            h3: [] as string[],
            h4: [] as string[],
            h5: [] as string[],
            h6: [] as string[],
        };

        $('h1').each((_, el) => { headings.h1.push($(el).text().trim()); });
        $('h2').each((_, el) => { headings.h2.push($(el).text().trim()); });
        $('h3').each((_, el) => { headings.h3.push($(el).text().trim()); });
        $('h4').each((_, el) => { headings.h4.push($(el).text().trim()); });
        $('h5').each((_, el) => { headings.h5.push($(el).text().trim()); });
        $('h6').each((_, el) => { headings.h6.push($(el).text().trim()); });

        // Links
        const links = {
            internal: [] as string[],
            external: [] as string[],
        };

        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                if (href.startsWith('/') || href.includes(domain)) {
                    links.internal.push(href);
                } else if (href.startsWith('http')) {
                    links.external.push(href);
                }
            }
        });

        // Check Robots.txt and Sitemap (Simple presence check)
        // Note: This requires separate requests, we'll do them in parallel
        const domain = new URL(targetUrl).origin;
        const [robotsRes, sitemapRes] = await Promise.allSettled([
            axios.head(`${domain}/robots.txt`, { timeout: 5000 }),
            axios.head(`${domain}/sitemap.xml`, { timeout: 5000 })
        ]);

        return {
            url: targetUrl,
            meta: {
                title,
                description,
                canonical,
            },
            headings,
            links,
            files: {
                robotsTxt: robotsRes.status === 'fulfilled' && robotsRes.value.status === 200,
                sitemapXml: sitemapRes.status === 'fulfilled' && sitemapRes.value.status === 200,
            },
            status: response.status,
        };

    } catch (error: any) {
        console.error("Analysis Error:", error.message);
        throw new Error(`Failed to analyze ${targetUrl}: ${error.message}`);
    }
}
