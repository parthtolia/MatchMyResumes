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
import CoverLetterToolSection from "@/components/marketing/tools/CoverLetterToolSection"

export const metadata: Metadata = {
  title: "AI Cover Letter Generator — Tailored Cover Letters in Seconds | MatchMyResumes",
  description:
    "Generate tailored, tone-perfect cover letters from your resume and job description. Choose professional, casual, or enthusiastic tone. Free and unlimited.",
  keywords: [
    "AI cover letter generator",
    "cover letter writer",
    "cover letter AI",
    "cover letter generator free",
    "auto cover letter",
    "tailored cover letter",
    "cover letter from resume",
  ],
  alternates: { canonical: "https://matchmyresumes.com/cover-letter-generator" },
  openGraph: {
    title: "AI Cover Letter Generator | MatchMyResumes",
    description: "Generate tailored cover letters in seconds — choose your tone, customize, and download. Free.",
    url: "https://matchmyresumes.com/cover-letter-generator",
    type: "website",
  },
}

const faqs = [
  {
    q: "How does the AI generate a cover letter?",
    a: "Our AI reads your resume and the target job description, then crafts a personalized cover letter that highlights your most relevant experience and skills for the specific role. It uses your real background — never invented details.",
  },
  {
    q: "Can I choose the tone of my cover letter?",
    a: "Yes! Choose from Professional (formal and polished), Enthusiastic (energetic and passionate), Confident, or Creative. Each tone is calibrated for different company cultures and industries.",
  },
  {
    q: "Can I edit the generated cover letter?",
    a: "Absolutely. The generated cover letter is fully editable. Use it as-is or customize it further to add personal touches, specific anecdotes, or adjust the wording to match your voice.",
  },
  {
    q: "Does the cover letter mention the company by name?",
    a: "Yes! When you provide the company name and job title, the AI personalizes the letter with specific references to the company and role — not a generic template.",
  },
  {
    q: "Is the Cover Letter Generator free?",
    a: "Yes! Generate unlimited cover letters completely free. No credit card, no monthly limits — create a unique letter for every application.",
  },
]

function CoverLetterPreviewDemo() {
  return (
    <div className="space-y-6">
      {/* Tone selector demo */}
      <div className="glass p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Tone:</span>
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">Professional</span>
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-white/5 text-gray-400 border border-white/10">Enthusiastic</span>
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-white/5 text-gray-400 border border-white/10">Confident</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs text-gray-300 leading-relaxed space-y-3">
          <p>Dear Hiring Manager,</p>
          <p>
            I am writing to express my interest in the <span className="text-violet-400">Senior Frontend Engineer</span> position at <span className="text-violet-400">Acme Corp</span>. With 5+ years building scalable <span className="text-emerald-400">React</span> applications and a track record of improving performance by <span className="text-emerald-400">40%</span>...
          </p>
          <p className="text-gray-600">[... tailored to your resume + JD ...]</p>
        </div>
      </div>

      {/* Key benefit */}
      <div className="glass p-4 rounded-xl border border-violet-500/10 bg-violet-500/[0.03]">
        <p className="text-sm text-gray-300">
          <span className="text-violet-400 font-semibold">Unique for every job.</span> Not a template — the AI writes a fresh, tailored letter using your real experience for each application.
        </p>
      </div>

      {/* Quick benefits */}
      <div className="space-y-2">
        {[
          "4 tone options for any company culture",
          "Personalized with company name & role",
          "Copy, edit, or download instantly",
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

export default function CoverLetterGeneratorPage() {
  return (
    <ToolPageShell>
      <FeatureStrip active="/cover-letter-generator" />

      <ToolHero
        headline="Generate Tailored Cover Letters"
        headlineAccent="in Seconds"
        hook="Recruiters spot copy-paste letters instantly. Get a unique, tailored letter for every application."
        trustItems={["No signup required", "Completely free", "4 tone options", "Personalized per JD"]}
      />

      <CoverLetterToolSection
        preview={<CoverLetterPreviewDemo />}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Select Resume + JD",
            desc: "Upload your resume and paste the job description. Optionally add company name and job title for extra personalization.",
          },
          {
            num: "02",
            title: "Choose Tone & Length",
            desc: "Pick Professional, Enthusiastic, Confident, or Creative. Select short, medium, or long length.",
          },
          {
            num: "03",
            title: "Generate & Download",
            desc: "Get your personalized cover letter instantly. Review, edit, copy or download. Generate as many as you want.",
          },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CrossSellSection exclude="/cover-letter-generator" />

      <LoginPrompt />

      <CtaSection
        title="Write the Perfect Cover Letter"
        titleAccent="Every Time"
        subtitle="Stop stressing over cover letters. Let AI craft tailored, professional letters that highlight your best qualifications."
        ctaText="Generate Your Cover Letter"
        ctaHref="#tool"
      />
    </ToolPageShell>
  )
}
