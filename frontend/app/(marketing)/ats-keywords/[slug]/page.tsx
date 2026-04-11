import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/landing/Navbar"
import { atsKeywordsData, getAtsKeywordsBySlug } from "../data"
import type { Metadata } from "next"

export function generateStaticParams() {
  return atsKeywordsData.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = getAtsKeywordsBySlug(slug)
  if (!data) return {}
  return {
    title: `ATS Keywords for ${data.title} Resume (2026) | MatchMyResumes`,
    description: data.description,
    keywords: [...data.hardSkills.slice(0, 8), ...data.softSkills.slice(0, 4)],
    alternates: {
      canonical: `https://matchmyresumes.com/ats-keywords/${data.slug}`,
    },
    openGraph: {
      title: `ATS Keywords for ${data.title} Resume (2026)`,
      description: data.description,
      type: "article",
    },
  }
}

function getRelated(currentSlug: string) {
  const current = getAtsKeywordsBySlug(currentSlug)
  if (!current) return []
  const same = atsKeywordsData.filter((d) => d.category === current.category && d.slug !== currentSlug)
  const others = atsKeywordsData.filter((d) => d.category !== current.category && d.slug !== currentSlug)
  return [...same, ...others].slice(0, 3)
}

export default async function AtsKeywordsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = getAtsKeywordsBySlug(slug)
  if (!data) notFound()

  const related = getRelated(slug)

  const sections = [
    { label: "Hard Skills & Technical Keywords", items: data.hardSkills, color: "violet" },
    { label: "Soft Skills & Competencies", items: data.softSkills, color: "blue" },
    { label: "Certifications & Credentials", items: data.certifications, color: "emerald" },
    { label: "Action Verbs", items: data.actionVerbs, color: "amber" },
    { label: "Job Titles to Include", items: data.jobTitles, color: "pink" },
    { label: "Industry Terms & Buzzwords", items: data.industryTerms, color: "violet" },
  ] as const

  const colorMap = {
    violet: "bg-violet-500/10 border-violet-500/30 text-violet-300",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-300",
  }

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
              { "@type": "ListItem", position: 1, name: "Home", item: "https://matchmyresumes.com" },
              { "@type": "ListItem", position: 2, name: "ATS Keywords", item: "https://matchmyresumes.com/ats-keywords" },
              { "@type": "ListItem", position: 3, name: data.title },
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
            mainEntity: data.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/ats-keywords" className="hover:text-white transition-colors">ATS Keywords</Link>
          <span>/</span>
          <span className="text-gray-300">{data.title}</span>
        </nav>

        <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
          {data.category}
        </span>
        <h1 className="text-4xl font-bold text-white mb-4">
          ATS Keywords for {data.title} Resumes (2026)
        </h1>
        <p className="text-gray-400 leading-relaxed mb-12 text-lg">{data.description}</p>

        {/* Keyword sections */}
        <div className="space-y-10 mb-14">
          {sections.map((section) => (
            <section key={section.label}>
              <h2 className="text-xl font-bold text-white mb-4">{section.label}</h2>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span
                    key={item}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colorMap[section.color]}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Tips */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-5">
            How to Use These Keywords on Your {data.title} Resume
          </h2>
          <ol className="space-y-4">
            {data.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-600 text-white text-sm font-bold shrink-0">{i + 1}</span>
                <p className="text-gray-300 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-white/10 bg-[#111118]">
                <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                  {faq.q}
                  <span className="ml-4 text-gray-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-14 glass rounded-2xl border border-violet-500/30 bg-violet-500/5 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Test These Keywords Against Your Resume
          </h2>
          <p className="text-gray-400 mb-6">
            Upload your {data.title.toLowerCase()} resume and a job description to get your ATS keyword match score — free, no signup needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/resume-job-description-match"
              className="btn-glow inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            >
              Match Resume to Job Description
            </Link>
            <Link
              href={`/resume-examples/${slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold border border-white/20 hover:border-violet-500/40 transition-colors"
            >
              View {data.title} Resume Example
            </Link>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-5">Related Keyword Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ats-keywords/${r.slug}`}
                  className="group glass p-5 rounded-xl border border-white/10 hover:border-violet-500/40 transition-all"
                >
                  <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.hardSkills.length + r.softSkills.length}+ keywords</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
