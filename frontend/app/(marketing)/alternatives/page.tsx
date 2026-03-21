import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import { competitors } from "./data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resume Optimizer Alternatives — Find the Best Free Tool | MatchMyResumes",
  description:
    "Compare MatchMyResumes with ResumeWorded, Jobscan, Resume.io, and Enhancv. See why our completely free ATS scoring and AI optimization is the best choice.",
  keywords: [
    "resume optimizer alternatives",
    "best ATS checker",
    "resume tools comparison",
    "jobscan alternative",
    "resumeworded alternative",
  ],
  alternates: { canonical: "https://matchmyresumes.com/alternatives" },
  openGraph: {
    title: "Resume Tool Alternatives — MatchMyResumes",
    description:
      "Compare resume optimization tools. Find the best free alternative to Jobscan, ResumeWorded, and other resume tools.",
    type: "website",
  },
}

export default function AlternativesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-300">Alternatives</span>
        </nav>

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Resume Optimization <span className="gradient-text">Alternatives</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare MatchMyResumes with popular resume tools. Discover why thousands choose our free,
            powerful ATS scoring and AI optimization.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {competitors.map((competitor) => (
            <Link
              key={competitor.slug}
              href={`/alternatives/${competitor.slug}`}
              className="group glass p-8 rounded-2xl border border-white/10 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
                    {competitor.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{competitor.pricing}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                {competitor.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-violet-400 font-medium">
                View Comparison
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {/* Why MatchMyResumes */}
        <section className="glass p-12 rounded-2xl border border-violet-500/30 bg-violet-500/5 mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Why Choose <span className="gradient-text">MatchMyResumes</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "100% Free. Always.",
                description:
                  "No paywalls, no premium tiers, no credit card required. Every feature is completely free, forever.",
              },
              {
                title: "Real ATS Scoring",
                description:
                  "Our scoring engine simulates how real Applicant Tracking Systems parse and rank your resume.",
              },
              {
                title: "AI-Powered Optimization",
                description:
                  "Our AI enhances your resume with missing keywords and stronger language — without fabricating experience.",
              },
              {
                title: "Instant Job Matching",
                description:
                  "Match your resume against any job description and see exactly which keywords you're missing.",
              },
              {
                title: "Cover Letter Generation",
                description:
                  "Generate tailored, tone-perfect cover letters in seconds with our AI system.",
              },
              {
                title: "Privacy First",
                description:
                  "Your resume stays yours. We never share data with third parties or use it to train AI models.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Try MatchMyResumes <span className="gradient-text">for Free</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            No signup. No credit card. Just upload your resume and get started with real ATS scoring
            and AI-powered optimization in seconds.
          </p>
          <Link
            href="/ats-score-checker"
            className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg"
          >
            Get Your Free ATS Score <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}
