"use client"
import Link from "next/link"
import { useState } from "react"
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion"
import {
  Zap, Target, FileText, BarChart3,
  ArrowRight, Star, TrendingUp, ScanSearch
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { useUser as useClerkUser } from "@clerk/nextjs"
import { getToolHref } from "@/lib/tool-routes"

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

function useIsSignedIn() {
  if (!HAS_REAL_CLERK) return false
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isSignedIn } = useClerkUser()
  return !!isSignedIn
}

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
/*  Lightbulb color configs per feature                                */
/* ------------------------------------------------------------------ */
const bulbConfigs: Record<number, { bulbColor: string; glowColor: string; sparkColor: string; word: string }> = {
  0: { bulbColor: "#10b981", glowColor: "rgba(16,185,129,0.35)", sparkColor: "#6ee7b7", word: "Success" },
  1: { bulbColor: "#8b5cf6", glowColor: "rgba(139,92,246,0.35)", sparkColor: "#c4b5fd", word: "Alignment" },
  2: { bulbColor: "#f59e0b", glowColor: "rgba(245,158,11,0.35)", sparkColor: "#fcd34d", word: "Improvement" },
  3: { bulbColor: "#3b82f6", glowColor: "rgba(59,130,246,0.35)", sparkColor: "#93c5fd", word: "Expression" },
  4: { bulbColor: "#ec4899", glowColor: "rgba(236,72,153,0.35)", sparkColor: "#f9a8d4", word: "Momentum" },
}
const defaultBulb = { bulbColor: "#a78bfa", glowColor: "rgba(139,92,246,0.2)", sparkColor: "#c4b5fd", word: "Discover" }

/* ------------------------------------------------------------------ */
/*  Animated Center — pulsating lightbulb with dynamic color & text    */
/* ------------------------------------------------------------------ */
function CenterIllustration({ active, activeIdx }: { active: boolean; activeIdx: number | null }) {
  const cfg = activeIdx !== null ? bulbConfigs[activeIdx] ?? defaultBulb : defaultBulb

  return (
    <m.div
      animate={{ scale: active ? 1.05 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative w-44 h-44 flex items-center justify-center"
    >
      {/* Ambient glow behind bulb */}
      <m.div
        animate={{
          opacity: active ? 0.9 : 0.4,
          scale: active ? 1.15 : 1,
          backgroundColor: cfg.glowColor,
        }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 rounded-full blur-2xl"
      />

      {/* Outer pulsing halo */}
      <m.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: active ? cfg.bulbColor + "40" : "rgba(167,139,250,0.15)" }}
      />

      {/* Inner circle base */}
      <div className="absolute inset-4 rounded-full bg-[#0d0d1a]/90 border border-white/[0.08] shadow-2xl backdrop-blur-md" />

      {/* Lightbulb SVG */}
      <div className="relative z-10 flex flex-col items-center">
        <m.svg
          width="56"
          height="72"
          viewBox="0 0 56 72"
          fill="none"
          animate={{ filter: active ? `drop-shadow(0 0 12px ${cfg.glowColor})` : "drop-shadow(0 0 6px rgba(167,139,250,0.2))" }}
          transition={{ duration: 0.4 }}
        >
          {/* Bulb glass */}
          <m.path
            d="M28 4C16.954 4 8 12.954 8 24c0 7.5 4 13.5 10 17v6h20v-6c6-3.5 10-9.5 10-17C48 12.954 39.046 4 28 4z"
            animate={{ fill: cfg.bulbColor + "25", stroke: cfg.bulbColor }}
            transition={{ duration: 0.4 }}
            strokeWidth="1.5"
          />
          {/* Inner glow gradient */}
          <m.ellipse
            cx="28"
            cy="22"
            rx="10"
            ry="10"
            animate={{ fill: cfg.bulbColor + "20" }}
            transition={{ duration: 0.4 }}
          />
          {/* Filament */}
          <m.path
            d="M22 28c2-4 4-6 6-6s4 2 6 6"
            animate={{ stroke: cfg.sparkColor }}
            transition={{ duration: 0.3 }}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Filament center dot */}
          <m.circle
            cx="28"
            cy="22"
            r="1.5"
            animate={{ fill: cfg.sparkColor, opacity: [0.6, 1, 0.6] }}
            transition={{ opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }, fill: { duration: 0.3 } }}
          />
          {/* Base / screw cap */}
          <rect x="18" y="47" width="20" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
          <rect x="19" y="51" width="18" height="3" rx="1" fill="rgba(255,255,255,0.10)" />
          <rect x="20" y="55" width="16" height="3" rx="1" fill="rgba(255,255,255,0.07)" />
          <path d="M22 58h12l-2 6h-8l-2-6z" fill="rgba(255,255,255,0.05)" />
        </m.svg>

        {/* Spark particles on hover */}
        <AnimatePresence>
          {active && (
            <>
              {[
                { x: -16, y: -28, delay: 0 },
                { x: 18, y: -24, delay: 0.15 },
                { x: -12, y: -14, delay: 0.3 },
                { x: 14, y: -18, delay: 0.1 },
                { x: 0, y: -34, delay: 0.2 },
              ].map((spark, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: spark.x,
                    y: spark.y,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, delay: spark.delay, repeat: Infinity, repeatDelay: 0.8 }}
                  className="absolute top-4 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: cfg.sparkColor }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Dynamic text under bulb */}
        <div className="h-5 mt-1.5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <m.span
              key={cfg.word}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: active ? cfg.bulbColor : "rgba(167,139,250,0.7)" }}
            >
              {cfg.word}
            </m.span>
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Orbit Features Section                                             */
/* ------------------------------------------------------------------ */
function OrbitFeaturesSection() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const active = activeIdx !== null ? orbitFeatures[activeIdx] : null
  const isSignedIn = useIsSignedIn()

  return (
    <section id="features" className="py-10 relative overflow-hidden">
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
            {/* SVG connector lines — match orbit item positioning (50 + 40*cos/sin %) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 600 600">
              <defs>
                {orbitFeatures.map((f, i) => {
                  const cfg = bulbConfigs[i] ?? defaultBulb
                  return (
                    <linearGradient key={`lg-${i}`} id={`line-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={cfg.bulbColor} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={cfg.bulbColor} stopOpacity="0.15" />
                    </linearGradient>
                  )
                })}
              </defs>
              {orbitFeatures.map((f, i) => {
                const rad = (f.angle * Math.PI) / 180
                const orbitR = 40
                // Convert percentage position to SVG coords (600x600 viewBox)
                const x = Math.round((50 + orbitR * Math.cos(rad)) * 6 * 10000) / 10000
                const y = Math.round((50 + orbitR * Math.sin(rad)) * 6 * 10000) / 10000
                const isActive = activeIdx === i
                const cfg = bulbConfigs[i] ?? defaultBulb
                return (
                  <line
                    key={f.title}
                    x1="300" y1="300" x2={x} y2={y}
                    stroke={isActive ? `url(#line-grad-${i})` : "rgba(255,255,255,0.06)"}
                    strokeWidth={isActive ? 2.5 : 1}
                    strokeDasharray={isActive ? "none" : "6 6"}
                    className="transition-all duration-500"
                    style={isActive ? {
                      filter: `drop-shadow(0 0 4px ${cfg.glowColor})`,
                    } : undefined}
                  />
                )
              })}
              {/* Orbit ring — matches the orbit radius */}
              <circle cx="300" cy="300" r={40 * 6} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="8 8" />
            </svg>

            {/* Center element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <CenterIllustration active={activeIdx !== null} activeIdx={activeIdx} />
            </div>

            {/* Orbit items */}
            {orbitFeatures.map((f, i) => {
              const isActive = activeIdx === i
              const isFaded = activeIdx !== null && !isActive
              const rad = (f.angle * Math.PI) / 180
              const radius = 40
              const x = Math.round((50 + radius * Math.cos(rad)) * 10000) / 10000
              const y = Math.round((50 + radius * Math.sin(rad)) * 10000) / 10000
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
                    href={getToolHref(f.href, isSignedIn)}
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
                  <Link href={getToolHref(active.href, isSignedIn)} className="inline-flex items-center gap-1.5 text-violet-400 text-sm font-medium mt-2 hover:text-violet-300 transition-colors">
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
              <Link key={f.title} href={getToolHref(f.href, isSignedIn)}>
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

      {/* Explore Examples Section */}
      <section className="py-24 border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Explore Examples <span className="gradient-text">Before You Build</span>
            </h2>
            <p className="text-gray-400 text-lg">Get inspired by real-world examples crafted for every industry and role.</p>
          </m.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Examples card */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              viewport={{ once: true }}
              className="glass p-8 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 group"
            >
              <div className="mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText size={22} className="text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Resume Examples</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Browse 25 real-world resume examples across industries — from software engineering to marketing and finance.</p>
              </div>
              <Link
                href="/resume-examples"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-glow text-white text-sm font-semibold self-start"
              >
                View Resume Examples <ArrowRight size={15} />
              </Link>
            </m.div>
            {/* Cover Letter Examples card */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              viewport={{ once: true }}
              className="glass p-8 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 group"
            >
              <div className="mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText size={22} className="text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cover Letter Examples</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Explore 15 proven cover letter templates tailored to different roles, tones, and experience levels.</p>
              </div>
              <Link
                href="/cover-letter-examples"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-glow text-white text-sm font-semibold self-start"
              >
                View Cover Letter Examples <ArrowRight size={15} />
              </Link>
            </m.div>
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
      <FooterSection />
    </LazyMotion>
  )
}

function FooterSection() {
  const isSignedIn = useIsSignedIn()
  return (
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <Logo className="scale-75 origin-center" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-3">Tools</h4>
              <div className="flex flex-col gap-2 text-gray-400">
                <Link href={getToolHref("/ats-score-checker", isSignedIn)} className="hover:text-white transition-colors">ATS Score Checker</Link>
                <Link href={getToolHref("/resume-job-description-match", isSignedIn)} className="hover:text-white transition-colors">Resume vs JD Match</Link>
                <Link href={getToolHref("/ai-resume-optimizer", isSignedIn)} className="hover:text-white transition-colors">AI Resume Optimizer</Link>
                <Link href={getToolHref("/cover-letter-generator", isSignedIn)} className="hover:text-white transition-colors">Cover Letter Generator</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <div className="flex flex-col gap-2 text-gray-400">
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                <Link href="/resume-examples" className="hover:text-white transition-colors">Resume Examples</Link>
                <Link href="/cover-letter-examples" className="hover:text-white transition-colors">Cover Letter Examples</Link>
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
  )
}
