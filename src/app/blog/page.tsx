import { BlogNavbar } from "@/components/blog/BlogNavbar";
import Link from "next/link";
import { BarChart } from "lucide-react";

// Sample blog posts data
const blogPosts = [
    {
        title: "10 Best SEO Tools for Small Businesses (2025)",
        description: "Discover the top SEO tools that help small businesses rank higher. Compare features, pricing, and find the perfect tool for your needs.",
        slug: "best-seo-tools-small-business",
        featured: true,
    },
    {
        title: "How AI Content Can Boost Your SEO Rankings",
        description: "Learn how AI-generated content can improve your search rankings while maintaining quality and authenticity.",
        slug: "ai-content-seo-rankings",
    },
    {
        title: "The Complete Guide to Keyword Research",
        description: "Master keyword research with this comprehensive guide. Find high-value keywords that drive traffic to your website.",
        slug: "keyword-research-guide",
    },
    {
        title: "On-Page SEO Best Practices for 2025",
        description: "Optimize your pages for search engines with these proven on-page SEO techniques that actually work.",
        slug: "on-page-seo-best-practices",
    },
    {
        title: "How to Create SEO-Optimized Blog Content",
        description: "Step-by-step guide to writing blog posts that rank. Learn the secrets of creating content that search engines love.",
        slug: "seo-optimized-blog-content",
    },
    {
        title: "Understanding Search Intent for Better Rankings",
        description: "Learn how to match your content with user search intent to improve your rankings and engagement.",
        slug: "understanding-search-intent",
    },
    {
        title: "Link Building Strategies That Work in 2025",
        description: "Discover effective link building techniques that boost your domain authority without risking penalties.",
        slug: "link-building-strategies",
    },
    {
        title: "Technical SEO Checklist for Beginners",
        description: "Essential technical SEO elements every website needs. Fix common issues and improve your site's performance.",
        slug: "technical-seo-checklist",
    },
    {
        title: "Local SEO: How to Rank in Your City",
        description: "Dominate local search results with these proven local SEO strategies for businesses targeting specific areas.",
        slug: "local-seo-guide",
    },
];

export default function BlogPage() {
    const featuredPost = blogPosts.find(post => post.featured);
    const regularPosts = blogPosts.filter(post => !post.featured);

    return (
        <div className="min-h-screen bg-white">
            <BlogNavbar />

            {/* Header Section */}
            <div className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Optify Blog
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Enhance your website with AI-driven, SEO-optimized content—published directly to your blog. Boost your search rankings and increase traffic effortlessly with our automated blogging solution.
                    </p>
                </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                {/* Featured Post */}
                {featuredPost && (
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="block mb-8 group"
                    >
                        <div className="bg-gray-50 rounded-2xl p-8 transition-all duration-200 hover:bg-gray-100 hover:shadow-lg">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#1DB954] transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {featuredPost.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map((post, index) => (
                        <Link
                            key={index}
                            href={`/blog/${post.slug}`}
                            className="group"
                        >
                            <div className="bg-gray-50 rounded-xl p-6 h-full transition-all duration-200 hover:bg-gray-100 hover:shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-[#1DB954] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {post.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#1DB954] p-1.5 rounded-lg">
                                <BarChart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">Optify Blog</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-sm text-gray-600 hover:text-[#1DB954] transition-colors">
                                Home
                            </Link>
                            <Link href="/blog" className="text-sm text-gray-600 hover:text-[#1DB954] transition-colors">
                                Blog
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Optify. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
