// Thin wrapper around Unsplash's Search Photos API for auto-illustrating generated blog posts
// (see assembleBlogHtml in src/lib/blog-content.ts). Images are a pure enhancement, never a
// requirement - every function here degrades to null/no-op instead of throwing, so a missing
// key, a rate limit, or a network blip never breaks blog generation, it just publishes without
// that one image.

export type UnsplashImage = {
    url: string; // "regular" size - Unsplash's recommended size for in-article use
    altDescription: string;
    photographerName: string;
    photographerProfileUrl: string;
    unsplashPhotoUrl: string;
    downloadLocation: string; // must be pinged once the photo is actually used - see recordUnsplashUsage
};

let warnedMissingKey = false;

export async function searchUnsplashImage(query: string): Promise<UnsplashImage | null> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
        if (!warnedMissingKey) {
            console.warn("[Unsplash] UNSPLASH_ACCESS_KEY not configured - generated posts will publish without images.");
            warnedMissingKey = true;
        }
        return null;
    }

    try {
        const url = new URL("https://api.unsplash.com/search/photos");
        url.searchParams.set("query", query);
        url.searchParams.set("per_page", "1");
        url.searchParams.set("orientation", "landscape");
        url.searchParams.set("content_filter", "high");

        const response = await fetch(url, {
            headers: { Authorization: `Client-ID ${accessKey}` },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            console.warn(`[Unsplash] Search failed for "${query}": ${response.status}`);
            return null;
        }

        const data = await response.json();
        const photo = data.results?.[0];
        if (!photo) return null;

        // UTM params are part of Unsplash's required attribution format (unsplash.com/documentation#guidelines)
        const utm = "utm_source=optifyseo&utm_medium=referral";
        return {
            url: photo.urls.regular,
            altDescription: photo.alt_description || photo.description || query,
            photographerName: photo.user?.name ?? "Unsplash",
            photographerProfileUrl: `${photo.user?.links?.html ?? "https://unsplash.com"}?${utm}`,
            unsplashPhotoUrl: `${photo.links?.html ?? "https://unsplash.com"}?${utm}`,
            downloadLocation: photo.links?.download_location ?? "",
        };
    } catch (error) {
        console.warn(`[Unsplash] Search errored for "${query}":`, error);
        return null;
    }
}

// Unsplash's API guidelines require pinging download_location once a photo is actually used in
// a published piece of content (not just shown in search results) - best-effort, fire-and-
// forget, never blocks or fails the caller.
export function recordUnsplashUsage(downloadLocation: string): void {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey || !downloadLocation) return;
    fetch(downloadLocation, { headers: { Authorization: `Client-ID ${accessKey}` } }).catch(() => {});
}
