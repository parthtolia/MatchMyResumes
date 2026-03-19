"use client";

import { useMemo } from "react";
import { templates } from "@/lib/templates";

interface ResumePreviewProps {
  structuredData: Record<string, string>;
  templateId: string;
}

const SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "other",
];

export default function ResumePreview({
  structuredData,
  templateId,
}: ResumePreviewProps) {
  const template = templates.find((t) => t.id === templateId) || templates[0];
  const color = template.color;
  const isSerif =
    template.category === "professional" || template.category === "career-change";

  // Parse bullets and headers from raw section text
  const renderSectionContent = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        const listKey = `ul-${elements.length}`;
        elements.push(
          <ul key={listKey} className="list-disc pl-5 mb-4 space-y-1 text-sm text-gray-700 outline-none" contentEditable suppressContentEditableWarning>
            {currentList.map((li, idx) => (
              <li key={`${listKey}-${idx}`}>{li}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, idx) => {
      // Check if line is a bullet
      if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
        currentList.push(line.replace(/^[-•*]/, "").trim());
      } else {
        flushList();
        // Check if line feels like a subheader (e.g. capitalized, date range)
        const isHeader =
          line.toUpperCase() === line || line.match(/\d{4}\s*[-–]/);
        if (isHeader) {
          elements.push(
            <h3 key={`h-${idx}`} className="font-semibold text-gray-900 mt-4 mb-1 text-sm outline-none" contentEditable suppressContentEditableWarning>
              {line}
            </h3>
          );
        } else {
          elements.push(
            <p key={`p-${idx}`} className="text-sm text-gray-700 leading-relaxed mb-2 outline-none" contentEditable suppressContentEditableWarning>
              {line}
            </p>
          );
        }
      }
    });
    flushList();
    return elements;
  };

  // Find contact info from 'other' or top lines
  const { header, restOfOther } = useMemo(() => {
    const otherText = structuredData.other || "";
    const lines = otherText.split("\n").map((l) => l.trim()).filter(Boolean);
    const headerLines = lines.slice(0, 3);
    const rest = lines.slice(3).join("\n");
    return { header: headerLines, restOfOther: rest };
  }, [structuredData.other]);

  return (
    <div
      className="bg-white mx-auto shadow-2xl min-h-[1056px] w-[816px] max-w-full text-left relative overflow-hidden"
      style={{
        borderTop: `16px solid ${color}`,
        fontFamily: isSerif ? 'Georgia, serif' : '"Inter", "Helvetica", sans-serif',
        color: '#111827', // Explicit text-gray-900
      }}
    >
      <div className="px-10 py-10">
        {/* Header Section */}
        <div className="pb-6 mb-8 border-b-[3px]" style={{ borderColor: color }}>
          <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-2 outline-none" contentEditable suppressContentEditableWarning>
            {header[0] || "Professional Name"}
          </h1>
          {header.length > 1 && (
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
              {header.slice(1).map((h, i) => (
                <span key={i} className="flex items-center gap-2 outline-none" contentEditable suppressContentEditableWarning>
                  {i > 0 && <span style={{ color }} contentEditable={false}>•</span>}
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr] gap-8">
          <div className="space-y-8">
            {SECTION_ORDER.map((sectionKey) => {
              if (sectionKey === "other") {
                if (!restOfOther) return null;
                return (
                  <section key={sectionKey}>
                    <h2 
                      className="text-lg font-bold uppercase tracking-wider mb-4 pb-1 border-b"
                      style={{ color, borderColor: `${color}40` }}
                    >
                      Additional Information
                    </h2>
                    <div>{renderSectionContent(restOfOther)}</div>
                  </section>
                );
              }

              const content = structuredData[sectionKey as keyof typeof structuredData];
              if (!content) return null;

              return (
                <section key={sectionKey}>
                  <h2 
                    className="text-lg font-bold uppercase tracking-wider mb-4 pb-1 border-b outline-none"
                    style={{ color, borderColor: `${color}40` }}
                    contentEditable
                    suppressContentEditableWarning
                  >
                    {sectionKey}
                  </h2>
                  <div className="outline-none">
                    {renderSectionContent(content)}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
        
        {/* Footer subtle brand */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
          <span>{template.name}</span>
          <span>MatchMyResumes</span>
        </div>
      </div>
    </div>
  );
}
