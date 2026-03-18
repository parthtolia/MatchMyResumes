"use client"
import { motion } from "framer-motion"
import ScoreCircle from "@/components/ScoreCircle"
import Link from "next/link"
import { ArrowRight, Lightbulb, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface AtsScoreResultProps {
  total_score: number
  section_score: number
  formatting_score: number
  quantification_score: number
  content_density_score: number
  contact_score: number
  skills_detected: string[]
  missing_sections: string[]
  suggestions: Record<string, string[]>
  breakdown: Record<string, unknown>
}

function ScoreBar({ label, score, weight, delay = 0 }: { label: string; score: number; weight: string; delay?: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{weight} &middot; <span className="text-white font-medium">{Math.round(score)}/100</span></span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay }}
          className={`h-2 rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

const breakdownItems = [
  { key: "section_score", label: "Section Completeness", weight: "30%" },
  { key: "formatting_score", label: "ATS Formatting", weight: "25%" },
  { key: "quantification_score", label: "Quantification", weight: "20%" },
  { key: "content_density_score", label: "Content Density", weight: "15%" },
  { key: "contact_score", label: "Contact Information", weight: "10%" },
]

export default function AtsScoreResult(props: AtsScoreResultProps) {
  const {
    total_score,
    skills_detected,
    missing_sections,
    suggestions,
  } = props

  const hasSuggestions = suggestions && typeof suggestions === "object" &&
    Object.values(suggestions).some((tips) => Array.isArray(tips) && tips.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Score + breakdown */}
      <div className="glass p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreCircle score={Math.round(total_score)} size={180} />
          <div className="flex-1 space-y-4 w-full">
            <h2 className="text-xl font-bold text-white">CV Readiness Score</h2>
            {breakdownItems.map((item, i) => (
              <ScoreBar
                key={item.key}
                label={item.label}
                score={props[item.key as keyof AtsScoreResultProps] as number}
                weight={item.weight}
                delay={0.2 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Skills detected */}
        {skills_detected.length > 0 && (
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-400" /> Skills Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills_detected.map(skill => (
                <span key={skill} className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 capitalize">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing sections */}
        {missing_sections.length > 0 && (
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <XCircle size={15} className="text-red-400" /> Missing Sections
            </h3>
            <div className="flex flex-wrap gap-2">
              {missing_sections.map(s => (
                <span key={s} className="px-3 py-1 text-xs rounded-full bg-red-500/10 border border-red-500/20 text-red-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categorized improvement tips */}
      {hasSuggestions && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-400" /> Actionable Improvement Tips
          </h3>
          <div className="space-y-6">
            {Object.entries(suggestions).map(([category, tips]) => {
              if (!Array.isArray(tips) || tips.length === 0) return null
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{category}</h4>
                  <ul className="space-y-2">
                    {tips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm mb-3">Want to match your resume against a specific job description?</p>
        <Link
          href="/resume-job-description-match#tool"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors"
        >
          Try Resume vs JD Match <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
