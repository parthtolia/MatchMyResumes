import Link from "next/link"
import Navbar from "@/components/landing/Navbar"
import { coverLetterExamples } from "./data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:
    "Cover Letter Examples by Job Title — AI-Powered Templates (2026) | MatchMyResumes",
  description:
    "Browse 15+ professional cover letter examples organized by job title. Each example includes key phrases, expert tips, and FAQs to help you write the perfect cover letter.",
  alternates: {
    canonical: "https://matchmyresumes.com/cover-letter-examples",
  },
  openGraph: {
    title: "Cover Letter Examples by Job Title | MatchMyResumes",
    description:
      "Browse professional cover letter examples for every role. Includes key phrases, tips, and FAQs.",
    type: "website",
  },
}

export default function CoverLetterExamplesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cover Letter Examples by Job Title
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional cover letter examples with expert tips, key phrases,
            and FAQs — tailored for 15 popular roles across every industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverLetterExamples.map((example) => (
            <Link
              key={example.slug}
              href={`/cover-letter-examples/${example.slug}`}
              className="group rounded-2xl border border-white/10 bg-[#111118] p-6 hover:border-violet-500/40 transition-all"
            >
              <span className="inline-block text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
                {example.category}
              </span>
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                {example.title} Cover Letter
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {example.description}
              </p>
              <span className="text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                View Example &rarr;
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl border border-violet-500/30 bg-violet-500/5 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Need a cover letter tailored to your resume?
          </h2>
          <p className="text-gray-400 mb-6">
            Our AI analyzes your resume and job description to generate a
            personalized cover letter in seconds.
          </p>
          <Link
            href="/sign-up"
            className="inline-block btn-glow text-white px-8 py-3 rounded-xl font-medium"
          >
            Generate Your Cover Letter Free
          </Link>
        </div>
      </div>
    </div>
  )
}
