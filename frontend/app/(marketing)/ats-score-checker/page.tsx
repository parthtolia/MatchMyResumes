import type { Metadata } from "next"
import {
  ToolPageShell,
  FeatureStrip,
  ToolHero,
  ProgressBar,
  HowItWorksSection,
  FaqSection,
  CtaSection,
} from "@/components/marketing/ToolPageSections"
import AtsScoreToolSection from "@/components/marketing/tools/AtsScoreToolSection"

export const metadata: Metadata = {
  title: "Free ATS Resume Score Checker — Check ATS Compatibility | MatchMyResumes",
  description:
    "Upload your resume and get a free ATS compatibility score instantly. Detailed 0-100 breakdown across 5 dimensions — sections, formatting, quantification, content density, and contact info.",
  keywords: [
    "ATS score checker",
    "ATS resume score",
    "resume ATS compatibility",
    "resume scanner",
    "ATS resume checker free",
    "applicant tracking system score",
    "resume score checker",
    "free resume checker",
  ],
  alternates: { canonical: "https://matchmyresumes.com/ats-score-checker" },
  openGraph: {
    title: "Free ATS Resume Score Checker | MatchMyResumes",
    description: "Upload your resume and get an instant ATS score — 5-dimension breakdown with actionable tips, completely free.",
    url: "https://matchmyresumes.com/ats-score-checker",
    type: "website",
  },
}

const faqs = [
  {
    q: "What is an ATS score?",
    a: "An ATS (Applicant Tracking System) score measures how well your resume is structured for automated screening software. A higher score means your resume is more likely to be parsed correctly and pass through ATS filters to reach a human recruiter.",
  },
  {
    q: "Do I need a job description to check my ATS score?",
    a: "No! Our ATS Score Checker evaluates your resume's general ATS compatibility — formatting, section structure, content density, and quantified achievements. For job-specific matching, use our free JD Match tool.",
  },
  {
    q: "What are the 5 scoring dimensions?",
    a: "We analyze your resume across Section Completeness (30% — required sections like Experience, Education, Skills), ATS Formatting (25% — clean, parseable structure), Quantification (20% — measurable achievements with numbers and metrics), Content Density (15% — action verbs, technical skills depth), and Contact Information (10% — email, phone, LinkedIn, GitHub).",
  },
  {
    q: "What score should I aim for?",
    a: "A score of 75+ is generally considered good. Scores above 85 significantly improve your chances of passing ATS filters. Our tool provides specific tips to help you improve each dimension.",
  },
  {
    q: "What file formats are supported?",
    a: "We support PDF and DOCX resume uploads. For best results, use a clean single-column PDF without complex tables, headers/footers, or embedded graphics.",
  },
  {
    q: "Is the ATS Score Checker really free?",
    a: "Yes! You can check your ATS score unlimited times, completely free. No credit card required, no hidden limits.",
  },
]

function AtsPreviewDemo() {
  return (
    <div className="space-y-6">
      {/* Mock score demo */}
      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width={120} height={120} className="-rotate-90">
              <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
              <circle
                cx={60} cy={60} r={50} fill="none"
                stroke="url(#demoGrad)" strokeWidth={8} strokeLinecap="round"
                strokeDasharray={314} strokeDashoffset={314 - (87 / 100) * 314}
              />
              <defs>
                <linearGradient id="demoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6c5ce7" />
                  <stop offset="100%" stopColor="#00b894" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">87</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <ProgressBar label="Section Completeness" value={100} color="bg-emerald-500" />
            <ProgressBar label="ATS Formatting" value={92} color="bg-emerald-500" />
            <ProgressBar label="Quantification" value={78} color="bg-amber-500" />
            <ProgressBar label="Content Density" value={85} color="bg-violet-500" />
            <ProgressBar label="Contact Info" value={70} color="bg-blue-500" />
          </div>
        </div>
      </div>

      {/* Urgency stat */}
      <div className="glass p-4 rounded-xl border border-red-500/10 bg-red-500/[0.03]">
        <p className="text-sm text-gray-300">
          <span className="text-red-400 font-semibold">90% of resumes</span> are rejected by ATS filters before a human ever sees them. Know your score before you apply.
        </p>
      </div>

      {/* Quick benefits */}
      <div className="space-y-2">
        {[
          "Instant 5-dimension breakdown",
          "Actionable tips to improve each area",
          "Same scoring engine used by our dashboard",
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AtsScoreCheckerPage() {
  return (
    <ToolPageShell>
      <FeatureStrip active="/ats-score-checker" />

      <ToolHero
        headline="Get Your Resume ATS Score"
        headlineAccent="in 10 Seconds"
        hook="90% of resumes fail ATS filters before a recruiter sees them."
        trustItems={["No signup required", "Completely free", "Unlimited scans", "PDF & DOCX"]}
      />

      <AtsScoreToolSection
        preview={<AtsPreviewDemo />}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Upload Your Resume",
            desc: "Upload your PDF or DOCX resume. Our parser extracts and structures all sections, skills, and experience.",
          },
          {
            num: "02",
            title: "Get 5-Dimension Breakdown",
            desc: "Receive a detailed score across Section Completeness, ATS Formatting, Quantification, Content Density, and Contact Information.",
          },
          {
            num: "03",
            title: "Improve & Resubmit",
            desc: "Follow our actionable tips to optimize each dimension. Re-upload to track your improvement.",
          },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CtaSection
        title="Ready to Beat the"
        titleAccent="ATS?"
        subtitle="Upload your resume and get your score in seconds. Free, instant, unlimited."
        ctaText="Check Your ATS Score Now"
        ctaHref="#tool"
      />
    </ToolPageShell>
  )
}
