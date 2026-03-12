import type { Metadata } from "next"
import ResumeTemplatesPage from "@/components/templates/ResumeTemplatesPage"

export const metadata: Metadata = {
  title: "Free ATS Resume Templates 2026 | ATS-Friendly Resume Format – MatchMyResumes",
  description:
    "Download free ATS-friendly resume templates that pass Applicant Tracking Systems. Professional, modern, tech, and fresher resume formats in DOCX & PDF. Tested for 98%+ ATS compatibility.",
  keywords: [
    "ATS resume template",
    "free ATS resume template",
    "ATS friendly resume format",
    "ATS compatible resume",
    "resume template free download",
    "professional resume template",
    "modern resume template",
    "tech resume template",
    "fresher resume template",
    "executive resume template",
    "ATS optimized resume",
    "applicant tracking system resume",
  ],
  openGraph: {
    title: "Free ATS Resume Templates – MatchMyResumes",
    description:
      "Download free, ATS-optimized resume templates. Professionally designed, tested against major ATS systems. DOCX & PDF formats.",
    type: "website",
    siteName: "MatchMyResumes",
    url: "https://matchmyresumes.com/resume-templates",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Resume Templates – MatchMyResumes",
    description:
      "Download free, ATS-optimized resume templates tested for 98%+ compatibility.",
  },
  alternates: {
    canonical: "https://matchmyresumes.com/resume-templates",
  },
}

export default function Page() {
  return <ResumeTemplatesPage />
}
