import { slugify } from "@/lib/slug";
import { searchUnsplashImage, recordUnsplashUsage, type UnsplashImage } from "@/lib/unsplash";

// The subset of generateBlogContent's parsed output this module needs - kept structural rather
// than importing GeneratorResponseSchema's inferred type, so this stays usable from anywhere
// without pulling in the full generation action.
export type AssemblableSection = { h2: string; content: string; image_query?: string };
export type AssemblableBlog = {
    sections: AssemblableSection[];
    hero_image_query?: string;
    faq?: { question: string; answer: string }[];
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Slugify each H2 into a stable anchor id, de-duplicating (e.g. two sections both titled
// "Conclusion") so every TOC link actually lands on the right section instead of colliding.
function uniqueHeadingIds(sections: AssemblableSection[]): string[] {
    const seen = new Map<string, number>();
    return sections.map(s => {
        const base = slugify(s.h2) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count === 0 ? base : `${base}-${count}`;
    });
}

function renderFigure(image: UnsplashImage): string {
    // Fire-and-forget per Unsplash's API guidelines - the photo is genuinely being used in
    // published content now, not just previewed.
    recordUnsplashUsage(image.downloadLocation);
    return `<figure class="blog-image"><img src="${image.url}" alt="${escapeHtml(image.altDescription)}" loading="lazy" />`
        + `<figcaption>Photo by <a href="${image.photographerProfileUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(image.photographerName)}</a>`
        + ` on <a href="${image.unsplashPhotoUrl}" target="_blank" rel="noopener noreferrer">Unsplash</a></figcaption></figure>`;
}

/**
 * Turns a generated blog's structured sections into the single final HTML string that gets
 * persisted/published - the one place this happens, replacing what used to be three separately
 * duplicated `sections.map(s => \`<h2>${s.h2}</h2>${s.content}\`).join("")` call sites.
 *
 * Adds, on top of the plain heading+content that used to be all there was:
 * - stable anchor ids on every H2, plus a table of contents linking to them (skipped for very
 *   short posts - a TOC over 1-2 sections is just noise)
 * - a hero image and one image per section, resolved from Unsplash via each *_image_query the
 *   model provided - any query that fails to resolve (missing key, no results, rate limit) is
 *   silently skipped rather than leaving a broken image or blocking the whole post
 * - an FAQ block, if the model produced one
 */
export async function assembleBlogHtml(generated: AssemblableBlog): Promise<string> {
    const ids = uniqueHeadingIds(generated.sections);

    const [heroImage, ...sectionImages] = await Promise.all([
        generated.hero_image_query ? searchUnsplashImage(generated.hero_image_query) : Promise.resolve(null),
        ...generated.sections.map(s => (s.image_query ? searchUnsplashImage(s.image_query) : Promise.resolve(null))),
    ]);

    const heroHtml = heroImage ? renderFigure(heroImage) : "";

    const tocHtml = generated.sections.length > 2
        ? `<nav class="toc" aria-label="Table of contents"><p class="toc-title">Table of Contents</p><ul>`
            + generated.sections.map((s, i) => `<li><a href="#${ids[i]}">${escapeHtml(s.h2)}</a></li>`).join("")
            + `</ul></nav>`
        : "";

    const sectionsHtml = generated.sections
        .map((s, i) => {
            const imageHtml = sectionImages[i] ? renderFigure(sectionImages[i]!) : "";
            return `<h2 id="${ids[i]}">${escapeHtml(s.h2)}</h2>${imageHtml}${s.content}`;
        })
        .join("");

    const faqHtml = generated.faq?.length
        ? `<h2 id="faq">Frequently Asked Questions</h2>`
            + generated.faq.map(f => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`).join("")
        : "";

    return `${heroHtml}${tocHtml}${sectionsHtml}${faqHtml}`;
}
