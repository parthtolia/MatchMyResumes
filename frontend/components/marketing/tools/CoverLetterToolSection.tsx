"use client"
import { useState } from "react"
import PublicToolForm from "@/components/marketing/PublicToolForm"
import CoverLetterResult from "@/components/marketing/results/CoverLetterResult"

interface CoverLetterResponse {
  content: string
  tone: string
  length: string
  company_name: string
  job_title: string
}

export default function CoverLetterToolSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<CoverLetterResponse | null>(null)
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [applicantName, setApplicantName] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError("")
    setResult(null)

    formData.append("tone", tone)
    formData.append("length", length)
    if (companyName) formData.append("company_name", companyName)
    if (jobTitle) formData.append("job_title", jobTitle)
    if (applicantName) formData.append("applicant_name", applicantName)

    try {
      const res = await fetch("/api/tools/cover-letter", {
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

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "confident", label: "Confident" },
    { value: "creative", label: "Creative" },
  ]

  const lengthOptions = [
    { value: "short", label: "Short (~200 words)" },
    { value: "medium", label: "Medium (~350 words)" },
    { value: "long", label: "Long (~500 words)" },
  ]

  return (
    <section id="tool" className="py-20 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Try It <span className="gradient-text">Now</span>
        </h2>
        <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
          Upload your resume, paste a job description, and customize your cover letter settings.
        </p>

        {result ? (
          <div className="space-y-6">
            <CoverLetterResult {...result} />
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                Generate another cover letter
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-8 md:p-10 rounded-2xl border border-white/10">
            <PublicToolForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Generate Cover Letter"
            >
              {/* Cover letter options */}
              <div className="space-y-4 pt-2">
                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTone(opt.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          tone === opt.value
                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
                  <div className="flex flex-wrap gap-2">
                    {lengthOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLength(opt.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          length === opt.value
                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Name <span className="text-gray-600">(optional)</span></label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company <span className="text-gray-600">(optional)</span></label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title <span className="text-gray-600">(optional)</span></label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Senior Engineer"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                </div>
              </div>
            </PublicToolForm>
          </div>
        )}
      </div>
    </section>
  )
}
