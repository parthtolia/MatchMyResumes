import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/landing/Navbar"
import { resumeExamples, getExampleBySlug } from "../data"
import type { Metadata } from "next"

export function generateStaticParams() {
  return resumeExamples.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const example = getExampleBySlug(slug)
  if (!example) return {}
  return {
    title: `${example.title} Resume Example & ATS Keywords (2026) | MatchMyResumes`,
    description: example.description,
    keywords: example.keywords,
    alternates: {
      canonical: `https://matchmyresumes.com/resume-examples/${example.slug}`,
    },
    openGraph: {
      title: `${example.title} Resume Example & ATS Keywords (2026)`,
      description: example.description,
      type: "article",
    },
  }
}

function getRelatedExamples(currentSlug: string) {
  const current = getExampleBySlug(currentSlug)
  if (!current) return []
  // Prefer same category, then fill with other examples
  const sameCategory = resumeExamples.filter(
    (e) => e.category === current.category && e.slug !== currentSlug
  )
  const others = resumeExamples.filter(
    (e) => e.category !== current.category && e.slug !== currentSlug
  )
  return [...sameCategory, ...others].slice(0, 3)
}

export default async function ResumeExamplePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const example = getExampleBySlug(slug)
  if (!example) notFound()

  const related = getRelatedExamples(slug)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                name: "Resume Examples",
                item: "https://matchmyresumes.com/resume-examples",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: example.title,
              },
            ],
          }),
        }}
      />

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: example.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />

      {/* Nav */}
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/resume-examples"
            className="hover:text-white transition-colors"
          >
            Resume Examples
          </Link>
          <span>/</span>
          <span className="text-gray-300">{example.title}</span>
        </nav>

        {/* Category badge + H1 */}
        <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
          {example.category}
        </span>
        <h1 className="text-4xl font-bold text-white mb-10">
          {example.title} Resume Example &amp; ATS Keywords (2026)
        </h1>

        {/* Professional Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Professional Summary Example
          </h2>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6">
            <p className="text-gray-300 leading-relaxed italic">
              &ldquo;{example.summary}&rdquo;
            </p>
          </div>
        </section>

        {/* Key Skills */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Key Skills</h2>
          <div className="flex flex-wrap gap-2">
            {example.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Experience Bullets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Experience Bullet Points
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Use these achievement-oriented bullet points as inspiration for your
            own {example.title.toLowerCase()} resume:
          </p>
          <ul className="space-y-3">
            {example.experienceBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                <span className="text-gray-300 leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Education & Certifications */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Education &amp; Certifications
          </h2>
          <div className="rounded-xl border border-white/10 bg-[#111118] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                Education
              </h3>
              <p className="text-gray-300">{example.education}</p>
            </div>
            {example.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Certifications
                </h3>
                <ul className="space-y-1">
                  {example.certifications.map((cert) => (
                    <li key={cert} className="text-gray-300 flex items-center gap-2">
                      <span className="text-violet-400">&#10003;</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Top ATS Keywords */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Top ATS Keywords for {example.title} Resumes
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Include these keywords naturally throughout your resume to pass
            Applicant Tracking System filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {example.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-500/10 border border-violet-500/30 text-violet-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        {/* Resume Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            {example.title} Resume Tips
          </h2>
          <ol className="space-y-4">
            {example.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-600 text-white text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-gray-300 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {example.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/10 bg-[#111118]"
              >
                <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                  {faq.q}
                  <span className="ml-4 text-gray-500 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-violet-500/30 bg-violet-500/5 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Optimize your {example.title.toLowerCase()} resume
          </h3>
          <p className="text-gray-400 mb-6">
            Get your free ATS score and AI-powered optimization suggestions
            tailored for {example.title.toLowerCase()} roles.
          </p>
          <Link
            href="/sign-up"
            className="inline-block btn-glow text-white px-8 py-3 rounded-xl font-medium"
          >
            Try MatchMyResumes Free
          </Link>
        </div>

        {/* Related Examples */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Related Resume Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/resume-examples/${r.slug}`}
                  className="group rounded-xl border border-white/10 bg-[#111118] p-5 hover:border-violet-500/40 transition-all"
                >
                  <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full mb-3">
                    {r.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
