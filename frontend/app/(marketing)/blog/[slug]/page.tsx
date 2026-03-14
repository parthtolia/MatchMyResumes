import Link from "next/link"
import { notFound } from "next/navigation"
import { Logo } from "@/components/ui/Logo"
import { BlogPostingJsonLd } from "@/components/JsonLd"
import { blogPosts, getPostBySlug } from "../posts"
import type { Metadata } from "next"

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} – MatchMyResumes Blog`,
    description: post.description,
    alternates: { canonical: `https://matchmyresumes.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: ["MatchMyResumes"],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <BlogPostingJsonLd post={post} />
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/blog"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Blog
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-4xl font-bold text-white mb-3">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:ml-6 [&_li]:mb-1 [&_strong]:text-white [&_a]:text-violet-400 [&_a:hover]:text-violet-300 [&_blockquote]:border-l-2 [&_blockquote]:border-violet-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400">
          <BlogContent content={post.content} />
        </div>

        <div className="mt-16 p-8 rounded-2xl border border-violet-500/30 bg-violet-500/5 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to optimize your resume?
          </h3>
          <p className="text-gray-400 mb-6">
            Get your free ATS score and AI-powered optimization suggestions.
          </p>
          <Link
            href="/sign-up"
            className="inline-block btn-glow text-white px-8 py-3 rounded-xl font-medium"
          >
            Try MatchMyResumes Free
          </Link>
        </div>
      </article>
    </div>
  )
}

function BlogContent({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>)
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>)
    } else if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`}>
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ul>
      )
      continue
    } else if (line.startsWith("1. ") || /^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal ml-6 mb-4">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ol>
      )
      continue
    } else if (line.trim() === "") {
      // skip empty lines
    } else {
      elements.push(
        <p key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      )
    }
    i++
  }

  return <>{elements}</>
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm">$1</code>')
}
