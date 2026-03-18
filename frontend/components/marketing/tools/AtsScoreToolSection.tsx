"use client"
import { useState } from "react"
import PublicToolForm from "@/components/marketing/PublicToolForm"
import AtsScoreResult from "@/components/marketing/results/AtsScoreResult"

interface CVResult {
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

export default function AtsScoreToolSection({ preview }: { preview?: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<CVResult | null>(null)

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

  if (result) {
    return (
      <section id="tool" className="py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-6">
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
        </div>
      </section>
    )
  }

  return (
    <section id="tool" className="py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className={preview ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" : ""}>
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/10">
            <PublicToolForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Check ATS Score"
              needsJd={false}
            />
          </div>
          {preview && (
            <div className="hidden lg:block">{preview}</div>
          )}
        </div>
      </div>
    </section>
  )
}
