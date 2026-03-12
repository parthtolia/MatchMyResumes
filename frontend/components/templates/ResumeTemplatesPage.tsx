"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { LazyMotion, domAnimation, m } from "framer-motion"
import {
  FileText, ArrowRight, Star, Filter, Search,
  ChevronDown, X
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import TemplateCard from "./TemplateCard"
import {
  templates,
  CATEGORY_LABELS,
  EXPERIENCE_LABELS,
  type TemplateCategory,
  type ExperienceLevel,
} from "@/lib/templates"

export default function ResumeTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all")
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = useMemo(() => {
    return templates.filter(t => {
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false
      if (selectedLevel !== "all" && !t.experienceLevel.includes(selectedLevel)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedCategory, selectedLevel, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length }
    for (const t of templates) {
      counts[t.category] = (counts[t.category] || 0) + 1
    }
    return counts
  }, [])

  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedLevel("all")
    setSearchQuery("")
  }

  const hasActiveFilters = selectedCategory !== "all" || selectedLevel !== "all" || searchQuery !== ""

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
        {/* Navbar - outside main for landmark structure */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <Link href="/" className="scale-75 sm:scale-100 origin-left">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/resume-templates" className="text-white font-medium">Templates</Link>
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

        <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8">
                <FileText size={14} />
                <span>Free ATS-Optimized Templates</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                ATS-Friendly{" "}
                <span className="gradient-text">Resume Templates</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                Download free, professionally designed resume templates that pass ATS scanners.
                Every template is tested against major Applicant Tracking Systems for maximum compatibility.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#templates" className="btn-glow px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center gap-2 justify-center">
                  Browse Templates
                  <ArrowRight size={20} />
                </a>
                <Link href="/sign-up" className="px-8 py-4 rounded-2xl text-gray-300 font-semibold text-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center gap-2 justify-center">
                  Check Your ATS Score
                </Link>
              </div>
            </m.div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="py-8 border-y border-white/5">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { val: "20", label: "Free Templates" },
              { val: "100%", label: "ATS Compatible" },
              { val: "170K+", label: "Downloads" },
              { val: "DOCX + PDF", label: "Formats" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold gradient-text">{s.val}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters + Grid */}
        <section id="templates" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Filters */}
            <div className="mb-10">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">
                  Browse <span className="gradient-text">Templates</span>
                </h2>

                {/* Search */}
                <div className="relative w-full lg:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-styled pl-9 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Category filter */}
                <div className="flex items-center gap-1.5 text-sm">
                  <Filter size={14} className="text-gray-500" />
                  <span className="text-gray-400 mr-1">Category:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedCategory === "all"
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                        : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    All ({categoryCounts.all})
                  </button>
                  {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedCategory === cat
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {CATEGORY_LABELS[cat]} ({categoryCounts[cat] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience level filter */}
              <div className="flex flex-wrap gap-3 items-center mt-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Star size={14} className="text-gray-500" />
                  <span className="text-gray-400 mr-1">Level:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLevel("all")}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedLevel === "all"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    All Levels
                  </button>
                  {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedLevel === level
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {EXPERIENCE_LABELS[level]}
                    </button>
                  ))}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-white flex items-center gap-1 ml-2 transition-colors"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-400 mb-6">
              Showing {filtered.length} of {templates.length} templates
            </p>

            {/* Template Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((template, i) => (
                  <m.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    viewport={{ once: true }}
                  >
                    <TemplateCard template={template} />
                  </m.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <FileText size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No templates match your filters</p>
                <button onClick={clearFilters} className="mt-4 text-violet-400 hover:text-violet-300 text-sm">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              How to Use an <span className="gradient-text">ATS Resume Template</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  title: "Download & Customize",
                  desc: "Pick a template that matches your experience level. Open in Word or Google Docs and fill in your details.",
                },
                {
                  num: "02",
                  title: "Add Relevant Keywords",
                  desc: "Read the job description carefully. Include matching skills, tools, and action verbs naturally in your resume.",
                },
                {
                  num: "03",
                  title: "Check Your ATS Score",
                  desc: "Upload your edited resume to MatchMyResumes and scan it against the job description to maximize your score.",
                },
              ].map((step, i) => (
                <m.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-5xl font-black text-white/5 mb-3">{step.num}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </m.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="glass p-12">
              <Star size={48} className="text-violet-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to check your <span className="gradient-text">ATS score?</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Upload your customized resume and get an instant ATS compatibility score with actionable feedback.
              </p>
              <Link href="/sign-up" className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg">
                Check Your ATS Score Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        </main>
        <footer className="border-t border-white/5 py-12 px-6 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="scale-75 origin-center" />
          </div>
          <p className="text-gray-400 text-sm">&copy; 2026 MatchMyResumes. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/resume-templates" className="text-white font-medium">Templates</Link>
            <Link href="mailto:support@matchmyresumes.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </footer>
      </div>
    </LazyMotion>
  )
}
