import type { Metadata } from "next"
import {
  ToolPageShell,
  FeatureStrip,
  ToolHero,
  ProgressBar,
  HowItWorksSection,
  FaqSection,
  CtaSection,
  LoginPrompt,
  CrossSellSection,
} from "@/components/marketing/ToolPageSections"
import JdMatchToolSection from "@/components/marketing/tools/JdMatchToolSection"

export const metadata: Metadata = {
  title: "Resume vs Job Description Match Score — Compare Your Resume to Any JD | MatchMyResumes",
  description:
    "See how well your resume matches any job description. Get a match score, keyword gap analysis, and semantic similarity breakdown. Free and unlimited.",
  keywords: [
    "match my resume",
    "match resume to job description",
    "resume job description match",
    "resume JD match score",
    "resume match checker",
    "resume keyword match",
    "resume vs job description",
    "job description match score",
    "resume gap analysis",
    "resume job match tool",
  ],
  alternates: { canonical: "https://matchmyresumes.com/resume-job-description-match" },
  openGraph: {
    title: "Resume vs Job Description Match Score | MatchMyResumes",
    description: "Compare your resume against any job description — keyword gaps, semantic match, and more.",
    url: "https://matchmyresumes.com/resume-job-description-match",
    type: "website",
  },
}

const faqs = [
  {
    q: "How does the matching algorithm work?",
    a: "We use a combination of keyword extraction, TF-IDF analysis, and AI-powered semantic embeddings to compare your resume against the job description. This gives you both exact keyword matches and contextual understanding of how well your experience aligns.",
  },
  {
    q: "What's the difference between keyword match and semantic match?",
    a: "Keyword match checks for exact or near-exact terms (e.g., 'Python' in both resume and JD). Semantic match uses AI to understand meaning — so 'built scalable microservices' in your resume can match 'distributed systems experience' in the JD, even without identical words.",
  },
  {
    q: "What score means my resume is a good fit?",
    a: "A total match score of 70+ suggests a strong alignment. Scores above 80 indicate an excellent match. If you're below 60, our keyword gap analysis will show you exactly which terms and skills to add.",
  },
  {
    q: "Can I match against multiple job descriptions?",
    a: "Yes! Upload your resume once, then match it against as many job descriptions as you want. This helps you see which roles you're best suited for and how to tailor your resume for each application.",
  },
  {
    q: "Is this tool free?",
    a: "Completely free — unlimited resume-to-JD matches with full keyword gap analysis. No signup required.",
  },
]

function JdMatchPreviewDemo() {
  return (
    <div className="space-y-6">
      {/* Mock match demo */}
      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width={120} height={120} className="-rotate-90">
              <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
              <circle
                cx={60} cy={60} r={50} fill="none"
                stroke="url(#matchDemoGrad)" strokeWidth={8} strokeLinecap="round"
                strokeDasharray={314} strokeDashoffset={314 - (78 / 100) * 314}
              />
              <defs>
                <linearGradient id="matchDemoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6c5ce7" />
                  <stop offset="100%" stopColor="#00b894" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">78</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <ProgressBar label="Keyword Match" value={72} color="bg-emerald-500" />
            <ProgressBar label="Semantic Similarity" value={85} color="bg-violet-500" />
            <ProgressBar label="Formatting" value={88} color="bg-blue-500" />
            <ProgressBar label="Quantification" value={65} color="bg-amber-500" />
          </div>
        </div>
      </div>

      {/* Keyword gap mini demo */}
      <div className="glass p-4 rounded-xl border border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs font-medium text-emerald-400 mb-2">Matched</h5>
            <div className="flex flex-wrap gap-1.5">
              {["React", "TypeScript", "Node.js", "REST APIs"].map(k => (
                <span key={k} className="px-2 py-0.5 text-[11px] rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{k}</span>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-xs font-medium text-red-400 mb-2">Missing</h5>
            <div className="flex flex-wrap gap-1.5">
              {["GraphQL", "Docker", "CI/CD"].map(k => (
                <span key={k} className="px-2 py-0.5 text-[11px] rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">{k}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick benefits */}
      <div className="space-y-2">
        {[
          "Keyword + semantic matching with AI",
          "See exactly which terms to add",
          "Compare against multiple JDs",
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

export default function ResumeJdMatchPage() {
  return (
    <ToolPageShell>
      <FeatureStrip active="/resume-job-description-match" />

      <ToolHero
        headline="See How Well Your Resume Matches"
        headlineAccent="Any Job Description"
        hook="Stop guessing. Know your match score before you hit apply."
        trustItems={["No signup required", "Completely free", "AI-powered semantic matching"]}
      />

      <JdMatchToolSection
        preview={<JdMatchPreviewDemo />}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Upload Your Resume",
            desc: "Upload your PDF or DOCX resume. We extract all text, skills, and structured data automatically.",
          },
          {
            num: "02",
            title: "Paste the Job Description",
            desc: "Copy and paste the job description from any job board. We extract requirements, responsibilities, and key skills.",
          },
          {
            num: "03",
            title: "Get Your Match Analysis",
            desc: "Receive your total match score, keyword-by-keyword gap analysis, and semantic similarity percentage.",
          },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CrossSellSection exclude="/resume-job-description-match" />

      <LoginPrompt />

      <CtaSection
        title="Stop Guessing, Start"
        titleAccent="Matching"
        subtitle="Compare your resume against any job description and know exactly where you stand. Free, instant, unlimited."
        ctaText="Match Your Resume Now"
        ctaHref="#tool"
      />
    </ToolPageShell>
  )
}
