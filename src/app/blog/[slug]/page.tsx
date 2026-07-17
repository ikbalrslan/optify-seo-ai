import { BlogNavbar } from "@/components/blog/BlogNavbar";
import Link from "next/link";
import { ArrowLeft, BarChart } from "lucide-react";
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
            <div className="min-h-screen bg-white">
                <BlogNavbar />
                <div className="pt-24 pb-12 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                        <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-[#1DB954] hover:underline"
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
        <div className="min-h-screen bg-white">
            <BlogNavbar />

            {/* Article Header */}
            <div className="pt-24 pb-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1DB954] transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {post.title}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {post.metaDescription}
                    </p>
                </div>
            </div>

            {/* Article Content */}
            <article className="px-4 pb-20">
                <div
                    className="max-w-3xl mx-auto prose prose-lg prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-[#1DB954]"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>

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
