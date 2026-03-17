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
  title: "AI Resume Optimizer — Optimize Your Resume for ATS | MatchMyResumes",
  description:
    "Optimize your resume with AI in seconds. Our AI rewrites and enhances your resume to naturally integrate missing keywords without fabricating experience. Free and unlimited.",
  keywords: [
    "AI resume optimizer",
    "resume optimization",
    "ATS optimization",
    "AI resume writer",
    "resume keyword optimizer",
    "optimize resume for ATS",
    "AI resume enhancement",
  ],
  alternates: { canonical: "https://matchmyresumes.com/ai-resume-optimizer" },
  openGraph: {
    title: "AI Resume Optimizer | MatchMyResumes",
    description: "AI-powered resume optimization — naturally integrates missing keywords without fabrication.",
    url: "https://matchmyresumes.com/ai-resume-optimizer",
    type: "website",
  },
}

const faqs = [
  {
    q: "Does the AI fabricate experience or skills?",
    a: "Never. Our AI only restructures and enhances your existing content. It integrates relevant keywords naturally into your real experience — it never invents skills, roles, or achievements you don't have. Your authentic experience is always preserved.",
  },
  {
    q: "How does the AI optimization work?",
    a: "The AI analyzes the gap between your resume and the target job description. It then rewrites bullet points, rephrases accomplishments, and restructures sections to naturally incorporate missing keywords while maintaining your original meaning and truthfulness.",
  },
  {
    q: "Can I review changes before accepting them?",
    a: "Yes! The optimizer shows you a detailed before/after comparison with all changes highlighted. You can review exactly what was modified and choose to save the optimized version or keep your original.",
  },
  {
    q: "Will my resume sound robotic after optimization?",
    a: "Not at all. Our AI is specifically trained to produce natural, professional language. The result reads like a polished resume written by an experienced career coach — not generic template text.",
  },
  {
    q: "Is the AI Resume Optimizer free?",
    a: "Yes! AI resume optimization is completely free with no monthly limits. Optimize as many resumes as you need for different job applications.",
  },
]

export default function AiResumeOptimizerPage() {
  return (
    <ToolPageShell>
      <HeroSection
        badge="Free AI-Powered Optimization"
        title="Optimize Your Resume"
        titleAccent="with AI in Seconds"
        subtitle="Our AI analyzes your resume against a target job description, then rewrites and enhances it to naturally integrate missing keywords — without fabricating a single thing."
        ctaText="Optimize Your Resume Now"
      />

      <ExplainerSection
        title="How AI Resume"
        titleAccent="Optimization Works"
        paragraphs={[
          "Tailoring your resume for every job application is time-consuming and error-prone. You might miss critical keywords, over-stuff terms unnaturally, or spend hours wordsmithing bullet points. AI optimization solves all of these problems instantly.",
          "Our AI reads both your resume and the target job description, identifies the keyword and semantic gaps, then rewrites your bullet points to naturally incorporate the missing terms. It preserves your authentic experience while making it speak the language of the role you're targeting.",
          "The result is a resume that reads naturally to humans while scoring significantly higher with ATS systems. Think of it as having a professional career coach who can rewrite your resume in 30 seconds — for every single job you apply to.",
        ]}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Upload Your Resume",
            desc: "Upload your existing resume in PDF or DOCX format. We extract and understand all your experience, skills, and accomplishments.",
          },
          {
            num: "02",
            title: "Paste the Target JD",
            desc: "Paste the job description you want to optimize for. The AI identifies requirements, keywords, and skills the role demands.",
          },
          {
            num: "03",
            title: "AI Rewrites & Enhances",
            desc: "Our AI restructures your bullet points, integrates missing keywords, and enhances language — all while preserving 100% of your real experience.",
          },
        ]}
      />

      <MockPreviewCard>
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-white mb-4">Before &amp; After Comparison</h4>

          {/* Example 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <span className="text-xs font-medium text-red-400 mb-2 block">Before</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                &quot;Worked on building web applications and managed a team of developers to deliver features on time.&quot;
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-xs font-medium text-emerald-400 mb-2 block">After</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                &quot;Led a cross-functional team of 5 engineers to architect and ship <span className="text-emerald-400 font-medium">scalable React/TypeScript</span> web applications, delivering 12 features across 3 <span className="text-emerald-400 font-medium">Agile sprints</span> with <span className="text-emerald-400 font-medium">98% on-time delivery</span>.&quot;
              </p>
            </div>
          </div>

          {/* Example 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <span className="text-xs font-medium text-red-400 mb-2 block">Before</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                &quot;Responsible for improving application performance and reducing bugs.&quot;
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-xs font-medium text-emerald-400 mb-2 block">After</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                &quot;Optimized <span className="text-emerald-400 font-medium">API response times by 40%</span> through database query optimization and <span className="text-emerald-400 font-medium">Redis caching</span>, reducing production bugs by 60% via <span className="text-emerald-400 font-medium">CI/CD pipeline improvements</span> and automated testing.&quot;
              </p>
            </div>
          </div>

          {/* Changes summary */}
          <div className="pt-4 border-t border-white/5">
            <h5 className="text-xs font-medium text-violet-400 mb-2">Keywords Added</h5>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Agile", "Redis", "CI/CD", "API optimization"].map(k => (
                <span key={k} className="px-2 py-1 text-xs rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">+ {k}</span>
              ))}
            </div>
          </div>
        </div>
      </MockPreviewCard>

      <BenefitsSection
        title="Why Use AI"
        titleAccent="Optimization?"
        benefits={[
          { text: "Saves hours — optimize for any job in under 30 seconds" },
          { text: "Never fabricates — only enhances your real experience" },
          { text: "Naturally integrates keywords ATS systems look for" },
          { text: "Before/after preview so you stay in control of every change" },
          { text: "Trained on thousands of successful resumes across industries" },
          { text: "Completely free — unlimited optimizations, no restrictions" },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CtaSection
        title="Transform Your Resume"
        titleAccent="with AI"
        subtitle="Stop spending hours tailoring resumes manually. Let AI do the heavy lifting while you focus on landing interviews."
        ctaText="Optimize Your Resume Now"
      />
    </ToolPageShell>
  )
}
