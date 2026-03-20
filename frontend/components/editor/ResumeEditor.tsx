"use client"
import React, { useState, useEffect } from "react"
import { ResumeData, ResumeTemplateId, ResumeTheme } from "@/lib/types/resume"
import SectionEditor from "./SectionEditor"
import { ResumeTemplates } from "./ResumeTemplates"
import { Monitor, Layout, Palette, ChevronDown, Download, Copy } from "lucide-react"

interface ResumeEditorProps {
  initialData: ResumeData
  onDataChange: (data: ResumeData) => void
  templateId: ResumeTemplateId
  onTemplateChange: (id: ResumeTemplateId) => void
  theme: ResumeTheme
  onThemeChange: (theme: Partial<ResumeTheme>) => void
  onDownloadPdf: () => void
  onDownloadDocx: () => void
  onCopyText: () => void
}

const TEMPLATES: { id: ResumeTemplateId; label: string }[] = [
  { id: "classic", label: "Classic Professional" },
  { id: "modern", label: "Modern Minimal" },
  { id: "compact", label: "Compact Executive" },
]

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  initialData,
  onDataChange,
  templateId,
  onTemplateChange,
  theme,
  onThemeChange,
  onDownloadPdf,
  onDownloadDocx,
  onCopyText,
}) => {
  const [data, setData] = useState<ResumeData>(initialData)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleSectionChange = (id: string, newContent: string) => {
    const newData = {
      ...data,
      sections: data.sections.map(s => s.id === id ? { ...s, content: newContent } : s)
    }
    setData(newData)
    onDataChange(newData)
  }

  const handleBasicsChange = (field: keyof typeof data.basics, value: string) => {
    const newData = {
      ...data,
      basics: { ...data.basics, [field]: value }
    }
    setData(newData)
    onDataChange(newData)
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[800px]">
      {/* Top Header / Horizontal Controls */}
      <div className="glass p-4 sticky top-0 z-50 flex flex-col md:flex-row items-center gap-6 border-b border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2">
            <div className="flex items-center gap-2 text-white font-medium whitespace-nowrap">
                <Layout size={16} className="text-violet-400" />
                <span className="text-xs uppercase tracking-widest opacity-60">Template:</span>
            </div>
            <div className="flex gap-2">
                {TEMPLATES.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onTemplateChange(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                          templateId === t.id 
                          ? "bg-violet-500/20 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                    >
                        {t.label.split(" ")[0]}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white font-medium whitespace-nowrap">
                <Palette size={16} className="text-emerald-400" />
                <span className="text-xs uppercase tracking-widest opacity-60">Heading Color:</span>
            </div>
            <div className="flex gap-2">
                {["#1a1a1a", "#2563eb", "#059669", "#7c3aed", "#db2777"].map(c => (
                    <button
                        key={c}
                        onClick={() => onThemeChange({ headingColor: c, primaryColor: c })}
                        className={`w-5 h-5 rounded-full border-2 ${theme.headingColor === c ? "border-white" : "border-transparent"} transition-transform hover:scale-110`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
            <button onClick={onDownloadPdf} className="btn-glow px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 text-white font-bold">
              <Download size={14} /> PDF
            </button>
            <button onClick={onDownloadDocx} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 text-white border border-white/10 transition-colors">
              <Download size={14} /> Word
            </button>
            <button onClick={onCopyText} className="hidden md:flex bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs items-center justify-center gap-1.5 text-white border border-white/10 transition-colors">
              <Copy size={14} /> Copy
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Editor Main Area - Smaller Basis */}
        <div className={`lg:basis-[40%] space-y-6 ${activeTab === "preview" ? "hidden lg:block" : "block"} overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar`}>
            <div className="glass p-6 space-y-8">
            {/* Basics Section */}
            <section className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Full Name</label>
                    <input 
                    className="w-full bg-transparent border-b border-white/10 text-xl font-bold text-white focus:border-violet-500 outline-none pb-1 transition-colors"
                    value={data.basics.name}
                    onChange={(e) => handleBasicsChange("name", e.target.value)}
                    placeholder="Your Name"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Title</label>
                    <input 
                    className="w-full bg-transparent border-b border-white/10 text-sm text-gray-200 focus:border-violet-500 outline-none pb-1 transition-colors"
                    value={data.basics.label || ""}
                    onChange={(e) => handleBasicsChange("label", e.target.value)}
                    placeholder="Software Engineer"
                    />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                    className="bg-transparent border-b border-white/10 text-xs text-gray-200 focus:border-violet-500 outline-none pb-1 transition-colors"
                    value={data.basics.email || ""}
                    onChange={(e) => handleBasicsChange("email", e.target.value)}
                    placeholder="Email Address"
                />
                <input 
                    className="bg-transparent border-b border-white/10 text-xs text-gray-200 focus:border-violet-500 outline-none pb-1 transition-colors"
                    value={data.basics.phone || ""}
                    onChange={(e) => handleBasicsChange("phone", e.target.value)}
                    placeholder="Phone Number"
                />
                <input
                    className="bg-transparent border-b border-white/10 text-xs text-gray-200 focus:border-violet-500 outline-none pb-1 transition-colors md:col-span-2"
                    value={data.basics.location || ""}
                    onChange={(e) => handleBasicsChange("location", e.target.value)}
                    placeholder="City, Country"
                />
                <input
                    className="bg-transparent border-b border-white/10 text-xs text-gray-200 focus:border-violet-500 outline-none pb-1 transition-colors md:col-span-2"
                    value={data.basics.website || ""}
                    onChange={(e) => handleBasicsChange("website", e.target.value)}
                    placeholder="LinkedIn / GitHub / Portfolio URL"
                />
                </div>
            </section>

            {/* Dynamic Sections */}
            {data.sections.map((section) => (
                <section key={section.id} className="space-y-2 group">
                <div className="flex items-center justify-between">
                    <input 
                    className="bg-transparent text-sm font-black uppercase tracking-widest text-violet-300 outline-none border-none group-hover:text-white transition-colors"
                    value={section.title}
                    onChange={(e) => {
                        const newData = {
                        ...data,
                        sections: data.sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s)
                        }
                        setData(newData)
                        onDataChange(newData)
                    }}
                    />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 group-focus-within:border-violet-500/50 transition-all">
                    <SectionEditor 
                    content={section.content}
                    onChange={(content) => handleSectionChange(section.id, content)}
                    />
                </div>
                </section>
            ))}
            </div>
        </div>

        {/* Preview Main Area - Larger flex-1 */}
        <div id="resume-preview-container" className={`flex-1 hidden xl:flex justify-center bg-gray-950/20 rounded-2xl border border-white/5 p-4 overflow-y-auto max-h-[1200px] sticky top-[100px] custom-scrollbar ${activeTab === "edit" ? "xl:flex" : "block"}`}>
            <div className="w-full h-fit max-w-[816px] origin-top transform scale-[0.7] min-[1400px]:scale-[0.85] min-[1600px]:scale-[0.95] min-[1800px]:scale-[1.0] transition-all">
            <div id="resume-canvas-content">
                <ResumeTemplates 
                templateId={templateId}
                data={data}
                theme={theme}
                />
            </div>
            </div>
        </div>
      </div>
    </div>
  )
}
