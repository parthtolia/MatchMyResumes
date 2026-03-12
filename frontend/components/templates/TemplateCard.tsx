"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Download, FileText, ArrowRight } from "lucide-react"
import type { ResumeTemplate } from "@/lib/templates"

export default function TemplateCard({ template }: { template: ResumeTemplate }) {
  const [downloading, setDownloading] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Track download
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
      {/* Preview */}
      <div
        ref={imgRef}
        className="relative bg-white/5 flex items-center justify-center p-6 border-b border-white/5 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 50%, ${template.color}15, transparent 70%)` }}
        />
        <Image
          src={template.previewImage}
          alt={`${template.name} ATS resume template preview`}
          width={240}
          height={320}
          className="rounded shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white text-lg leading-tight">{template.name}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {template.downloads.toLocaleString()} downloads
          </span>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
          {template.description}
        </p>

        {/* Format badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.formats.map(format => (
            <span
              key={format}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
            >
              <FileText size={10} />
              {format}
            </span>
          ))}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full btn-glow text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Download size={16} />
          {downloading ? "Downloading..." : "Download Template"}
        </button>

        {/* CTA */}
        <Link
          href="/sign-up"
          className="mt-3 text-center text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center justify-center gap-1"
        >
          Check your ATS score after editing
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
