import Link from "next/link"
import { Star, ArrowRight } from "lucide-react"
import { Logo } from "@/components/ui/Logo"

export default function LandingHero() {
  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="scale-75 sm:scale-100 origin-left">
          <Logo />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/resume-templates" className="hover:text-white transition-colors">Templates</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 hidden sm:block">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-glow text-xs sm:text-sm text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-medium whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-32">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="animate-[fadeUp_0.6s_ease-out_both]">
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
          </div>

          {/* Hero mockup */}
          <div className="mt-20 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl shadow-violet-500/20 backdrop-blur-xl flex flex-col animate-[fadeUp_0.8s_ease-out_0.3s_both]">
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
          </div>
        </div>
      </section>
    </>
  )
}
