import type { Metadata } from "next"
import {
  ToolPageShell,
  HeroSection,
  ExplainerSection,
  HowItWorksSection,
  MockPreviewCard,
  ProgressBar,
  BenefitsSection,
  FaqSection,
  CtaSection,
} from "@/components/marketing/ToolPageSections"
import AtsScoreToolSection from "@/components/marketing/tools/AtsScoreToolSection"

export const metadata: Metadata = {
  title: "Free ATS Resume Score Checker — Check ATS Compatibility | MatchMyResumes",
  description:
    "Upload your resume and get a free ATS compatibility score instantly. Detailed 0-100 breakdown across formatting, sections, keywords, and quantification — no job description needed.",
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
    description: "Upload your resume and get an instant ATS score — 4-dimension breakdown with actionable tips, completely free.",
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
    a: "No! Our ATS Score Checker evaluates your resume's general ATS compatibility — formatting, section structure, keyword richness, and quantified achievements. For job-specific matching, use our free JD Match tool.",
  },
  {
    q: "What are the 4 scoring dimensions?",
    a: "We analyze your resume across ATS Formatting (clean, parseable structure), Section Completeness (required sections like Experience, Education, Skills), Keyword Richness (density of relevant skill and technology terms), and Quantification (measurable achievements with numbers and metrics).",
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

export default function AtsScoreCheckerPage() {
  return (
    <ToolPageShell>
      <HeroSection
        badge="Free ATS Resume Scanner"
        title="Check Your Resume"
        titleAccent="ATS Score Instantly"
        subtitle="Upload your resume and get a detailed 0-100 ATS compatibility score with actionable improvement tips — no job description required."
        compact
      />

      <AtsScoreToolSection />

      <ExplainerSection
        title="What is an"
        titleAccent="ATS Score?"
        paragraphs={[
          "Over 99% of Fortune 500 companies use Applicant Tracking Systems (ATS) to automatically screen resumes before a human recruiter ever sees them. If your resume isn't optimized for these systems, it gets filtered out — regardless of how qualified you are.",
          "An ATS score quantifies how well your resume is structured for these automated gatekeepers: proper formatting, complete sections, relevant keywords, and measurable achievements. Even before matching to a specific job, your resume needs to be ATS-friendly to get through.",
          "Our ATS Score Checker analyzes your resume across 4 critical dimensions and gives you a clear 0-100 score with specific, actionable tips to improve each area. Just upload your resume — no job description needed.",
        ]}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Upload Your Resume",
            desc: "Upload your PDF or DOCX resume. Our parser automatically extracts and structures all sections, skills, and experience details.",
          },
          {
            num: "02",
            title: "Get 4-Dimension Breakdown",
            desc: "Receive a detailed score across ATS Formatting, Section Completeness, Keyword Richness, and Quantification — each scored 0-100.",
          },
          {
            num: "03",
            title: "Improve & Resubmit",
            desc: "Follow our actionable tips to optimize each dimension. Re-upload to track your improvement and aim for a score above 85.",
          },
        ]}
      />

      <MockPreviewCard>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative">
              <svg width={160} height={160} className="-rotate-90">
                <circle cx={80} cy={80} r={68} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
                <circle
                  cx={80} cy={80} r={68} fill="none"
                  stroke="url(#atsGrad)" strokeWidth={10} strokeLinecap="round"
                  strokeDasharray={427} strokeDashoffset={427 - (87 / 100) * 427}
                />
                <defs>
                  <linearGradient id="atsGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6c5ce7" />
                    <stop offset="100%" stopColor="#00b894" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">87</span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <span className="text-sm font-medium text-emerald-400">Great Score!</span>
          </div>

          <div className="flex-1 w-full space-y-4">
            <ProgressBar label="ATS Formatting" value={92} color="bg-emerald-500" />
            <ProgressBar label="Section Completeness" value={88} color="bg-violet-500" />
            <ProgressBar label="Keyword Richness" value={85} color="bg-blue-500" />
            <ProgressBar label="Quantification" value={78} color="bg-amber-500" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-sm font-semibold text-white mb-3">Improvement Tips</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <p>&#x2022; Add 2-3 more quantified achievements (e.g., &quot;Increased revenue by 30%&quot;) to boost your Quantification score.</p>
            <p>&#x2022; Your formatting is excellent — clean single-column layout detected.</p>
            <p>&#x2022; Consider adding a &quot;Technical Skills&quot; section for better keyword density.</p>
          </div>
        </div>
      </MockPreviewCard>

      <BenefitsSection
        title="Why Use Our"
        titleAccent="ATS Checker?"
        benefits={[
          { text: "Just upload your resume — no job description required" },
          { text: "Instant feedback — get your score in under 10 seconds" },
          { text: "4-dimension analysis covers everything ATS systems evaluate" },
          { text: "Actionable tips tell you exactly what to fix and how" },
          { text: "Completely free — unlimited scans, no credit card required" },
          { text: "Supports PDF and DOCX formats for maximum compatibility" },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CtaSection
        title="Ready to Beat the"
        titleAccent="ATS?"
        subtitle="Join thousands of job seekers who improved their ATS scores. Upload your resume and get your score in seconds."
        ctaText="Check Your ATS Score Now"
        ctaHref="#tool"
      />
    </ToolPageShell>
  )
}
