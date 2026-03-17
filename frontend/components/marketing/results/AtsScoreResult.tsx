"use client"
import { motion } from "framer-motion"
import ScoreCircle from "@/components/ScoreCircle"
import Link from "next/link"
import { ArrowRight, Lightbulb, Tag } from "lucide-react"

interface ATSBreakdown {
  formatting_score: number
  section_score: number
  quantification_score: number
  keyword_richness_score: number
  details: Record<string, unknown>
}

interface AtsScoreResultProps {
  total_score: number
  breakdown: ATSBreakdown
  resume_keywords: string[]
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
  { key: "formatting_score", label: "ATS Formatting", weight: "30%" },
  { key: "section_score", label: "Section Completeness", weight: "25%" },
  { key: "keyword_richness_score", label: "Keyword Richness", weight: "25%" },
  { key: "quantification_score", label: "Quantification", weight: "20%" },
]

export default function AtsScoreResult({ total_score, breakdown, resume_keywords }: AtsScoreResultProps) {
  const details = (breakdown.details || {}) as Record<string, unknown>
  const tips: string[] = []

  if (details.formatting_tips && Array.isArray(details.formatting_tips)) {
    tips.push(...(details.formatting_tips as string[]))
  }
  if (details.section_tips && Array.isArray(details.section_tips)) {
    tips.push(...(details.section_tips as string[]))
  }
  if (details.quantification_tips && Array.isArray(details.quantification_tips)) {
    tips.push(...(details.quantification_tips as string[]))
  }
  if (details.keyword_tips && Array.isArray(details.keyword_tips)) {
    tips.push(...(details.keyword_tips as string[]))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Score circle */}
      <div className="flex justify-center">
        <ScoreCircle score={Math.round(total_score)} size={180} />
      </div>

      {/* Breakdown bars */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
        {breakdownItems.map((item, i) => (
          <ScoreBar
            key={item.key}
            label={item.label}
            score={breakdown[item.key as keyof ATSBreakdown] as number}
            weight={item.weight}
            delay={i * 0.15}
          />
        ))}
      </div>

      {/* Keywords detected */}
      {resume_keywords.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Tag size={18} className="text-violet-400" />
            Keywords Detected in Your Resume
          </h3>
          <div className="flex flex-wrap gap-2">
            {resume_keywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
          {resume_keywords.length < 15 && (
            <p className="text-gray-500 text-xs mt-3">
              We found {resume_keywords.length} distinct keywords. Adding more specific skills, tools, and technologies can improve your ATS score.
            </p>
          )}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-yellow-400" />
            Improvement Tips
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-violet-400 mt-0.5 shrink-0">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm mb-3">Want to match your resume against a specific job description?</p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors"
        >
          Sign up free for JD-matched scoring <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
