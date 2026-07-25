import { BlogNavbar } from "@/components/blog/BlogNavbar";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function BlogPostPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const post = await prisma.blogPost.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { title: true, metaDescription: true, content: true },
    });

    if (!post) {
        return (
            <div className="min-h-screen bg-[#FAF6EF]">
                <BlogNavbar />
                <div className="pt-24 pb-12 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl font-bold text-[#1C1815] mb-4">Post Not Found</h1>
                        <p className="text-[#6F675A] mb-8">The blog post you're looking for doesn't exist.</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-[#009E8A] hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF6EF]">
            <BlogNavbar />

            {/* Article Header */}
            <div className="pt-24 pb-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[#6F675A] hover:text-[#009E8A] transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1C1815] mb-4">
                        {post.title}
                    </h1>
                    <p className="text-lg text-[#6F675A]">
                        {post.metaDescription}
                    </p>
                </div>
            </div>

            {/* Article Content */}
            <article className="px-4 pb-20">
                <div
                    className="max-w-3xl mx-auto prose prose-lg prose-headings:font-bold prose-headings:text-[#1C1815] prose-p:text-[#3A342C] prose-a:text-[#009E8A]"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>

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
