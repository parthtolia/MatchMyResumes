import type { Metadata } from "next"
import {
  ToolPageShell,
  FeatureStrip,
  ToolHero,
  HowItWorksSection,
  FaqSection,
  CtaSection,
  LoginPrompt,
  CrossSellSection,
} from "@/components/marketing/ToolPageSections"
import PolishToolSection from "@/components/marketing/tools/PolishToolSection"

export const metadata: Metadata = {
  title: "Resume Polish — Improve Your Resume with AI | MatchMyResumes",
  description:
    "Polish your resume with AI to improve clarity, structure, and professionalism. No job description needed — get instant improvements across all sections. Free and unlimited.",
  keywords: [
    "resume polish",
    "resume improvement",
    "resume enhancement",
    "resume editing",
    "improve resume",
    "resume proofreading",
    "AI resume polish",
  ],
  alternates: { canonical: "https://matchmyresumes.com/resume-polish" },
  openGraph: {
    title: "Resume Polish | MatchMyResumes",
    description: "AI-powered resume improvement — enhance clarity, structure, and professionalism without a job description.",
    url: "https://matchmyresumes.com/resume-polish",
    type: "website",
  },
}

const faqs = [
  {
    q: "What's the difference between Resume Polish and AI Optimizer?",
    a: "Resume Polish improves your resume's general quality (clarity, structure, flow, professionalism) without needing a job description. AI Optimizer targets your resume to match a specific job by integrating relevant keywords. Use Polish to strengthen your base resume, and Optimizer to tailor it to specific positions.",
  },
  {
    q: "Will Resume Polish change my content or just formatting?",
    a: "It enhances both. We improve language clarity, fix grammatical issues, restructure bullet points for better impact, and strengthen your professional presentation — all while preserving your authentic experience and achievements.",
  },
  {
    q: "Can I see what changed?",
    a: "Yes! The tool shows you all improvements with a detailed summary of changes. You can review the polished resume and choose to save or discard it.",
  },
  {
    q: "Do I need to provide a job description?",
    a: "No. Resume Polish works independently of any job description. It focuses on making your resume stronger and more professional across all sections.",
  },
  {
    q: "Will the improvements work for all industries?",
    a: "Yes. Resume Polish applies universal improvements to clarity, structure, and professionalism that benefit resumes across all industries and career levels.",
  },
]

const howItWorks = [
  {
    title: "Upload Your Resume",
    description: "Share your PDF or DOCX resume — our AI analyzes the structure and content.",
  },
  {
    title: "AI Analysis",
    description: "We identify areas for improvement: clarity, flow, professionalism, and impact.",
  },
  {
    title: "Review & Download",
    description: "See the improvements, download your polished resume, and save it to your account.",
  },
]

export default function ResumePolicePage() {
  return (
    <ToolPageShell>
      <ToolHero
        icon="Sparkles"
        title="Resume Polish"
        subtitle="Improve your resume's clarity, structure, and impact — no job description needed"
        description="Our AI enhances every section of your resume to maximize professionalism and readability. Perfect for strengthening your base resume before tailoring it to specific positions."
        cta="Polish Your Resume Free"
      />

      <PolishToolSection />

      <FeatureStrip
        features={[
          { emoji: "✨", label: "General Improvements" },
          { emoji: "📝", label: "Enhanced Clarity" },
          { emoji: "⚡", label: "Better Structure" },
          { emoji: "🎯", label: "Professional Tone" },
        ]}
      />

      <HowItWorksSection steps={howItWorks} />

      <FaqSection faqs={faqs} />

      <CrossSellSection
        title="Also check out AI Optimizer"
        description="Want to tailor your resume to a specific job? Use our AI Optimizer to match your resume to job descriptions and integrate relevant keywords."
        ctaText="Try AI Optimizer"
        ctaHref="/ai-resume-optimizer"
      />

      <LoginPrompt
        title="Save Your Work"
        description="Create a free account to save all your polished resumes and access your history anytime."
      />

      <CtaSection
        title="Ready to strengthen your resume?"
        description="Polish your resume in seconds with AI-powered improvements."
        ctaText="Polish Now"
      />
    </ToolPageShell>
  )
}
