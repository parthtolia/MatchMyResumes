"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Copy, Download, Check, ArrowRight } from "lucide-react"
import Link from "next/link"

interface OptimizerResultProps {
  optimized_text: string
  changes_summary: string[]
}

export default function OptimizerResult({ optimized_text, changes_summary }: OptimizerResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimized_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([optimized_text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "optimized_resume.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Optimized Resume</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              <Download size={14} />
              Download TXT
            </button>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto rounded-xl bg-black/30 p-4 border border-white/5">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
            {optimized_text}
          </pre>
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
