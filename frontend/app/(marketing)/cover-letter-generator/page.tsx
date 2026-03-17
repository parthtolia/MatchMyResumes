import type { Metadata } from "next"
import {
  ToolPageShell,
  HeroSection,
  ExplainerSection,
  HowItWorksSection,
  MockPreviewCard,
  BenefitsSection,
  FaqSection,
  CtaSection,
} from "@/components/marketing/ToolPageSections"

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
    a: "Yes! Choose from Professional (formal and polished), Casual (friendly and approachable), or Enthusiastic (energetic and passionate). Each tone is calibrated for different company cultures and industries.",
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

export default function CoverLetterGeneratorPage() {
  return (
    <ToolPageShell>
      <HeroSection
        badge="Free AI Cover Letter Writer"
        title="Generate Tailored Cover Letters"
        titleAccent="in Seconds"
        subtitle="Upload your resume, paste the job description, choose your tone — and get a personalized, professional cover letter that highlights your most relevant experience for the role."
        ctaText="Generate Your Cover Letter"
      />

      <ExplainerSection
        title="Why a Tailored Cover Letter"
        titleAccent="Wins Interviews"
        paragraphs={[
          "A strong cover letter is your chance to make a personal connection that a resume alone can't deliver. It shows the hiring manager you've done your research, you understand the role, and you can articulate why you're the right fit — in your own voice.",
          "But writing a unique cover letter for every application is exhausting. Most job seekers either skip it entirely or send a generic template, which is worse than no letter at all. Recruiters can spot a copy-paste letter from a mile away.",
          "Our AI Cover Letter Generator solves this by creating a unique, tailored letter for each application in seconds. It pulls from your actual resume and the specific job description to highlight the most relevant qualifications — with the tone you choose.",
        ]}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Select Resume + JD",
            desc: "Upload your resume and paste the job description you're applying for. Optionally add the company name and job title for extra personalization.",
          },
          {
            num: "02",
            title: "Choose Tone & Length",
            desc: "Pick your preferred tone — Professional, Casual, or Enthusiastic. Select length: short (150 words), medium (250 words), or long (400 words).",
          },
          {
            num: "03",
            title: "Generate & Download",
            desc: "Get your personalized cover letter instantly. Review, edit if needed, copy or download. Generate as many versions as you want.",
          },
        ]}
      />

      <MockPreviewCard>
        <div className="space-y-6">
          {/* Tone selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Tone:</span>
            <span className="px-3 py-1 text-xs rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">Professional</span>
            <span className="px-3 py-1 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10">Casual</span>
            <span className="px-3 py-1 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10">Enthusiastic</span>
          </div>

          {/* Sample letter */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-sm text-gray-300 leading-relaxed space-y-4">
            <p>Dear Hiring Manager,</p>
            <p>
              I am writing to express my strong interest in the <span className="text-violet-400">Senior Frontend Engineer</span> position at <span className="text-violet-400">Acme Corp</span>. With over 5 years of experience building scalable React applications and a proven track record of improving web performance, I am confident in my ability to contribute to your engineering team.
            </p>
            <p>
              In my current role at TechStart Inc., I led the migration of a legacy jQuery codebase to a modern <span className="text-emerald-400">React/TypeScript</span> stack, resulting in a <span className="text-emerald-400">40% improvement in page load times</span> and a <span className="text-emerald-400">25% reduction in customer support tickets</span>. I also implemented a component library used by 3 product teams, establishing consistent design patterns across the platform.
            </p>
            <p className="text-gray-500">
              [... continues with tailored details from your resume ...]
            </p>
            <p>
              I would welcome the opportunity to discuss how my experience aligns with your team&apos;s goals. Thank you for your consideration.
            </p>
            <p>Best regards,<br />Alex Johnson</p>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>Word count: 287</span>
            <span>Tone: Professional</span>
            <span>Personalized for: Acme Corp</span>
          </div>
        </div>
      </MockPreviewCard>

      <BenefitsSection
        title="Why Use AI Cover"
        titleAccent="Letter Generation?"
        benefits={[
          { text: "Unique, tailored letter for every application — not a template" },
          { text: "Choose from 3 tones to match any company culture" },
          { text: "Pulls directly from your resume — always accurate and honest" },
          { text: "Personalized with company name, job title, and role requirements" },
          { text: "Generate in seconds — save hours of writing per week" },
          { text: "Completely free — unlimited cover letters, no restrictions" },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CtaSection
        title="Write the Perfect Cover Letter"
        titleAccent="Every Time"
        subtitle="Stop stressing over cover letters. Let AI craft tailored, professional letters that highlight your best qualifications for every role."
        ctaText="Generate Your Cover Letter"
      />
    </ToolPageShell>
  )
}
