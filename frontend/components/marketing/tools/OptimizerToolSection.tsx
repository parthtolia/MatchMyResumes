"use client"
import { useState } from "react"
import PublicToolForm from "@/components/marketing/PublicToolForm"
import OptimizerResult from "@/components/marketing/results/OptimizerResult"

interface OptimizeResult {
  optimized_text: string
  changes_summary: string[]
}

export default function OptimizerToolSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<OptimizeResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/tools/optimize", {
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
          Upload your resume and paste a job description. Our AI will optimize your resume to match the JD keywords.
        </p>

        {result ? (
          <div className="space-y-6">
            <OptimizerResult {...result} />
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                Optimize another resume
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-8 md:p-10 rounded-2xl border border-white/10">
            <PublicToolForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Optimize My Resume"
            />
          </div>
        )}
      </div>
    </section>
  )
}
