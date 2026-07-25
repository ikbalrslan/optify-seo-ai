import { BlogNavbar } from "@/components/blog/BlogNavbar";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: { slug: true, title: true, metaDescription: true },
    });
    const blogPosts = posts.map(p => ({ slug: p.slug, title: p.title, description: p.metaDescription ?? "" }));

    const featuredPost = blogPosts[0];
    const regularPosts = blogPosts.slice(1);

    return (
        <div className="min-h-screen bg-[#FAF6EF]">
            <BlogNavbar />

            {/* Header Section */}
            <div className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1C1815] mb-6">
                        Optify Blog
                    </h1>
                    <p className="text-lg md:text-xl text-[#6F675A] max-w-3xl mx-auto leading-relaxed">
                        Enhance your website with AI-driven, SEO-optimized content—published directly to your blog. Boost your search rankings and increase traffic effortlessly with our automated blogging solution.
                    </p>
                </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                {blogPosts.length === 0 && (
                    <div className="text-center py-16 text-[#9B927F]">
                        No posts published yet. Check back soon.
                    </div>
                )}
                {/* Featured Post */}
                {featuredPost && (
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="block mb-8 group"
                    >
                        <div className="bg-[#F5EFE4] rounded-2xl p-8 transition-all duration-200 hover:bg-white hover:shadow-lg border border-transparent hover:border-[#E7DFCF]">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <h2 className="text-2xl md:text-3xl font-bold text-[#1C1815] mb-4 group-hover:text-[#009E8A] transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-[#6F675A] text-lg leading-relaxed">
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
                            <div className="bg-[#F5EFE4] rounded-xl p-6 h-full transition-all duration-200 hover:bg-white hover:shadow-lg border border-transparent hover:border-[#E7DFCF]">
                                <h3 className="text-lg font-semibold text-[#1C1815] mb-3 group-hover:text-[#009E8A] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-[#6F675A] text-sm leading-relaxed line-clamp-3">
                                    {post.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#E7DFCF] py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#009E8A] p-1.5 rounded-lg">
                                <Sparkles className="w-4 h-4 text-white" strokeWidth={1.75} />
                            </div>
                            <span className="font-semibold text-[#1C1815]">Optify Blog</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-sm text-[#6F675A] hover:text-[#009E8A] transition-colors">
                                Home
                            </Link>
                            <Link href="/blog" className="text-sm text-[#6F675A] hover:text-[#009E8A] transition-colors">
                                Blog
                            </Link>
                        </div>
                        <p className="text-sm text-[#9B927F]">
                            © {new Date().getFullYear()} Optify. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
