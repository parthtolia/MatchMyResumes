"use client"
import Link from "next/link"
import { LazyMotion, domAnimation, m } from "framer-motion"
import {
  Zap, Target, FileText, BarChart3,
  ArrowRight, Star, TrendingUp, ScanSearch
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"

const features = [
  { icon: Target, title: "ATS Score Checker", desc: "Get a detailed 0–100 ATS compatibility score with breakdown across 5 dimensions.", href: "/ats-score-checker" },
  { icon: ScanSearch, title: "Resume vs JD Match", desc: "Compare your resume against any job description and find keyword gaps instantly.", href: "/resume-job-description-match" },
  { icon: Zap, title: "AI Resume Optimizer", desc: "AI rewrites your resume to naturally integrate missing keywords without fabrication.", href: "/ai-resume-optimizer" },
  { icon: FileText, title: "Cover Letter Generator", desc: "Generate tailored, tone-perfect cover letters in seconds from your resume + JD.", href: "/cover-letter-generator" },
  { icon: BarChart3, title: "Application Tracker", desc: "Track every application in a Kanban board with status, notes, and analytics.", href: "/sign-up" },
]

const stats = [
  { value: "85%", label: "Average ATS score improvement" },
  { value: "3x", label: "More interview callbacks" },
  { value: "50K+", label: "Resumes optimized" },
  { value: "< 30s", label: "Average analysis time" },
]

const testimonials = [
  { quote: "MatchMyResumes helped me land a senior role at Stripe in just 2 weeks. The ATS scanner is incredibly accurate.", author: "Sarah J.", role: "Senior Engineer" },
  { quote: "I was struggling to get callbacks until I used the AI optimizer. It totally transformed my resume without sounding fake.", author: "David M.", role: "Product Manager" },
  { quote: "The cover letter generator is incredible. It matched my tone perfectly and saved me hours every week.", author: "Elena R.", role: "Marketing Director" }
]

export default function LandingSections() {
  return (
    <LazyMotion features={domAnimation}>
      {/* Stats */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-extrabold gradient-text mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </m.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">land the job</span>
            </h2>
            <p className="text-gray-400 text-lg">Powered by state-of-the-art AI and cutting-edge ATS analysis algorithms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <m.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="glass p-6 hover:border-violet-500/40 transition-all group h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                    <feature.icon size={22} className="text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{feature.desc}</p>
                  <span className="text-violet-400 text-sm font-medium group-hover:text-violet-300 transition-colors">Learn more &rarr;</span>
                </m.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-b from-transparent to-violet-900/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">
            From upload to offer in <span className="gradient-text">3 steps</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Upload Resume", desc: "Upload your PDF or DOCX resume. Our parser extracts and structures all sections automatically." },
              { num: "02", title: "Paste Job Description", desc: "Paste the JD from any job board. We extract keywords, requirements, and responsibilities." },
              { num: "03", title: "Get AI Analysis", desc: "Receive your ATS score, keyword gaps, optimized resume, and tailored cover letter instantly." },
            ].map((step, i) => (
              <m.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-6xl font-black text-white/5 mb-4">{step.num}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Users love <span className="gradient-text">MatchMyResumes</span>
            </h2>
            <p className="text-gray-400">Join the thousands who have leveled up their job search.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <m.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-8 flex flex-col justify-between"
              >
                <div className="mb-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-gray-300 italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div>
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
            <p className="text-gray-400">Everything you need to know about MatchMyResumes.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "What is an ATS and why does it matter?", a: "Applicant Tracking Systems (ATS) are software tools used by 99% of Fortune 500 companies to automatically filter resumes before a human ever sees them. A low ATS score means your resume gets rejected automatically, regardless of your qualifications." },
              { q: "How does the ATS Score work?", a: "We analyze your resume across 5 dimensions: Keyword Match, Semantic Match, Formatting, Quantification, and Section Completeness. Each is scored 0–100 and weighted to produce an overall compatibility score against your target job description." },
              { q: "Does the AI Optimizer fabricate experience?", a: "Never. Our AI only restructures and enhances existing content — it never invents skills, roles, or achievements you don't have. It integrates relevant keywords naturally while preserving 100% of your authentic experience." },
              { q: "What file formats are supported?", a: "We support PDF and DOCX resume uploads. For best results, use a standard single-column PDF without complex tables or graphics." },
              { q: "Is my data secure?", a: "Yes. Your resumes and job descriptions are stored securely in an encrypted database and are only accessible to you. We never share your data with third parties or use it to train AI models." },
              { q: "Is MatchMyResumes really free?", a: "Yes! All features — ATS scoring, JD matching, AI resume optimization, cover letter generation, and job tracking — are completely free with no limits." },
            ].map((item, i) => (
              <m.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass p-6 rounded-2xl group cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-white list-none cursor-pointer">
                  {item.q}
                  <span className="text-violet-400 ml-4 shrink-0 text-xl group-open:rotate-45 transition-transform inline-block">+</span>
                </summary>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{item.a}</p>
              </m.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass p-12">
            <TrendingUp size={48} className="text-violet-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to land your <span className="gradient-text">dream job?</span>
            </h2>
            <p className="text-gray-400 mb-8">Join 50,000+ job seekers who improved their ATS scores by an average of 85%.</p>
            <Link href="/sign-up" className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg">
              Start for Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <Logo className="scale-75 origin-center" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-3">Tools</h4>
              <div className="flex flex-col gap-2 text-gray-400">
                <Link href="/ats-score-checker" className="hover:text-white transition-colors">ATS Score Checker</Link>
                <Link href="/resume-job-description-match" className="hover:text-white transition-colors">Resume vs JD Match</Link>
                <Link href="/ai-resume-optimizer" className="hover:text-white transition-colors">AI Resume Optimizer</Link>
                <Link href="/cover-letter-generator" className="hover:text-white transition-colors">Cover Letter Generator</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <div className="flex flex-col gap-2 text-gray-400">
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
                <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <div className="flex flex-col gap-2 text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="mailto:support@matchmyresumes.com" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm text-center">&copy; 2026 MatchMyResumes. All rights reserved.</p>
        </div>
      </footer>
    </LazyMotion>
  )
}
