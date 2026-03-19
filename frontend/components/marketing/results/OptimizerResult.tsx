"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Copy, Download, Check, ArrowRight, FileText, FileDown } from "lucide-react"
import Link from "next/link"
import { downloadTextAsPdf, downloadTextAsDocx } from "@/lib/download"
import { templates } from "@/lib/templates"

interface OptimizerResultProps {
  optimized_text: string
  changes_summary: string[]
}

export default function OptimizerResult({ optimized_text, changes_summary }: OptimizerResultProps) {
  const [copied, setCopied] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("executive-senior-manager")

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimized_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([optimized_text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentTemplate.slug}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPdf = () => downloadTextAsPdf(optimized_text, `${currentTemplate.slug}.pdf`)
  const handleDownloadDocx = () => downloadTextAsDocx(optimized_text, currentTemplate.fileName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Changes summary */}
      {changes_summary.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Changes Made</h3>
          <ul className="space-y-2">
            {changes_summary.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-emerald-400 mt-0.5 shrink-0">&bull;</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimized text */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Optimized Resume</h3>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500"
            >
              <optgroup label="Choose Template">
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              <FileDown size={14} />
              PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              <FileText size={14} />
              DOCX
            </button>
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              <Download size={14} />
              TXT
            </button>
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto rounded-xl bg-gray-100 p-4 sm:p-8 border border-white/5">
          <div 
            className="bg-white mx-auto shadow-sm p-6 sm:p-10 min-h-[1056px] w-full max-w-[816px] text-gray-900"
            style={{
              borderTop: `12px solid ${currentTemplate.color}`,
              fontFamily: currentTemplate.category === 'modern' || currentTemplate.category === 'tech' ? '"Inter", sans-serif' : 'Georgia, serif'
            }}
          >
            <pre className="whitespace-pre-wrap font-inherit text-sm leading-relaxed">
              {optimized_text}
            </pre>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm mb-3">Want to save optimized versions and compare with the original?</p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors"
        >
          Sign up free <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
