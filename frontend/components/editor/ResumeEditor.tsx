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
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[800px]">
      {/* Sidebar / Controls */}
      <div className="w-full lg:w-[400px] space-y-6">
        <div className="glass p-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-medium mb-1">
              <Layout size={16} className="text-violet-400" />
              <span>Resume Template</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => onTemplateChange(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all text-left border ${
                    templateId === t.id 
                    ? "bg-violet-500/20 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white font-medium mb-1">
              <Palette size={16} className="text-emerald-400" />
              <span>Theme Customization</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs text-gray-400">Heading Color</label>
              <div className="flex gap-2">
                {["#1a1a1a", "#2563eb", "#059669", "#7c3aed", "#db2777"].map(c => (
                  <button
                    key={c}
                    onClick={() => onThemeChange({ headingColor: c, primaryColor: c })}
                    className={`w-6 h-6 rounded-full border-2 ${theme.headingColor === c ? "border-white" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input 
                  type="color" 
                  value={theme.headingColor}
                  onChange={(e) => onThemeChange({ headingColor: e.target.value, primaryColor: e.target.value })}
                  className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-2">
            <button onClick={onDownloadPdf} className="btn-glow py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 text-white">
              <Download size={14} /> PDF
            </button>
            <button onClick={onDownloadDocx} className="bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 text-white border border-white/10 transition-colors">
              <Download size={14} /> Word
            </button>
            <button onClick={onCopyText} className="col-span-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 text-white border border-white/10 transition-colors">
              <Copy size={14} /> Copy Rich Text
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex rounded-xl border border-white/10 overflow-hidden">
          <button 
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "edit" ? "bg-violet-500 text-white" : "bg-white/5 text-gray-400"}`}
          >
            Edit
          </button>
          <button 
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "preview" ? "bg-violet-500 text-white" : "bg-white/5 text-gray-400"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Main Area */}
      <div className={`flex-1 space-y-6 ${activeTab === "preview" ? "hidden lg:block" : "block"}`}>
        <div className="glass p-6 min-h-full space-y-8">
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
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Label / Title</label>
                <input 
                  className="w-full bg-transparent border-b border-white/10 text-sm text-gray-300 focus:border-violet-500 outline-none pb-1 transition-colors"
                  value={data.basics.label || ""}
                  onChange={(e) => handleBasicsChange("label", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                className="bg-transparent border-b border-white/10 text-xs text-gray-400 focus:border-violet-500 outline-none pb-1 transition-colors"
                value={data.basics.email || ""}
                onChange={(e) => handleBasicsChange("email", e.target.value)}
                placeholder="Email Address"
              />
              <input 
                className="bg-transparent border-b border-white/10 text-xs text-gray-400 focus:border-violet-500 outline-none pb-1 transition-colors"
                value={data.basics.phone || ""}
                onChange={(e) => handleBasicsChange("phone", e.target.value)}
                placeholder="Phone Number"
              />
              <input 
                className="bg-transparent border-b border-white/10 text-xs text-gray-400 focus:border-violet-500 outline-none pb-1 transition-colors"
                value={data.basics.location || ""}
                onChange={(e) => handleBasicsChange("location", e.target.value)}
                placeholder="City, Country"
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

      {/* Preview Main Area (Live Canvas) */}
      <div id="resume-preview-container" className={`flex-1 hidden xl:flex justify-center bg-gray-950/20 rounded-2xl border border-white/5 p-8 overflow-y-auto max-h-[1200px] sticky top-6 custom-scrollbar ${activeTab === "edit" ? "xl:flex" : "block"}`}>
        <div className="w-full max-w-[816px] origin-top transform scale-[0.8] xl:scale-[0.9] 2xl:scale-100">
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
  )
}
