"use client"
import Link from "next/link"
import { useState } from "react"
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion"
import {
  Zap, Target, FileText, BarChart3,
  ArrowRight, Star, TrendingUp, ScanSearch
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"

const orbitFeatures = [
  {
    icon: Target,
    title: "ATS Score Checker",
    desc: "Get a detailed 0–100 ATS compatibility score with breakdown across 5 dimensions.",
    micro: "Check your ATS score instantly",
    href: "/ats-score-checker",
    color: "from-emerald-500/20 to-emerald-500/5",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    angle: 0,
  },
  {
    icon: ScanSearch,
    title: "Resume vs JD Match",
    desc: "Match your resume to any job description and find keyword gaps instantly.",
    micro: "Match your resume with job description",
    href: "/resume-job-description-match",
    color: "from-violet-500/20 to-violet-500/5",
    borderColor: "border-violet-500/30",
    iconColor: "text-violet-400",
    angle: 72,
  },
  {
    icon: Zap,
    title: "AI Resume Optimizer",
    desc: "AI rewrites your resume to naturally integrate missing keywords without fabrication.",
    micro: "Optimize your resume with AI",
    href: "/ai-resume-optimizer",
    color: "from-amber-500/20 to-amber-500/5",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    angle: 144,
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    desc: "Generate tailored, tone-perfect cover letters in seconds from your resume + JD.",
    micro: "Generate a cover letter in seconds",
    href: "/cover-letter-generator",
    color: "from-blue-500/20 to-blue-500/5",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    angle: 216,
  },
  {
    icon: BarChart3,
    title: "Application Tracker",
    desc: "Track every application in a Kanban board with status, notes, and analytics.",
    micro: "Track all your job applications",
    href: "/sign-up",
    color: "from-pink-500/20 to-pink-500/5",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
    angle: 288,
  },
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

/* ------------------------------------------------------------------ */
/*  Animated Center Illustration — person at laptop with rising score  */
/* ------------------------------------------------------------------ */
function CenterIllustration({ active }: { active: boolean }) {
  return (
    <m.div
      animate={{ scale: active ? 0.92 : 1 }}
      className="relative w-36 h-36 flex items-center justify-center"
    >
      {/* Outer pulse ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/15 to-emerald-500/15 animate-[pulse_3s_ease-in-out_infinite]" />
      {/* Inner glow */}
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-white/10 shadow-lg shadow-violet-500/20 backdrop-blur-sm" />

      {/* Laptop + person illustration (CSS) */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Person silhouette */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400/60 to-purple-400/60 border border-violet-400/30 mb-1 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-violet-300/50" />
        </div>
        {/* Body */}
        <div className="w-10 h-3 rounded-t-lg bg-gradient-to-br from-violet-500/40 to-purple-500/40 -mt-0.5" />
        {/* Laptop */}
        <div className="relative -mt-0.5">
          <div className="w-14 h-8 rounded-t-md bg-gradient-to-b from-[#1a1a2e] to-[#16162a] border border-white/10 flex items-center justify-center overflow-hidden">
            {/* Screen content — animated score */}
            <m.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-center"
            >
              <div className="text-[10px] font-black text-emerald-400">85</div>
              <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 mt-0.5" />
            </m.div>
            {/* Blinking cursor */}
            <m.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-1 right-1.5 w-0.5 h-2 bg-violet-400/60"
            />
          </div>
          <div className="w-16 h-1 rounded-b-md bg-gray-600/40 border-x border-b border-white/5 mx-auto" style={{ marginLeft: "-1px" }} />
        </div>
      </div>

      {/* Floating checkmarks */}
      <m.div
        animate={{ y: [-2, 2, -2], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
      >
        <span className="text-[8px] text-emerald-400">&#10003;</span>
      </m.div>
      <m.div
        animate={{ y: [2, -2, 2], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-0 -left-1 w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"
      >
        <span className="text-[7px] text-violet-400">&#10003;</span>
      </m.div>
    </m.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Orbit Features Section                                             */
/* ------------------------------------------------------------------ */
function OrbitFeaturesSection() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const active = activeIdx !== null ? orbitFeatures[activeIdx] : null

  return (
    <section id="features" className="py-14 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="gradient-text">land the job</span>
          </h2>
          <p className="text-gray-400 text-lg">One platform. Five powerful tools. Zero guesswork.</p>
        </m.div>

        {/* Desktop orbit layout */}
        <div className="hidden lg:block">
          <div className="relative w-full max-w-[600px] mx-auto" style={{ aspectRatio: "1" }}>
            {/* SVG connector lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 600 600">
              {orbitFeatures.map((f, i) => {
                const rad = (f.angle * Math.PI) / 180
                const radius = 0.40 * 300
                const x = 300 + radius * Math.cos(rad)
                const y = 300 + radius * Math.sin(rad)
                const isActive = activeIdx === i
                return (
                  <line
                    key={f.title}
                    x1="300" y1="300" x2={x} y2={y}
                    stroke={isActive ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)"}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? "none" : "4 4"}
                    className="transition-all duration-300"
                  />
                )
              })}
              {/* Orbit ring */}
              <circle cx="300" cy="300" r={0.40 * 300} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </svg>

            {/* Center element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <CenterIllustration active={activeIdx !== null} />
            </div>

            {/* Orbit items */}
            {orbitFeatures.map((f, i) => {
              const isActive = activeIdx === i
              const isFaded = activeIdx !== null && !isActive
              const rad = (f.angle * Math.PI) / 180
              const radius = 40
              const x = 50 + radius * Math.cos(rad)
              const y = 50 + radius * Math.sin(rad)
              const Icon = f.icon

              return (
                <m.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <Link
                    href={f.href}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                  >
                    <m.div
                      animate={{
                        scale: isActive ? 1.15 : isFaded ? 0.9 : 1,
                        opacity: isFaded ? 0.4 : 1,
                        y: isFaded ? 0 : [0, -3, 0],
                      }}
                      transition={
                        isActive || isFaded
                          ? { type: "spring", stiffness: 300, damping: 20 }
                          : { y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" } }
                      }
                      className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border bg-gradient-to-br ${f.color} ${isActive ? f.borderColor : "border-white/10"} backdrop-blur-sm cursor-pointer group transition-shadow duration-300 ${isActive ? "shadow-lg shadow-violet-500/10" : ""}`}
                      style={{ width: "130px" }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/30 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={20} className={f.iconColor} />
                      </div>
                      <span className="text-xs font-semibold text-white text-center leading-tight">{f.title}</span>

                      {/* Microcopy tooltip */}
                      <AnimatePresence>
                        {isActive && (
                          <m.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-violet-300 bg-black/80 px-3 py-1.5 rounded-lg border border-violet-500/20 pointer-events-none"
                          >
                            {f.micro}
                          </m.div>
                        )}
                      </AnimatePresence>
                    </m.div>
                  </Link>
                </m.div>
              )
            })}
          </div>

          {/* Active feature detail below orbit */}
          <div className="h-16 mt-2">
            <AnimatePresence mode="wait">
              {active && (
                <m.div
                  key={active.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <p className="text-gray-400 text-sm max-w-md mx-auto">{active.desc}</p>
                  <Link href={active.href} className="inline-flex items-center gap-1.5 text-violet-400 text-sm font-medium mt-2 hover:text-violet-300 transition-colors">
                    Try it now <ArrowRight size={14} />
                  </Link>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile/tablet card layout */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {orbitFeatures.map((f, i) => {
            const Icon = f.icon
            return (
              <Link key={f.title} href={f.href}>
                <m.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="glass p-5 hover:border-violet-500/40 transition-all duration-300 group h-full hover:shadow-lg hover:shadow-violet-500/5"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} border ${f.borderColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className={f.iconColor} />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-2">{f.desc}</p>
                  <span className="text-violet-400 text-xs font-medium group-hover:text-violet-300 transition-colors flex items-center gap-1">
                    Try it <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </m.div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function LandingSections() {
  return (
    <LazyMotion features={domAnimation}>
      {/* Features — first scroll section */}
      <OrbitFeaturesSection />

      {/* Stats */}
      <section className="py-20 border-t border-white/5">
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
                className="glass p-8 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5"
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
              { q: "How does the ATS Score work?", a: "We analyze your resume across 5 dimensions: Section Completeness, ATS Formatting, Quantification, Content Density, and Contact Information. Each is scored 0–100 and weighted to produce an overall compatibility score." },
              { q: "Does the AI Optimizer fabricate experience?", a: "Never. Our AI only restructures and enhances existing content — it never invents skills, roles, or achievements you don't have. It integrates relevant keywords naturally while preserving 100% of your authentic experience." },
              { q: "What file formats are supported?", a: "We support PDF and DOCX resume uploads. For best results, use a standard single-column PDF without complex tables or graphics." },
              { q: "Is my data secure?", a: "Yes. Your resumes and job descriptions are stored securely in an encrypted database and are only accessible to you. We never share your data with third parties or use it to train AI models." },
              { q: "Is MatchMyResumes really free?", a: "Yes! All features — ATS scoring, resume-to-JD matching, AI resume optimization, cover letter generation, and job tracking — are completely free with no limits." },
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
          <div className="glass p-12 hover:border-violet-500/30 transition-all duration-300">
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
                <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
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
