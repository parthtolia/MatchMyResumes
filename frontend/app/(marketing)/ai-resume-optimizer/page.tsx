import type { Metadata } from "next"
import {
  ToolPageShell,
  FeatureStrip,
  ToolHero,
  HowItWorksSection,
  FaqSection,
  CtaSection,
} from "@/components/marketing/ToolPageSections"
import OptimizerToolSection from "@/components/marketing/tools/OptimizerToolSection"

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

function OptimizerPreviewDemo() {
  return (
    <div className="space-y-6">
      {/* Before / After demo */}
      <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Before &amp; After</h4>

        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <span className="text-[10px] font-medium text-red-400 mb-1 block">Before</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            &quot;Worked on building web applications and managed a team to deliver features.&quot;
          </p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <span className="text-[10px] font-medium text-emerald-400 mb-1 block">After</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            &quot;Led a team of 5 engineers to architect <span className="text-emerald-400 font-medium">scalable React/TypeScript</span> apps, delivering 12 features with <span className="text-emerald-400 font-medium">98% on-time delivery</span>.&quot;
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {["React", "TypeScript", "Agile", "CI/CD"].map(k => (
            <span key={k} className="px-2 py-0.5 text-[11px] rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">+ {k}</span>
          ))}
        </div>
      </div>

      {/* Key rule */}
      <div className="glass p-4 rounded-xl border border-violet-500/10 bg-violet-500/[0.03]">
        <p className="text-sm text-gray-300">
          <span className="text-violet-400 font-semibold">Zero fabrication.</span> The AI only enhances your real experience — it never invents skills, roles, or achievements.
        </p>
      </div>

      {/* Quick benefits */}
      <div className="space-y-2">
        {[
          "Optimize for any job in under 30 seconds",
          "Before/after preview for full control",
          "Natural language, not robotic template text",
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

export default function AiResumeOptimizerPage() {
  return (
    <ToolPageShell>
      <FeatureStrip active="/ai-resume-optimizer" />

      <ToolHero
        headline="Optimize Your Resume"
        headlineAccent="with AI in Seconds"
        hook="Tailoring your resume manually for every job is slow. Let AI do it in 30 seconds."
        trustItems={["No signup required", "Completely free", "Never fabricates experience"]}
      />

      <OptimizerToolSection
        preview={<OptimizerPreviewDemo />}
      />

      <HowItWorksSection
        steps={[
          {
            num: "01",
            title: "Upload Your Resume",
            desc: "Upload your existing resume in PDF or DOCX format. We extract all your experience, skills, and accomplishments.",
          },
          {
            num: "02",
            title: "Paste the Target JD",
            desc: "Paste the job description you want to optimize for. The AI identifies requirements, keywords, and skills the role demands.",
          },
          {
            num: "03",
            title: "AI Rewrites & Enhances",
            desc: "Our AI restructures your bullet points, integrates missing keywords, and enhances language — preserving 100% of your real experience.",
          },
        ]}
      />

      <FaqSection faqs={faqs} />

      <CtaSection
        title="Transform Your Resume"
        titleAccent="with AI"
        subtitle="Stop spending hours tailoring resumes manually. Let AI do the heavy lifting while you focus on landing interviews."
        ctaText="Optimize Your Resume Now"
        ctaHref="#tool"
      />
    </ToolPageShell>
  )
}
