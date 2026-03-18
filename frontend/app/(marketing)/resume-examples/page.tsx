import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { resumeExamples } from "./data"
import { ResumeExamplesGrid } from "./ResumeExamplesGrid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:
    "Resume Examples by Job Title — ATS-Optimized Templates (2026) | MatchMyResumes",
  description:
    "Browse 25+ ATS-optimized resume examples by job title. Each includes a professional summary, achievement bullets, key skills, and role-specific tips.",
  alternates: {
    canonical: "https://matchmyresumes.com/resume-examples",
  },
  openGraph: {
    title: "Resume Examples by Job Title — ATS-Optimized Templates (2026)",
    description:
      "Browse 25+ ATS-optimized resume examples by job title. Each includes a professional summary, achievement bullets, key skills, and role-specific tips.",
    type: "website",
  },
}

export default function ResumeExamplesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">
          Resume Examples by Job Title
        </h1>
        <p className="text-gray-400 mb-10 max-w-2xl">
          Browse ATS-optimized resume examples for 25+ job titles. Each example
          includes a professional summary, achievement-oriented bullet points,
          key skills, and role-specific tips to help you land more interviews.
        </p>

        <ResumeExamplesGrid examples={resumeExamples} />
      </div>
    </div>
  )
}
