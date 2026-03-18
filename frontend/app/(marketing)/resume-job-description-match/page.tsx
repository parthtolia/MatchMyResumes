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
import JdMatchToolSection from "@/components/marketing/tools/JdMatchToolSection"

export const metadata: Metadata = {
  title: "Resume vs Job Description Match Score — Compare Your Resume to Any JD | MatchMyResumes",
  description:
    "See how well your resume matches any job description. Get a match score, keyword gap analysis, and semantic similarity breakdown. Free and unlimited.",
  keywords: [
    "resume job description match",
    "resume JD match score",
    "resume match checker",
    "resume keyword match",
    "resume vs job description",
    "job description match score",
    "resume gap analysis",
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

export default function ResumeJdMatchPage() {
  return (
    <ToolPageShell>
      <HeroSection
        badge="Free Resume Match Analyzer"
        title="See How Well Your Resume Matches"
        titleAccent="Any Job Description"
        subtitle="Upload your resume and paste a job description to get an instant match score, keyword gap analysis, and semantic similarity breakdown."
        compact
      />

      <JdMatchToolSection />

      <ExplainerSection
        title="Why Resume-JD Matching"
        titleAccent="Matters"
        paragraphs={[
          "Every job posting has specific requirements — skills, tools, certifications, and experience levels that recruiters and ATS systems look for. Sending the same generic resume to every job is one of the biggest mistakes job seekers make.",
          "Our Resume vs Job Description Match tool analyzes both documents side by side using keyword extraction and AI-powered semantic analysis. You get a clear match score plus a detailed breakdown of which keywords you're hitting and which you're missing.",
          "This lets you tailor your resume before you apply — not after you've been rejected. By closing the keyword gap and boosting your semantic alignment, you dramatically increase your chances of getting past the ATS and landing an interview.",
        ]}
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

      <MockPreviewCard>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative">
              <svg width={160} height={160} className="-rotate-90">
                <circle cx={80} cy={80} r={68} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
                <circle
                  cx={80} cy={80} r={68} fill="none"
                  stroke="url(#matchGrad)" strokeWidth={10} strokeLinecap="round"
                  strokeDasharray={427} strokeDashoffset={427 - (78 / 100) * 427}
                />
                <defs>
                  <linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6c5ce7" />
                    <stop offset="100%" stopColor="#00b894" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">78</span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <span className="text-sm font-medium text-violet-400">Good Match</span>
          </div>

          <div className="flex-1 w-full space-y-4">
            <ProgressBar label="Keyword Match" value={72} color="bg-emerald-500" />
            <ProgressBar label="Semantic Similarity" value={85} color="bg-violet-500" />
            <ProgressBar label="Formatting" value={88} color="bg-blue-500" />
            <ProgressBar label="Quantification" value={65} color="bg-amber-500" />
            <ProgressBar label="Section Score" value={80} color="bg-pink-500" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4">Keyword Gap Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-medium text-emerald-400 mb-2">Matched Keywords</h5>
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "REST APIs", "Git", "Agile"].map(k => (
                  <span key={k} className="px-2 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{k}</span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-medium text-red-400 mb-2">Missing Keywords</h5>
              <div className="flex flex-wrap gap-2">
                {["GraphQL", "Docker", "CI/CD", "AWS"].map(k => (
                  <span key={k} className="px-2 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MockPreviewCard>

      <BenefitsSection
        title="Why Use Resume-JD"
        titleAccent="Matching?"
        benefits={[
          { text: "Know your fit before you apply — save time on long-shot applications" },
          { text: "Keyword gap analysis shows exactly which terms to add" },
          { text: "Semantic matching catches context beyond exact keywords" },
          { text: "Compare one resume against multiple JDs to find your best fit" },
          { text: "Data-driven approach replaces guesswork with evidence" },
          { text: "Completely free — unlimited matches, no limits" },
        ]}
      />

      <FaqSection faqs={faqs} />

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
