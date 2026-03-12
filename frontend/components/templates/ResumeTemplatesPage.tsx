"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { LazyMotion, domAnimation, m } from "framer-motion"
import {
  FileText, ArrowRight, Star, Filter, Search, X, Download
} from "lucide-react"
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
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Download size={20} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ATS Resume Templates</h1>
              <p className="text-sm text-gray-400">Download free, ATS-optimized resume templates</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { val: "20", label: "Free Templates" },
            { val: "100%", label: "ATS Compatible" },
            { val: "170K+", label: "Downloads" },
            { val: "DOCX + PDF", label: "Formats" },
          ].map(s => (
            <div key={s.label} className="stat-card text-center py-4 min-h-0">
              <div className="text-xl font-bold gradient-text">{s.val}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">
              Browse Templates
            </h2>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-styled py-2.5 text-sm"
                style={{ paddingLeft: "2.5rem" }}
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

        {/* Tips Section */}
        <div className="mt-16 border-t border-white/5 pt-12">
          <h2 className="text-xl font-bold text-center mb-8">
            How to Use an ATS Resume Template
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
                desc: "Upload your edited resume and scan it against the job description to maximize your score.",
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

        {/* CTA */}
        <div className="mt-12 mb-4">
          <div className="glass p-10 text-center">
            <Star size={36} className="text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to check your <span className="gradient-text">ATS score?</span>
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Upload your customized resume and get an instant ATS compatibility score with actionable feedback.
            </p>
            <Link href="/dashboard/cv-analysis" className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold">
              Check Your ATS Score <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </LazyMotion>
  )
}
