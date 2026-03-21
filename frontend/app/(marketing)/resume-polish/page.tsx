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
    num: "01",
    title: "Upload Your Resume",
    desc: "Share your PDF or DOCX resume — our AI analyzes the structure and content.",
  },
  {
    num: "02",
    title: "AI Polishing",
    desc: "We enhance clarity, improve structure, strengthen language, and maximize professionalism across all sections.",
  },
  {
    num: "03",
    title: "Review & Download",
    desc: "See all improvements with a detailed summary. Download your polished resume and save it to your account.",
  },
]

export default function ResumePolicePage() {
  return (
    <ToolPageShell>
      <ToolHero
        headline="Polish Your Resume"
        headlineAccent="with AI in Seconds"
        hook="Your resume deserves to shine. Let AI enhance clarity, structure, and professionalism without a job description."
        trustItems={["No signup required", "Completely free", "Preserves your authentic experience"]}
      />

      <PolishToolSection />

      <FeatureStrip active="/resume-polish" />

      <HowItWorksSection steps={howItWorks} />

      <FaqSection faqs={faqs} />

      <CrossSellSection exclude="/resume-polish" />

      <LoginPrompt />

      <CtaSection
        title="Ready to Strengthen"
        titleAccent="Your Resume?"
        subtitle="Polish your resume in seconds with AI-powered improvements. No job description needed."
      />
    </ToolPageShell>
  )
}
