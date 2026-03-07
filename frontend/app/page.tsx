"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Zap, Target, FileText, BarChart3,
  CheckCircle, ArrowRight, Star, TrendingUp
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"

const features = [
  { icon: Target, title: "ATS Score Engine", desc: "Get a detailed 0–100 ATS compatibility score with breakdown across 5 dimensions." },
  { icon: Zap, title: "AI Resume Optimizer", desc: "AI rewrites your resume to naturally integrate missing keywords without fabrication." },
  { icon: FileText, title: "Cover Letter Generator", desc: "Generate tailored, tone-perfect cover letters in seconds from your resume + JD." },
  { icon: BarChart3, title: "Application Tracker", desc: "Track every application in a Kanban board with status, notes, and analytics." },
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
  { quote: "The cover letter generator alone is worth the price. It matched my tone perfectly and saved me hours.", author: "Elena R.", role: "Marketing Director" }
]

const plans = [
  {
    name: "Free", price: "$0", period: "/month",
    features: ["2 resume scans/month", "Basic ATS scoring", "Section completeness check"],
    cta: "Get Started Free", highlight: false,
  },
  {
    name: "Pro", price: "$10", period: "/month",
    features: ["Unlimited Resumes", "Unlimited Job Descriptions", "Advanced ATS Scoring", "Priority Support"],
    cta: "Start Pro Trial", highlight: true,
  },
  {
    name: "Premium", price: "$25", period: "/month",
    features: ["Everything in Pro", "AI Cover Letter Generation", "Unlimited Application Tracking", "Exclusive Resume Templates"],
    cta: "Go Premium", highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 hidden sm:block">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-glow text-sm text-white px-5 py-2 rounded-xl font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-32">
        <div className="absolute inset-0 grid-bg opacity-50" />
        {/* Purple glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8">
              <Star size={14} className="fill-current" />
              <span>Trusted by 50,000+ job seekers</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Beat the ATS with{" "}
              <span className="gradient-text">AI-Powered</span>
              <br />Resume Intelligence
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Upload your resume, paste a job description, and get an instant ATS score,
              keyword gap analysis, and AI-optimized resume in under 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="btn-glow px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center gap-2 justify-center">
                Get Your ATS Score Instantly
                <ArrowRight size={20} />
              </Link>
              <Link href="#how-it-works" className="px-8 py-4 rounded-2xl text-gray-300 font-semibold text-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center gap-2 justify-center">
                See How It Works
              </Link>
            </div>
          </motion.div>

          {/* Hero mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl shadow-violet-500/20 backdrop-blur-xl flex flex-col"
          >
            <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-emerald-500/5" />
              <div className="glass p-8 max-w-2xl mx-auto relative z-10 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="text-left">
                    <p className="text-gray-400 text-sm">ATS Compatibility Score</p>
                    <p className="text-white font-semibold text-lg">Software Engineer at Google</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Excellent Fit</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a38" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="url(#scoreGrad)" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray="314"
                      strokeDashoffset="47" transform="rotate(-90 60 60)"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6c5ce7" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <text x="60" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">85</text>
                  </svg>
                  <div className="flex-1 space-y-4 w-full">
                    {[
                      { label: "Keyword Match", val: 88, color: "bg-emerald-500" },
                      { label: "Semantic Match", val: 79, color: "bg-violet-500" },
                      { label: "Formatting", val: 95, color: "bg-blue-500" },
                      { label: "Quantification", val: 72, color: "bg-yellow-500" },
                      { label: "Section Score", val: 82, color: "bg-pink-500" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-400 w-28 shrink-0">{item.label}</span>
                        <div className="flex-1 bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/5">
                          <div className={`${item.color} h-full rounded-full w-0 animate-[grow_1.5s_ease-out_forwards] shadow-[0_0_10px_currentColor]`} style={{ '--target-width': `${item.val}%` } as any} />
                        </div>
                        <span className="text-xs text-gray-200 w-8 text-right font-medium">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes grow {
                from { width: 0%; }
                to { width: var(--target-width); }
              }
            `}} />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-extrabold gradient-text mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-6 hover:border-violet-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                  <feature.icon size={22} className="text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
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
              <motion.div
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
              </motion.div>
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
              <motion.div
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
                  <p className="text-gray-300 italic">"{t.quote}"</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{t.author}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
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
              { q: "Can I cancel my subscription anytime?", a: "Absolutely. There are no contracts or lock-ins. Cancel anytime from your account settings and you'll retain access until the end of your billing period." },
            ].map((item, i) => (
              <motion.details
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
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, <span className="gradient-text">transparent pricing</span></h2>
            <p className="text-gray-400">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col relative rounded-2xl p-10 border ${plan.highlight
                  ? "bg-gradient-to-b from-violet-600/20 to-purple-900/10 border-violet-500/40"
                  : "bg-[#111118] border-white/10"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex flex-col gap-2 mb-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 font-medium">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-4 mb-10 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-[15px] text-gray-300">
                      <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-[2px]" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block text-center py-4 rounded-xl font-bold text-[15px] transition-all ${plan.highlight
                    ? "btn-glow text-white"
                    : "border border-white/20 text-white hover:bg-white/5"
                    }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
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
      <footer className="border-t border-white/5 py-12 px-6 text-center">
        <div className="flex justify-center mb-6">
          <Logo className="scale-75 origin-center" />
        </div>
        <p className="text-gray-500 text-sm">© 2026 MatchMyResumes. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="mailto:support@matchmyresumes.com" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  )
}
