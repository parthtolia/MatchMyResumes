"use client"
import { useState } from "react"
import PublicToolForm from "@/components/marketing/PublicToolForm"
import AtsScoreResult from "@/components/marketing/results/AtsScoreResult"

interface ATSResult {
  total_score: number
  breakdown: {
    keyword_score: number
    semantic_score: number
    formatting_score: number
    section_score: number
    quantification_score: number
    details: Record<string, unknown>
  }
  matched_keywords: string[]
  missing_keywords: string[]
}

export default function AtsScoreToolSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ATSResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/tools/ats-score", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || "Something went wrong. Please try again.")
        return
      }

      setResult(data)
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="tool" className="py-20 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Try It <span className="gradient-text">Now</span>
        </h2>
        <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
          Upload your resume and paste a job description to get your ATS compatibility score instantly.
        </p>

        {result ? (
          <div className="space-y-6">
            <AtsScoreResult {...result} />
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                Analyze another resume
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-8 md:p-10 rounded-2xl border border-white/10">
            <PublicToolForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Check ATS Score"
            />
          </div>
        )}
      </div>
    </section>
  )
}
