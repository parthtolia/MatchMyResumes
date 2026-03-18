import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/landing/Navbar"
import { coverLetterExamples, getCoverLetterBySlug } from "../data"
import type { Metadata } from "next"

export function generateStaticParams() {
  return coverLetterExamples.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const example = getCoverLetterBySlug(slug)
  if (!example) return {}
  return {
    title: `${example.title} Cover Letter Example (2026) | MatchMyResumes`,
    description: example.description,
    alternates: {
      canonical: `https://matchmyresumes.com/cover-letter-examples/${example.slug}`,
    },
    openGraph: {
      title: `${example.title} Cover Letter Example`,
      description: example.description,
      type: "article",
    },
  }
}

function getRelatedExamples(currentSlug: string) {
  const current = getCoverLetterBySlug(currentSlug)
  if (!current) return []
  const sameCategory = coverLetterExamples.filter(
    (e) => e.category === current.category && e.slug !== currentSlug
  )
  const others = coverLetterExamples.filter(
    (e) => e.category !== current.category && e.slug !== currentSlug
  )
  return [...sameCategory, ...others].slice(0, 3)
}

export default async function CoverLetterExamplePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const example = getCoverLetterBySlug(slug)
  if (!example) notFound()

  const related = getRelatedExamples(slug)

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://matchmyresumes.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cover Letter Examples",
        item: "https://matchmyresumes.com/cover-letter-examples",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: example.title,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link
            href="/"
            className="hover:text-gray-300 transition-colors"
          >
            Home
          </Link>
          <span>&rsaquo;</span>
          <Link
            href="/cover-letter-examples"
            className="hover:text-gray-300 transition-colors"
          >
            Cover Letter Examples
          </Link>
          <span>&rsaquo;</span>
          <span className="text-gray-400">{example.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
            {example.category}
          </span>
          <h1 className="text-4xl font-bold text-white mb-3">
            {example.title} Cover Letter Example (2026)
          </h1>
          <p className="text-gray-400 leading-relaxed">
            {example.description}
          </p>
        </div>

        {/* Example Letter */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">
            Full Cover Letter Example
          </h2>
          <div className="rounded-2xl border border-white/5 bg-[#111118]/80 backdrop-blur-sm p-8 space-y-5">
            <p className="text-gray-300 leading-relaxed">
              Dear Hiring Manager,
            </p>
            <p className="text-gray-300 leading-relaxed">
              {example.openingParagraph}
            </p>
            <p className="text-gray-300 leading-relaxed">
              {example.bodyParagraph}
            </p>
            <p className="text-gray-300 leading-relaxed">
              {example.closingParagraph}
            </p>
            <div className="pt-2">
              <p className="text-gray-300">Sincerely,</p>
              <p className="text-gray-400 italic">[Your Name]</p>
            </div>
          </div>
        </section>

        {/* Key Phrases */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">
            Key Phrases to Include
          </h2>
          <div className="flex flex-wrap gap-2">
            {example.keyPhrases.map((phrase) => (
              <span
                key={phrase}
                className="inline-block text-sm font-medium text-violet-300 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full"
              >
                {phrase}
              </span>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tips for Writing a {example.title} Cover Letter
          </h2>
          <ol className="space-y-3">
            {example.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-gray-300 leading-relaxed">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {example.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/10 bg-[#111118] overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-4 text-white font-medium flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mb-14 p-8 rounded-2xl border border-violet-500/30 bg-violet-500/5 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Generate a tailored {example.title} cover letter with AI
          </h3>
          <p className="text-gray-400 mb-6">
            Upload your resume and paste the job description — our AI writes a
            personalized cover letter in seconds.
          </p>
          <Link
            href="/sign-up"
            className="inline-block btn-glow text-white px-8 py-3 rounded-xl font-medium"
          >
            Try MatchMyResumes Free
          </Link>
        </div>

        {/* Related Examples */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            More Cover Letter Examples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/cover-letter-examples/${rel.slug}`}
                className="group rounded-xl border border-white/10 bg-[#111118] p-5 hover:border-violet-500/40 transition-all"
              >
                <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full mb-3">
                  {rel.category}
                </span>
                <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition-colors">
                  {rel.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  )
}
