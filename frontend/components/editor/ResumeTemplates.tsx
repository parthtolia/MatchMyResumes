"use client"
import React from "react"
import { ResumeData, ResumeTemplateId, ResumeTheme } from "@/lib/types/resume"

interface TemplateProps {
  data: ResumeData
  theme: ResumeTheme
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data, theme }) => (
  <div className="p-8 bg-white text-black min-h-[1056px] shadow-lg" style={{ fontFamily: theme.fontFamily }}>
    <header className="text-center mb-8 border-b-2 pb-4" style={{ borderColor: theme.primaryColor }}>
      <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ color: theme.headingColor }}>{data.basics.name}</h1>
      {data.basics.label && <p className="text-lg font-semibold text-gray-700 mt-1">{data.basics.label}</p>}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm mt-2 text-gray-600">
        {data.basics.email && <span>{data.basics.email}</span>}
        {data.basics.phone && <span>{data.basics.phone}</span>}
        {data.basics.location && <span>{data.basics.location}</span>}
        {data.basics.website && <span className="underline">{data.basics.website}</span>}
      </div>
    </header>

    <div className="space-y-6">
      {data.sections.map((section) => (
        <section key={section.id}>
          <h2 className="text-lg font-bold border-b mb-2 uppercase tracking-wider" style={{ color: theme.headingColor, borderColor: "#eee" }}>
            {section.title}
          </h2>
          <div 
            className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </section>
      ))}
    </div>
  </div>
)

const ModernTemplate: React.FC<TemplateProps> = ({ data, theme }) => (
  <div className="p-10 bg-white text-black min-h-[1056px] shadow-lg flex gap-8" style={{ fontFamily: theme.fontFamily }}>
    <aside className="w-1/3 border-r pr-8" style={{ borderColor: "#eee" }}>
      <h1 className="text-2xl font-bold leading-tight" style={{ color: theme.headingColor }}>{data.basics.name}</h1>
      <p className="text-sm text-gray-500 mt-1">{data.basics.label}</p>
      
      <div className="mt-8 space-y-4 text-xs">
        <div>
          <h3 className="font-bold uppercase text-gray-400 mb-1">Contact</h3>
          {data.basics.email && <p className="break-all">{data.basics.email}</p>}
          {data.basics.phone && <p>{data.basics.phone}</p>}
          {data.basics.website && <p className="text-violet-600">{data.basics.website}</p>}
        </div>
        {data.sections.filter(s => s.title.toLowerCase().includes("skills") || s.title.toLowerCase().includes("competenc")).map(s => (
          <div key={s.id}>
            <h3 className="font-bold uppercase text-gray-400 mb-1">{s.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: s.content }} className="leading-relaxed" />
          </div>
        ))}
      </div>
    </aside>

    <main className="flex-1 space-y-8">
      {data.sections.filter(s => !s.title.toLowerCase().includes("skills") && !s.title.toLowerCase().includes("competenc")).map((section) => (
        <section key={section.id}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: theme.primaryColor }}>
            {section.title}
          </h2>
          <div
            className="text-sm leading-relaxed text-gray-800"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </section>
      ))}
    </main>
  </div>
)

const CompactTemplate: React.FC<TemplateProps> = ({ data, theme }) => (
  <div className="p-6 bg-white text-black min-h-[1056px] shadow-lg" style={{ fontFamily: theme.fontFamily }}>
    <header className="mb-4 flex justify-between items-end border-b pb-2" style={{ borderColor: theme.primaryColor }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.headingColor }}>{data.basics.name}</h1>
        <p className="text-sm text-gray-600">{data.basics.label}</p>
      </div>
      <div className="text-[10px] text-right text-gray-500 uppercase flex flex-col items-end">
        <span>{data.basics.email} | {data.basics.phone}</span>
        <span>{data.basics.location}</span>
        {data.basics.website && <span>{data.basics.website}</span>}
      </div>
    </header>

    <div className="space-y-4">
      {data.sections.map((section) => (
        <section key={section.id}>
          <h2 className="text-xs font-bold border-l-4 pl-2 mb-1" style={{ color: theme.headingColor, borderLeftColor: theme.primaryColor }}>
            {section.title}
          </h2>
          <div 
            className="text-[11px] leading-tight text-gray-800"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </section>
      ))}
    </div>
  </div>
)

interface ResumeTemplatesProps {
  templateId: ResumeTemplateId
  data: ResumeData
  theme: ResumeTheme
}

export const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({ templateId, data, theme }) => {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate data={data} theme={theme} />
    case "modern":
      return <ModernTemplate data={data} theme={theme} />
    case "compact":
      return <CompactTemplate data={data} theme={theme} />
    default:
      return <ClassicTemplate data={data} theme={theme} />
  }
}
