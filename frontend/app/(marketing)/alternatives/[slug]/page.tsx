import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Check, X } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import { competitors, getCompetitorBySlug } from "../data"
import type { Metadata } from "next"

export function generateStaticParams() {
  return competitors.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const competitor = getCompetitorBySlug(slug)
  if (!competitor) return {}
  return {
    title: `Best ${competitor.name} Alternative in 2026 — Free | MatchMyResumes`,
    description: `${competitor.description} Compare ${competitor.name} vs MatchMyResumes to see why our free ATS scoring and AI resume optimization is better.`,
    keywords: [
      `${competitor.name} alternative`,
      `${competitor.name} vs MatchMyResumes`,
      "ATS resume checker",
      "free resume optimizer",
    ],
    alternates: {
      canonical: `https://matchmyresumes.com/alternatives/${slug}`,
    },
    openGraph: {
      title: `Best ${competitor.name} Alternative — MatchMyResumes`,
      description: `Compare features and pricing. ${competitor.name} vs MatchMyResumes.`,
      type: "website",
    },
  }
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const competitor = getCompetitorBySlug(slug)
  if (!competitor) notFound()

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
                name: "Alternatives",
                item: "https://matchmyresumes.com/alternatives",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `${competitor.name} Alternative`,
              },
            ],
          }),
        }}
      />

      {/* Nav */}
      <Navbar />

      <article className="max-w-4xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/alternatives"
            className="hover:text-white transition-colors"
          >
            Alternatives
          </Link>
          <span>/</span>
          <span className="text-gray-300">{competitor.name} Alternative</span>
        </nav>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Best <span className="gradient-text">{competitor.name}</span> Alternative
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl">
          {competitor.description}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="glass p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Competitor Pricing</p>
            <p className="text-lg font-semibold text-white">{competitor.pricing}</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-400 mb-1">MatchMyResumes Pricing</p>
            <p className="text-lg font-semibold text-white">
              Free <span className="text-sm text-emerald-400">Forever</span>
            </p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Website</p>
            <a
              href={`https://${competitor.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              {competitor.website}
            </a>
          </div>
        </div>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            Feature <span className="gradient-text">Comparison</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 font-semibold text-gray-300 bg-white/[0.02]">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-white bg-violet-500/10">
                    MatchMyResumes
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-300">
                    {competitor.shortName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitor.comparison.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-300 font-medium">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.matchMyResumes === true ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.competitor === true ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Choose MatchMyResumes */}
        <section className="mb-16 glass p-8 md:p-12 rounded-2xl border border-violet-500/30 bg-violet-500/5">
          <h2 className="text-2xl font-bold text-white mb-6">
            Why Choose <span className="gradient-text">MatchMyResumes</span>?
          </h2>
          <ul className="space-y-4">
            {[
              "Completely free — no hidden paywalls, no premium tiers",
              "Real ATS scoring based on industry-standard algorithms",
              "AI-powered resume optimization that preserves your authentic experience",
              "Instant resume vs job description matching with keyword gap analysis",
              "AI-generated cover letters in seconds",
              "No signup required to use all tools",
              "Unlimited scans and optimizations",
              "Data privacy guaranteed — your resume is never used to train AI models",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-gray-300 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your <span className="gradient-text">Resume?</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            No credit card. No signup required. Completely free.
          </p>
          <Link
            href="/ats-score-checker"
            className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg"
          >
            Get Your ATS Score Now <ArrowRight size={20} />
          </Link>
        </div>

        {/* Other Alternatives */}
        <section className="mt-20 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-8">
            Explore Other <span className="gradient-text">Alternatives</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitors
              .filter((c) => c.slug !== slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/alternatives/${other.slug}`}
                  className="group glass p-6 rounded-2xl border border-white/10 hover:border-violet-500/40 transition-all"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors mb-2">
                    {other.name} Alternative
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {other.description}
                  </p>
                  <span className="text-violet-400 text-sm font-medium group-hover:text-violet-300 transition-colors flex items-center gap-1">
                    Compare <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </article>
    </div>
  )
}
