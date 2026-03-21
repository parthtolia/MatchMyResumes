"use client"
import { useState } from "react"
import PublicToolForm from "@/components/marketing/PublicToolForm"
import OptimizerResult from "@/components/marketing/results/OptimizerResult"

interface PolishResult {
  optimized_text: string
  changes_summary: string[]
  structured_resume?: Record<string, any>
  contact_info?: Record<string, string>
}

export default function PolishToolSection({ preview }: { preview?: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<PolishResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      // Remove JD text if present, keep only file
      const file = formData.get("file")
      const newFormData = new FormData()
      newFormData.append("file", file as File)

      const res = await fetch("/api/tools/polish", {
        method: "POST",
        body: newFormData,
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-6">
            <OptimizerResult {...result} />
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                Polish another resume
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
              submitLabel="Polish My Resume"
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
