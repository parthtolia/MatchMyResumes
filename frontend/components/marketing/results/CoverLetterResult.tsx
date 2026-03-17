"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Copy, Download, Check, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CoverLetterResultProps {
  content: string
  tone: string
  length: string
  company_name: string
  job_title: string
}

export default function CoverLetterResult({ content, tone, length, company_name, job_title }: CoverLetterResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cover_letter.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Meta info */}
      <div className="flex flex-wrap gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
          {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
          {length.charAt(0).toUpperCase() + length.slice(1)} length
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
          {wordCount} words
        </span>
        {company_name && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Personalized for {company_name}
          </span>
        )}
        {job_title && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {job_title}
          </span>
        )}
      </div>

      {/* Cover letter content */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Your Cover Letter</h3>
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
        <div className="max-h-[500px] overflow-y-auto rounded-xl bg-black/30 p-6 border border-white/5">
          <div className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
            {content}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm mb-3">Want to save and manage all your cover letters?</p>
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
