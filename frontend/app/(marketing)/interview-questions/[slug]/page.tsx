import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/landing/Navbar"
import { interviewData, getInterviewDataBySlug } from "../data"
import type { Metadata } from "next"

export function generateStaticParams() {
  return interviewData.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = getInterviewDataBySlug(slug)
  if (!data) return {}
  return {
    title: `${data.title} Interview Questions & Answers (2026) | MatchMyResumes`,
    description: data.description,
    alternates: {
      canonical: `https://matchmyresumes.com/interview-questions/${data.slug}`,
    },
    openGraph: {
      title: `${data.title} Interview Questions & Answers (2026)`,
      description: data.description,
      type: "article",
    },
  }
}

function getRelated(currentSlug: string) {
  const current = getInterviewDataBySlug(currentSlug)
  if (!current) return []
  const same = interviewData.filter((d) => d.category === current.category && d.slug !== currentSlug)
  const others = interviewData.filter((d) => d.category !== current.category && d.slug !== currentSlug)
  return [...same, ...others].slice(0, 3)
}

export default async function InterviewQuestionsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = getInterviewDataBySlug(slug)
  if (!data) notFound()

  const related = getRelated(slug)

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
              { "@type": "ListItem", position: 2, name: "Interview Questions", item: "https://matchmyresumes.com/interview-questions" },
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
            mainEntity: [
              ...data.questions.map((q) => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: { "@type": "Answer", text: q.sampleAnswer },
              })),
              ...data.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            ],
          }),
        }}
      />

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/interview-questions" className="hover:text-white transition-colors">Interview Questions</Link>
          <span>/</span>
          <span className="text-gray-300">{data.title}</span>
        </nav>

        <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
          {data.category}
        </span>
        <h1 className="text-4xl font-bold text-white mb-4">
          {data.title} Interview Questions &amp; Answers (2026)
        </h1>
        <p className="text-gray-400 leading-relaxed mb-12 text-lg">{data.description}</p>

        {/* Interview Questions */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-6">
            Top {data.title} Interview Questions
          </h2>
          <div className="space-y-4">
            {data.questions.map((q, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/10 bg-[#111118]"
              >
                <summary className="cursor-pointer px-6 py-5 list-none flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-600 text-white text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-white font-medium leading-snug">{q.question}</span>
                  </div>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl leading-none shrink-0 mt-0.5">+</span>
                </summary>
                <div className="px-6 pb-6 pt-2 pl-[3.75rem]">
                  <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-4 mb-3">
                    <p className="text-sm font-medium text-violet-400 mb-2">Sample Answer</p>
                    <p className="text-gray-300 leading-relaxed">{q.sampleAnswer}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 text-sm font-semibold shrink-0">Tip:</span>
                    <p className="text-gray-400 text-sm leading-relaxed">{q.tip}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Behavioral Questions */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">
            Behavioral Questions to Prepare
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            Use the STAR method (Situation, Task, Action, Result) to structure your answers to these behavioral questions:
          </p>
          <ul className="space-y-3">
            {data.behavioralQuestions.map((bq, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                <span className="text-gray-300 leading-relaxed">{bq}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Interview Tips */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-5">
            {data.title} Interview Prep Tips
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
            Ready for the Interview? Polish Your Resume First.
          </h2>
          <p className="text-gray-400 mb-6">
            Get your ATS score and optimize your {data.title.toLowerCase()} resume for free — no signup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/ats-score-checker"
              className="btn-glow inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            >
              Check Your ATS Score
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
            <h2 className="text-2xl font-bold text-white mb-5">More Interview Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/interview-questions/${r.slug}`}
                  className="group glass p-5 rounded-xl border border-white/10 hover:border-violet-500/40 transition-all"
                >
                  <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors mb-1">
                    {r.title}
                  </h3>
                  <p className="text-sm text-gray-500">{r.questions.length} questions + answers</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
