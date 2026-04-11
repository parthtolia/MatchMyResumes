import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import { interviewData } from "./data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interview Questions by Job Title (2026) | MatchMyResumes",
  description:
    "Prepare for your next interview with role-specific questions and expert sample answers. Browse 30+ job titles with tailored interview prep guides.",
  keywords: [
    "interview questions by job title",
    "job interview preparation",
    "common interview questions",
    "interview questions and answers",
    "how to prepare for a job interview",
  ],
  alternates: { canonical: "https://matchmyresumes.com/interview-questions" },
  openGraph: {
    title: "Interview Questions by Job Title — MatchMyResumes",
    description:
      "Role-specific interview questions with sample answers for 30+ job titles. Get interview-ready in 2026.",
    type: "website",
  },
}

const categories = Array.from(new Set(interviewData.map((d) => d.category))).sort()

export default function InterviewQuestionsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-300">Interview Questions</span>
        </nav>

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interview Questions <span className="gradient-text">by Job Title</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Role-specific interview questions with expert sample answers, behavioral prep, and insider tips for 30+ job titles.
          </p>
        </div>

        {/* Cards by category */}
        {categories.map((category) => {
          const roles = interviewData.filter((d) => d.category === category)
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
                    href={`/interview-questions/${role.slug}`}
                    className="group glass p-5 rounded-xl border border-white/10 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors leading-snug">
                        {role.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2 mt-0.5" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {role.questions.length} questions + sample answers
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
            Polish Your Resume <span className="gradient-text">Before the Interview</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            A great interview answer won't compensate for a weak resume. Get your ATS score and optimize your resume for free.
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
