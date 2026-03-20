"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { downloadElementAsPdf, downloadTextAsDocx } from "@/lib/download"
import { ResumeEditor } from "@/components/editor/ResumeEditor"
import { ResumeData, ResumeTemplateId, ResumeTheme } from "@/lib/types/resume"
import { parseRawTextToResumeData, resumeDataToRawText, resumeSectionsToResumeData } from "@/lib/resume-utils"

interface OptimizerResultProps {
  optimized_text: string
  changes_summary: string[]
  optimized_sections?: Record<string, string>
  structured_json?: Record<string, string>
}

export default function OptimizerResult({ optimized_text, changes_summary, optimized_sections }: OptimizerResultProps) {
  const [copied, setCopied] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData>(() =>
    optimized_sections && Object.keys(optimized_sections).length > 0
      ? resumeSectionsToResumeData(optimized_sections)
      : parseRawTextToResumeData(optimized_text)
  )
  const [templateId, setTemplateId] = useState<ResumeTemplateId>("classic")
  const [theme, setTheme] = useState<ResumeTheme>({
    primaryColor: "#7c3aed",
    headingColor: "#1a1a1a",
    textColor: "#333333",
    fontFamily: "Inter, sans-serif"
  })

  const handleCopy = () => {
    const text = resumeDataToRawText(resumeData)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOptimizedPdf = async () => {
    const element = document.getElementById("resume-canvas-content")
    if (!element) return
    try { 
        await downloadElementAsPdf(element, `optimized_resume.pdf`) 
    } catch (err) { 
        console.error("PDF Export Error:", err)
    }
  }

  const downloadOptimizedDocx = async () => {
    try { 
        await downloadTextAsDocx(resumeData, `optimized_resume.docx`, templateId, theme.primaryColor) 
    } catch (err) {
        console.error("DOCX Export Error:", err)
    }
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

      {/* AI Editor / Preview */}
      <ResumeEditor 
        initialData={resumeData}
        onDataChange={setResumeData}
        templateId={templateId}
        onTemplateChange={setTemplateId}
        theme={theme}
        onThemeChange={(newTheme) => setTheme({ ...theme, ...newTheme })}
        onDownloadPdf={downloadOptimizedPdf}
        onDownloadDocx={downloadOptimizedDocx}
        onCopyText={handleCopy}
      />

      {/* CTA */}
      <div className="text-center pt-8">
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
