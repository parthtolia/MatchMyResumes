"use client"
import { motion } from "framer-motion"
import ScoreCircle from "@/components/ScoreCircle"
import KeywordHeatmap from "@/components/KeywordHeatmap"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ATSBreakdown {
  keyword_score: number
  semantic_score: number
  formatting_score: number
  section_score: number
  quantification_score: number
  details: Record<string, unknown>
}

interface JdMatchResultProps {
  total_score: number
  breakdown: ATSBreakdown
  matched_keywords: string[]
  missing_keywords: string[]
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
  { key: "keyword_score", label: "Keyword Match", weight: "40%" },
  { key: "semantic_score", label: "Semantic Similarity", weight: "25%" },
  { key: "formatting_score", label: "ATS Formatting", weight: "15%" },
  { key: "section_score", label: "Section Completeness", weight: "10%" },
  { key: "quantification_score", label: "Quantification", weight: "10%" },
]

export default function JdMatchResult({ total_score, breakdown, matched_keywords, missing_keywords }: JdMatchResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Score + keyword gap side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score circle */}
        <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-4">Match Score</h3>
          <ScoreCircle score={Math.round(total_score)} size={180} />
        </div>

        {/* Keyword gap */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Keyword Gap Analysis</h3>
          <KeywordHeatmap matched={matched_keywords} missing={missing_keywords} />
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Breakdown</h3>
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

      {/* Missing keywords emphasis */}
      {missing_keywords.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-yellow-500/20">
          <h3 className="text-lg font-semibold text-yellow-300 mb-3">
            {missing_keywords.length} Keywords Missing From Your Resume
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Adding these keywords naturally to your resume could significantly improve your match score.
          </p>
          <div className="flex flex-wrap gap-2">
            {missing_keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm mb-3">Want to automatically fix those missing keywords?</p>
        <Link
          href="/ai-resume-optimizer#tool"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors"
        >
          Optimize your resume with AI <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
