import Link from "next/link"
import Navbar from "@/components/landing/Navbar"
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
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Resume Examples by Job Title
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Browse ATS-optimized resume examples for 25+ job titles. Each example
            includes a professional summary, achievement-oriented bullet points,
            key skills, and role-specific tips to help you land more interviews.
          </p>
        </div>

        <ResumeExamplesGrid examples={resumeExamples} />
      </div>
    </div>
  )
}
