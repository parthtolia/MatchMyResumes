import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { blogPosts } from "./posts"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog – MatchMyResumes",
  description: "Career tips, ATS optimization guides, and resume strategies to help you land more interviews.",
  alternates: { canonical: "https://matchmyresumes.com/blog" },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
        <p className="text-gray-400 mb-12">
          Career insights, ATS tips, and resume optimization strategies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-white/10 bg-[#111118] p-6 hover:border-violet-500/40 transition-all"
            >
              <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
                {post.category}
              </span>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
