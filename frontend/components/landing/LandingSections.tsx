"use client"
import Link from "next/link"
import { LazyMotion, domAnimation, m } from "framer-motion"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <m.div
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
              </m.div>
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
              { q: "Can I cancel my subscription anytime?", a: "Absolutely. There are no contracts or lock-ins. Cancel anytime from your account settings and you'll retain access until the end of your billing period." },
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

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, <span className="gradient-text">transparent pricing</span></h2>
            <p className="text-gray-400">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <m.div
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
              </m.div>
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
        <p className="text-gray-400 text-sm">&copy; 2026 MatchMyResumes. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/resume-templates" className="hover:text-white transition-colors">Templates</Link>
          <Link href="mailto:support@matchmyresumes.com" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </LazyMotion>
  )
}
