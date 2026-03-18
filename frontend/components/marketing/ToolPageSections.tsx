"use client"
import Link from "next/link"
import { LazyMotion, domAnimation, m } from "framer-motion"
import { CheckCircle, ArrowRight, type LucideIcon } from "lucide-react"
import Navbar from "@/components/landing/Navbar"

/* ------------------------------------------------------------------ */
/*  Animated wrapper                                                   */
/* ------------------------------------------------------------------ */
export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </m.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Full-page shell (Navbar + LazyMotion + background)                 */
/* ------------------------------------------------------------------ */
export function ToolPageShell({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Navbar />
        <div className="pt-20">{children}</div>
      </div>
    </LazyMotion>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
export function HeroSection({
  badge,
  title,
  titleAccent,
  subtitle,
  ctaText = "Get Started Free",
  ctaHref = "/sign-up",
  compact = false,
}: {
  badge: string
  title: string
  titleAccent: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
  compact?: boolean
}) {
  return (
    <section className={`relative overflow-hidden ${compact ? "py-10 md:py-14" : "py-24 md:py-32"}`}>
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection>
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {badge}
          </span>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <h1 className={`${compact ? "text-3xl md:text-5xl mb-4" : "text-4xl md:text-6xl mb-6"} font-bold leading-tight`}>
            {title} <span className="gradient-text">{titleAccent}</span>
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <p className={`text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed ${compact ? "mb-0" : "mb-10"}`}>
            {subtitle}
          </p>
        </AnimatedSection>
        {!compact && (
          <AnimatedSection delay={0.3}>
            <Link
              href={ctaHref}
              className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg"
            >
              {ctaText} <ArrowRight size={20} />
            </Link>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Explanation / "What is this?" section                              */
/* ------------------------------------------------------------------ */
export function ExplainerSection({
  title,
  titleAccent,
  paragraphs,
}: {
  title: string
  titleAccent: string
  paragraphs: string[]
}) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            {title} <span className="gradient-text">{titleAccent}</span>
          </h2>
        </AnimatedSection>
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <p className="text-gray-400 leading-relaxed text-[15px]">{p}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                       */
/* ------------------------------------------------------------------ */
export function HowItWorksSection({
  steps,
}: {
  steps: { num: string; title: string; desc: string }[]
}) {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-violet-900/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-16">
            How It <span className="gradient-text">Works</span>
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <AnimatedSection key={step.num} delay={i * 0.1}>
              <div className="text-6xl font-black text-white/5 mb-4">
                {step.num}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{step.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Benefits                                                           */
/* ------------------------------------------------------------------ */
export function BenefitsSection({
  title,
  titleAccent,
  benefits,
}: {
  title: string
  titleAccent: string
  benefits: { icon?: LucideIcon; text: string }[]
}) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            {title} <span className="gradient-text">{titleAccent}</span>
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon || CheckCircle
            return (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="flex items-start gap-3 glass p-4">
                  <Icon
                    size={20}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  <span className="text-gray-300 text-[15px] leading-relaxed">
                    {b.text}
                  </span>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
export function FaqSection({
  faqs,
}: {
  faqs: { q: string; a: string }[]
}) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </AnimatedSection>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <details className="glass p-6 rounded-2xl group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-white list-none cursor-pointer">
                  {item.q}
                  <span className="text-violet-400 ml-4 shrink-0 text-xl group-open:rotate-45 transition-transform inline-block">
                    +
                  </span>
                </summary>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                  {item.a}
                </p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */
export function CtaSection({
  title,
  titleAccent,
  subtitle,
  ctaText = "Get Started Free",
  ctaHref = "/sign-up",
}: {
  title: string
  titleAccent: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
}) {
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <AnimatedSection>
          <div className="glass p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title} <span className="gradient-text">{titleAccent}</span>
            </h2>
            <p className="text-gray-400 mb-8">{subtitle}</p>
            <Link
              href={ctaHref}
              className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg"
            >
              {ctaText} <ArrowRight size={20} />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Mock Preview Card (glass wrapper for sample output)                */
/* ------------------------------------------------------------------ */
export function MockPreviewCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Sample <span className="gradient-text">Output Preview</span>
          </h2>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <div
            className={`glass p-8 md:p-10 rounded-2xl border border-white/10 ${className}`}
          >
            {children}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Score Circle (reused from LandingHero pattern)                     */
/* ------------------------------------------------------------------ */
export function ScoreCircle({
  score,
  size = 140,
  label,
}: {
  score: number
  size?: number
  label?: string
}) {
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="100%" stopColor="#00b894" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
      {label && <span className="text-sm text-gray-400 mt-1">{label}</span>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */
export function ProgressBar({
  label,
  value,
  color = "bg-violet-500",
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
