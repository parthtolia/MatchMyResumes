import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import { atsKeywordsData } from "./data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ATS Keywords by Job Title (2026) | MatchMyResumes",
  description:
    "Find the exact ATS keywords for your job title. Browse 20+ role-specific keyword lists covering hard skills, soft skills, certifications, and action verbs.",
  keywords: [
    "ATS keywords by job title",
    "resume keywords",
    "ATS optimization keywords",
    "keywords for resume",
    "ATS resume keywords 2026",
  ],
  alternates: { canonical: "https://matchmyresumes.com/ats-keywords" },
  openGraph: {
    title: "ATS Keywords by Job Title — MatchMyResumes",
    description:
      "Role-specific ATS keyword lists for 20+ job titles. Optimize your resume to pass applicant tracking systems in 2026.",
    type: "website",
  },
}

const categories = Array.from(new Set(atsKeywordsData.map((d) => d.category))).sort()

export default function AtsKeywordsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-300">ATS Keywords</span>
        </nav>

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ATS Keywords <span className="gradient-text">by Job Title</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Role-specific keyword lists covering hard skills, certifications, action verbs, and industry terms — optimized for applicant tracking systems in 2026.
          </p>
        </div>

        {/* How ATS keywords work */}
        <div className="glass rounded-2xl border border-white/10 p-8 mb-14">
          <h2 className="text-xl font-bold text-white mb-3">How ATS Keyword Matching Works</h2>
          <p className="text-gray-400 leading-relaxed">
            Applicant Tracking Systems scan your resume for keywords that match the job description. Resumes that hit a minimum keyword match threshold are shown to recruiters — those that don't are filtered out automatically. Including the right keywords in the right context (not just a keyword dump) is the single most impactful resume optimization you can make.
          </p>
        </div>

        {/* Cards by category */}
        {categories.map((category) => {
          const roles = atsKeywordsData.filter((d) => d.category === category)
          return (
            <div key={category} className="mb-14">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                <span className="w-2 h-6 rounded-full bg-violet-500 inline-block" />
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Link
                    key={role.slug}
                    href={`/ats-keywords/${role.slug}`}
                    className="group glass p-5 rounded-xl border border-white/10 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors leading-snug">
                        {role.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2 mt-0.5" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {role.hardSkills.length + role.softSkills.length}+ keywords
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <div className="text-center py-12 mt-8 glass rounded-2xl border border-violet-500/30 bg-violet-500/5 px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Test These Keywords <span className="gradient-text">Against Your Resume</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Upload your resume and a job description to see exactly which keywords you&apos;re missing and your ATS match score — free, no signup required.
          </p>
          <Link
            href="/resume-job-description-match"
            className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg"
          >
            Match Resume to Job Description <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}
