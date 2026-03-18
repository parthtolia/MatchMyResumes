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
    <section id="tool" className="py-10 md:py-14">
      <div className="max-w-4xl mx-auto px-6">
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
