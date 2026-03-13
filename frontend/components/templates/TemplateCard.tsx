"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, ArrowRight } from "lucide-react"
import type { ResumeTemplate } from "@/lib/templates"

export default function TemplateCard({ template }: { template: ResumeTemplate }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      if (typeof window !== "undefined" && "gtag" in window) {
        (window as any).gtag("event", "template_download", {
          template_id: template.id,
          template_name: template.name,
          category: template.category,
        })
      }

      const link = document.createElement("a")
      link.href = `/templates/${template.fileName}`
      link.download = template.fileName
      link.click()
    } finally {
      setTimeout(() => setDownloading(false), 1500)
    }
  }

  return (
    <div className="group glass overflow-hidden hover:border-violet-500/40 transition-all duration-300 flex flex-col">
      {/* Color accent bar */}
      <div className="h-1.5 w-full" style={{ background: template.color }} />

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-white text-sm leading-tight">{template.name}</h3>
          <span className="text-[10px] text-gray-500 whitespace-nowrap mt-0.5">
            {template.downloads.toLocaleString()} downloads
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed mb-3 flex-1">
          {template.description}
        </p>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full btn-glow text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <Download size={14} />
          {downloading ? "Downloading..." : "Download DOCX"}
        </button>

        {/* CTA */}
        <Link
          href="/dashboard/cv-analysis"
          className="mt-2 text-center text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center justify-center gap-1"
        >
          Check your ATS score after editing
          <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  )
}
