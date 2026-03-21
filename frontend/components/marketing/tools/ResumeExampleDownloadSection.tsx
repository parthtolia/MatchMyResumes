"use client"

import { useState } from "react"
import { Download, FileText } from "lucide-react"
import { ResumeTemplates } from "@/components/editor/ResumeTemplates"
import { downloadElementAsPdf, downloadTextAsDocx } from "@/lib/download"
import type { ResumeData, ResumeTemplateId, ResumeTheme } from "@/lib/types/resume"
import type { ResumeExample } from "@/app/(marketing)/resume-examples/data"

interface ResumeExampleDownloadSectionProps {
  example: ResumeExample
  isSticky?: boolean
}

export function ResumeExampleDownloadSection({
  example,
  isSticky = false,
}: ResumeExampleDownloadSectionProps) {
  const [templateId, setTemplateId] = useState<ResumeTemplateId>("classic")
  const [accentColor, setAccentColor] = useState("#1a1a1a")

  // Map ResumeExample to ResumeData
  const resumeData: ResumeData = {
    basics: {
      name: example.title,
      label: "Professional Resume",
      email: undefined,
      phone: undefined,
      website: undefined,
      location: undefined,
    },
    sections: [
      {
        id: "summary",
        title: "Professional Summary",
        content: `<p>${example.summary}</p>`,
      },
      {
        id: "experience",
        title: "Experience",
        content: `<ul>${example.experienceBullets
          .map((bullet) => `<li>${bullet}</li>`)
          .join("")}</ul>`,
      },
      {
        id: "skills",
        title: "Skills",
        content: `<p>${example.skills.join(", ")}</p>`,
      },
      {
        id: "education",
        title: "Education & Certifications",
        content: `<p>${example.education}</p>${
          example.certifications.length > 0
            ? `<ul>${example.certifications
                .map((cert) => `<li>${cert}</li>`)
                .join("")}</ul>`
            : ""
        }`,
      },
    ],
  }

  const theme: ResumeTheme = {
    primaryColor: accentColor,
    headingColor: accentColor,
    textColor: "#000",
    fontFamily: "Arial, sans-serif",
  }

  const handleDownloadPdf = async () => {
    const element = document.getElementById("resume-example-canvas")
    if (element) {
      await downloadElementAsPdf(element, `${example.slug}_resume.pdf`)
    }
  }

  const handleDownloadDocx = async () => {
    await downloadTextAsDocx(
      resumeData,
      `${example.slug}_resume.docx`,
      templateId,
      accentColor
    )
  }

  return (
    <section className={`${isSticky ? "py-0 pb-20" : "py-20"} border-t border-white/5`}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Controls */}
        <div className="mb-12 space-y-6">
          {/* Template Switcher */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Resume Format</h3>
            <div className="flex gap-3 flex-wrap">
              {(
                [
                  { id: "classic", label: "Classic" },
                  { id: "modern", label: "Modern" },
                  { id: "compact", label: "Compact" },
                ] as Array<{ id: ResumeTemplateId; label: string }>
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTemplateId(id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    templateId === id
                      ? "bg-violet-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Heading Color</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { color: "#1a1a1a", label: "Charcoal" },
                { color: "#1e3a8a", label: "Navy" },
                { color: "#15803d", label: "Forest Green" },
                { color: "#1e293b", label: "Slate" },
                { color: "#7c2d12", label: "Brown" },
                { color: "#134e4a", label: "Teal" },
                { color: "#475569", label: "Steel" },
              ].map(({ color, label }) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    accentColor === color
                      ? "border-white"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-mono">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3 flex-wrap pt-4">
            <button
              onClick={handleDownloadPdf}
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium text-sm"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 text-gray-300 font-medium text-sm hover:bg-white/10 transition-colors"
            >
              <FileText size={16} />
              Download Word
            </button>
          </div>
        </div>

        {/* Preview + PDF Canvas */}
        <div className="mt-12 glass p-8 md:p-12 rounded-2xl border border-white/10 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-6">Preview</h3>
          <div id="resume-example-canvas" className="mx-auto" style={{ maxWidth: "900px", width: "100%" }}>
            <ResumeTemplates templateId={templateId} data={resumeData} theme={theme} />
          </div>
        </div>
      </div>
    </section>
  )
}
