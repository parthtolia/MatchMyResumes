import { ResumeData, ResumeSection, ResumeBasics } from "./types/resume";

const SECTION_HEADERS: Record<string, string[]> = {
  summary: ["summary", "professional summary", "profile", "objective", "about me"],
  experience: ["experience", "work experience", "employment history", "professional experience", "work history"],
  education: ["education", "academic background", "qualifications", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "competencies", "expertise", "technologies"],
  projects: ["projects", "personal projects", "academic projects"],
  certifications: ["certifications", "certificates", "licenses", "credentials", "awards"],
};

export function parseRawTextToResumeData(text: string): ResumeData {
  const lines = text.split("\n");
  const sections: ResumeSection[] = [];
  const basics: ResumeBasics = { name: "" };
  
  let currentSectionTitle = "";
  let currentSectionContent: string[] = [];
  let foundBasics = false;

  // Name is typically the first line
  if (!basics.name) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && line.length > 3 && !line.includes("@") && !/\d{3}/.test(line)) {
            basics.name = line;
            break;
        }
    }
  }

  const contactInfoLines = new Set<string>();

  // Scan for basics first
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Email
    if (!basics.email && line.includes("@")) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
          basics.email = emailMatch[0];
          contactInfoLines.add(line);
      }
    }
    
    // Phone - universal format
    if (!basics.phone) {
       // Try to match common phone patterns
       const phonePatterns = [
         /\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}/,  // +1-234-567-8900
         /\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}/,                     // (123) 456-7890
         /\d{3}[\s.-]\d{3}[\s.-]\d{4}/                            // 123-456-7890
       ];

       for (const pattern of phonePatterns) {
         const phoneMatch = line.match(pattern);
         if (phoneMatch) {
           const digitsOnly = phoneMatch[0].replace(/\D/g, "");
           if (digitsOnly.length >= 7) {
             basics.phone = phoneMatch[0];
             contactInfoLines.add(line);
             break;
           }
         }
       }
    }

    // Website
    if (!basics.website && (line.includes("linkedin.com") || line.includes("github.com") || line.includes("http"))) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            basics.website = urlMatch[0];
            contactInfoLines.add(line);
        }
    }
  }

  // Find Location and Title ONLY in the first 5 lines
  let nameIdx = -1;
  if (basics.name) {
      nameIdx = lines.findIndex(l => l.trim() === basics.name);
  }

  for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i].trim();
      if (!line || contactInfoLines.has(line) || line === basics.name) continue;

      // Location heuristic: contains comma, no @, no numbers (mostly)
      if (!basics.location && line.includes(",") && line.length < 40 && !line.match(/\d{3}/)) {
          basics.location = line;
          contactInfoLines.add(line);
          continue;
      }

      // Title heuristic: short string, title casing or upper
      if (!basics.label && line.length < 45 && !line.includes(",") && !line.includes("@")) {
          basics.label = line;
          contactInfoLines.add(line);
      }
  }

  let lastSectionTitle = "SUMMARY";
  let sectionContents: Record<string, string[]> = {
      "SUMMARY": [],
      "WORK EXPERIENCE": [],
      "SKILLS": [],
      "EDUCATION": [],
      "CERTIFICATIONS": []
  };
  let headerOrder: string[] = ["SUMMARY", "WORK EXPERIENCE", "SKILLS", "EDUCATION", "CERTIFICATIONS"];

  const HEADERS_MAP: Record<string, string> = {
    "summary": "SUMMARY", "introduction": "SUMMARY", "profile": "SUMMARY", "objective": "SUMMARY", "professional summary": "SUMMARY",
    "experience": "WORK EXPERIENCE", "work experience": "WORK EXPERIENCE", "work history": "WORK EXPERIENCE", "employment": "WORK EXPERIENCE", "professional experience": "WORK EXPERIENCE",
    "education": "EDUCATION", "academic": "EDUCATION", "education & training": "EDUCATION",
    "skills": "SKILLS", "technical skills": "SKILLS", "expertise": "SKILLS", "core competencies": "SKILLS",
    "projects": "PROJECTS", "personal projects": "PROJECTS",
    "certifications": "CERTIFICATIONS", "licenses": "CERTIFICATIONS", "certification": "CERTIFICATIONS", "certifications & courses": "CERTIFICATIONS",
    "awards": "AWARDS", "honors": "AWARDS", "languages": "LANGUAGES"
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || contactInfoLines.has(line) || line === basics.name) continue;

    const normalized = line.toLowerCase().replace(/:$/, "").trim();
    let foundHeader = "";

    // Exact or starts-with match for common headers to prevent uppercase bullet points from breaking sections
    for (const [key, val] of Object.entries(HEADERS_MAP)) {
        if (normalized === key || (normalized.startsWith(key) && normalized.length < key.length + 5)) {
            foundHeader = val;
            break;
        }
    }

    if (foundHeader) {
      lastSectionTitle = foundHeader;
      if (!sectionContents[lastSectionTitle]) {
        sectionContents[lastSectionTitle] = [];
        headerOrder.push(lastSectionTitle);
      }
    } else {
      // Content line
      let cleanLine = line;
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.match(/^[\d\w]\./)) {
          let bulletContent = line.substring(1).trim();
          if (line.match(/^[\d\w]\./)) bulletContent = line.substring(2).trim();
          if (bulletContent) cleanLine = `<li>${bulletContent}</li>`;
      } else {
          // If it's a short, bold-like line (e.g. Job Title, Company), wrap in strong instead of treating it as a new section
          if (line.length < 60 && !line.includes("<li>") && line.toUpperCase() === line && /[A-Z]/.test(line)) {
              cleanLine = `<p><strong>${line}</strong></p>`;
          } else {
              cleanLine = `<p>${line}</p>`;
          }
      }
      sectionContents[lastSectionTitle].push(cleanLine);
    }
  }

  const finalSections: ResumeSection[] = headerOrder
    .map(title => {
        let content = sectionContents[title].join(" ");
        // Ensure <ul> wrapping
        content = content.replace(/(<li>.*?<\/li>)+/g, (match) => `<ul>${match}</ul>`);
        return {
            id: Math.random().toString(36).substr(2, 9),
            title: title,
            content: content
        };
    });

  return { basics, sections: finalSections };
}

export function resumeDataToRawText(data: ResumeData): string {
  let text = `${data.basics.name}\n`;
  if (data.basics.email) text += `${data.basics.email}\n`;
  if (data.basics.phone) text += `${data.basics.phone}\n`;
  if (data.basics.website) text += `${data.basics.website}\n`;
  if (data.basics.location) text += `${data.basics.location}\n`;
  text += "\n";

  data.sections.forEach(section => {
    text += `${section.title}\n`;
    text += `${section.content}\n\n`;
  });

  return text.trim();
}

/**
 * Directly map the AI's optimized_sections dict into ResumeData.
 * This avoids re-parsing optimized text through the regex heuristic parser
 * and ensures each editor panel field gets the correct, clean content.
 *
 * Accepts optional contactInfo from AI extraction for more accurate parsing.
 */
export function resumeSectionsToResumeData(
  sections: Record<string, string>,
  originalBasics?: ResumeBasics,
  contactInfo?: Record<string, string>
): ResumeData {
  // ─── 1. Build basics block ────────────────────────────────────────────────
  const basics: ResumeBasics = originalBasics ? { ...originalBasics } : { name: "" };

  // If we have AI-extracted contact info, use it directly (most accurate)
  if (contactInfo && Object.keys(contactInfo).length > 0) {
    basics.name = contactInfo.name || basics.name || "";
    basics.label = contactInfo.title || basics.label;
    basics.email = contactInfo.email || basics.email;
    basics.phone = contactInfo.phone || basics.phone;
    basics.location = contactInfo.location || basics.location;
    basics.website = contactInfo.website || basics.website;
  } else if (!originalBasics) {
    // Fallback to regex-based extraction if no AI contact info
    const basicsText = sections.basics || "";
    const rawLines = basicsText.split("\n").map((l) => l.trim()).filter(Boolean);

    // Tokenise: split each line on pipe separators, bullets, dashes, and runs of 2+ spaces/tabs.
    // This handles: "email | phone | LinkedIn" AND "phone • email" AND "phone – location"
    const tokens: string[] = [];
    for (const line of rawLines) {
      const parts = line
        .split(/\s*[\|•–\-]\s*|\t+|  +/)  // ✅ FIXED: Added bullet (•) and dash (–)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        tokens.push(...parts);
      } else {
        tokens.push(line);
      }
    }

    // ── Pass 1: greedily find email, phone, website, location from ALL tokens
    const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
    // Phone: universal format - optional country code (+/00), then digits with optional separators
    // Supports: +1-234-567-8900, (123) 456-7890, 123.456.7890, +91-9876543210, etc.
    // Requires 7-15 digits total
    const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?)*\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}/;
    const URL_RE = /https?:\/\/[^\s]+/;

    const usedTokens = new Set<string>();

    for (const token of tokens) {
      // Email
      if (!basics.email && EMAIL_RE.test(token)) {
        const m = token.match(EMAIL_RE);
        if (m) { basics.email = m[0]; usedTokens.add(token); continue; }
      }
      // Phone: token is mostly digits/symbols (not a URL, not an email)
      if (
        !basics.phone &&
        !token.includes("@") &&
        !token.startsWith("http") &&
        PHONE_RE.test(token)
      ) {
        const digitsOnly = token.replace(/\D/g, "");
        // Accept phone numbers with 7-15 digits (covers most international formats)
        if (digitsOnly.length >= 7 && digitsOnly.length <= 20) {
          const m = token.match(PHONE_RE);
          if (m) {
            basics.phone = m[0].trim();
            usedTokens.add(token);
            continue;
          }
        }
      }
      // Website / LinkedIn / GitHub
      if (!basics.website && (URL_RE.test(token) || /linkedin\.com|github\.com/i.test(token))) {
        let website = "";
        const urlM = token.match(URL_RE);
        if (urlM) {
          website = urlM[0];
        } else if (/linkedin\.com|github\.com/i.test(token)) {
          website = token;
        }
        if (website) {
          basics.website = website;
          usedTokens.add(token);
          continue;
        }
      }
      // Location: has comma, short, no bulk digits
      if (
        !basics.location &&
        token.includes(",") &&
        token.length < 50 &&
        !/\d{4}/.test(token) &&
        !token.includes("@")
      ) {
        basics.location = token;
        usedTokens.add(token);
        continue;
      }
    }

    // ── Pass 2: name = first unused token that doesn't look like contact info
    for (const token of tokens) {
      if (usedTokens.has(token)) continue;
      if (
        !basics.name &&
        token.length > 1 &&
        !token.includes("@") &&
        !PHONE_RE.test(token) &&
        !token.startsWith("http") &&
        !/linkedin\.com|github\.com/i.test(token) &&
        !token.includes(",")  // location already captured above
      ) {
        basics.name = token;
        usedTokens.add(token);
        break;
      }
    }

    // ── Pass 3: title/label = first remaining unused short non-numeric token
    for (const token of tokens) {
      if (usedTokens.has(token)) continue;
      if (
        !basics.label &&
        token.length > 1 &&
        token.length < 60 &&
        !token.includes("@") &&
        !/\d{4}/.test(token) &&
        !token.startsWith("http") &&
        !/linkedin\.com|github\.com/i.test(token)
      ) {
        basics.label = token;
        break;
      }
    }
  }


  // ─── 2. Convert plain-text section content to editor HTML ────────────────
  const SECTION_TITLES: Record<string, string> = {
    summary: "SUMMARY",
    experience: "WORK EXPERIENCE",
    skills: "SKILLS",
    education: "EDUCATION",
    projects: "PROJECTS",
    certifications: "CERTIFICATIONS",
    other: "OTHER",
  };

  const SECTION_ORDER = ["summary", "experience", "skills", "education", "projects", "certifications", "other"];
  const allKeys = Array.from(new Set([...SECTION_ORDER, ...Object.keys(sections)])).filter(
    (k) => k !== "basics" && sections[k]?.trim()
  );

  function isContactInfoLine(l: string): boolean {
    // Email
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(l)) return true;
    // Phone: 7+ consecutive digit/symbol run
    if (/^\+?[\d\s().|\-]{7,30}$/.test(l.trim())) return true;
    // If line has multiple pipe-separated tokens and one is an email or phone
    if (l.includes("|") || l.includes("\t")) {
      const parts = l.split(/[|\t]/).map((p) => p.trim());
      const hasEmail = parts.some((p) => /[a-zA-Z0-9._%+-]+@/.test(p));
      const hasPhone = parts.some((p) => /^\+?[\d\s().\\-]{7,}$/.test(p));
      if (hasEmail || hasPhone) return true;
    }
    // LinkedIn / GitHub URL
    if (/(linkedin|github)\.com/i.test(l)) return true;
    // Bare URL
    if (/^https?:\/\//.test(l.trim())) return true;
    return false;
  }

  /**
   * Convert a section's plain text into Tiptap-compatible HTML.
   * - Contact-info lines that leaked from page headers are stripped.
   * - Consecutive bullet lines are grouped into one <ul> block.
   * - Role header lines (Company | Title | Date) rendered as <strong>.
   * - For EXPERIENCE: lines after headers (that aren't headers) → bullets.
   * - Everything else rendered as <p>.
   */
  function toHtml(rawContent: string, sectionKey: string): string {
    const lines = rawContent.split("\n").filter((l) => l.trim());
    const parts: string[] = [];
    let bulletBuffer: string[] = [];
    let lastWasRoleHeader = false;

    const flushBullets = () => {
      if (bulletBuffer.length > 0) {
        parts.push(`<ul>${bulletBuffer.map((b) => `<li>${b}</li>`).join("")}</ul>`);
        bulletBuffer = [];
      }
    };

    // Role header detection helper
    const isRoleHeader = (l: string): boolean => {
      return (
        l.length < 150 &&
        (
          // Pattern 1: Has pipe (Company | Title | Date)
          (l.match(/\|/g) || []).length >= 1 ||
          // Pattern 2: Has em-dash or en-dash
          l.includes("–") ||
          l.includes("—") ||
          // Pattern 3: "Month Year – Month Year" date range
          /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—]/i.test(l) ||
          // Pattern 4: "Year - Year" style
          /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|current|now)\b/i.test(l) ||
          // Pattern 5: Comma followed by year range
          /,\s*\(?\s*\b(19|20)\d{2}[-–—]/.test(l) ||
          // Pattern 6: "Company (Month Year – ...)" format
          /\(.*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i.test(l) ||
          // Pattern 7: @ with dates
          (l.includes("@") && /\b(19|20)\d{2}|present|current/i.test(l)) ||
          // Pattern 8: ALL CAPS company/title
          (l.length < 80 && l === l.toUpperCase() && /[A-Z]{2,}/.test(l) && !/\d/.test(l.substring(0, 10)))
        )
      );
    };

    for (const rawLine of lines) {
      const l = rawLine.trim();
      if (!l) continue;

      // Skip contact-info lines in non-basics sections (PDF page-header residue)
      if (sectionKey !== "basics" && isContactInfoLine(l)) continue;

      // Explicit bullet line?
      if (l.startsWith("-") || l.startsWith("•") || l.startsWith("*")) {
        bulletBuffer.push(l.substring(1).trim());
        lastWasRoleHeader = false;
        continue;
      }

      // Check if this is a role header
      const headerDetected = isRoleHeader(l);

      if (headerDetected && sectionKey === "experience") {
        // Found role header in experience section
        flushBullets();
        parts.push(`<p><strong>${l}</strong></p>`);
        lastWasRoleHeader = true;
      } else if (lastWasRoleHeader && sectionKey === "experience") {
        // Line after role header in experience → treat as bullet
        bulletBuffer.push(l);
        lastWasRoleHeader = false;
      } else {
        // Regular content
        flushBullets();
        parts.push(`<p>${l}</p>`);
        lastWasRoleHeader = false;
      }
    }

    flushBullets();
    return parts.join("");
  }

  const resumeSections: ResumeSection[] = allKeys.map((key) => ({
    id: Math.random().toString(36).substring(2, 11),
    title: SECTION_TITLES[key] ?? key.toUpperCase(),
    content: toHtml(sections[key].trim(), key),
  }));

  return { basics, sections: resumeSections };
}

/**
 * Convert a StructuredResume (from the extraction pipeline) into ResumeData.
 * This is Step 5 of the pipeline — converts clean structured JSON to UI-ready Tiptap HTML.
 *
 * All sections are rendered as plain text with proper HTML formatting for the editor:
 * - Basics: structured fields (name, email, phone, location, title)
 * - Summary: plain text paragraph in <p>
 * - Experience: role header as <p><strong> + bullets as <ul><li>
 * - Skills: comma-separated list in <p>
 * - Education: one line per degree in <p>
 * - Certifications: one per line in <ul><li> format
 */
export function structuredResumeToResumeData(structured: {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  website?: string;
  summary: string;
  skills: string[];
  certifications: string[];
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ company: string; role: string; duration: string; points: string[] }>;
}): ResumeData {
  const basics: ResumeBasics = {
    name: structured.name || "",
    label: structured.title || undefined,
    email: structured.email || undefined,
    phone: structured.phone || undefined,
    location: structured.location || undefined,
    website: structured.website || undefined,
  };

  const sections: ResumeSection[] = [];

  // Helper to generate unique IDs
  const genId = () => Math.random().toString(36).substring(2, 11);

  // Summary
  if (structured.summary?.trim()) {
    sections.push({
      id: genId(),
      title: "SUMMARY",
      content: `<p>${structured.summary}</p>`,
    });
  }

  // Work Experience
  if (structured.experience && structured.experience.length > 0) {
    const expHtml = structured.experience
      .map((exp) => {
        const header = `<p><strong>${exp.role} | ${exp.company} | ${exp.duration}</strong></p>`;
        const bullets =
          exp.points && exp.points.length > 0
            ? `<ul>${exp.points
                .map((p) => `<li>${p}</li>`)
                .join("")}</ul>`
            : "";
        return header + bullets;
      })
      .join("");
    sections.push({
      id: genId(),
      title: "WORK EXPERIENCE",
      content: expHtml,
    });
  }

  // Skills
  if (structured.skills && structured.skills.length > 0) {
    sections.push({
      id: genId(),
      title: "SKILLS",
      content: `<p>${structured.skills.join(", ")}</p>`,
    });
  }

  // Education
  if (structured.education && structured.education.length > 0) {
    const eduHtml = structured.education
      .map((e) => {
        const line = `${e.degree}${e.institution ? " | " + e.institution : ""}${e.year ? " | " + e.year : ""}`;
        return `<p>${line}</p>`;
      })
      .join("");
    sections.push({
      id: genId(),
      title: "EDUCATION",
      content: eduHtml,
    });
  }

  // Certifications
  if (structured.certifications && structured.certifications.length > 0) {
    const certHtml = `<ul>${structured.certifications
      .map((c) => `<li>${c}</li>`)
      .join("")}</ul>`;
    sections.push({
      id: genId(),
      title: "CERTIFICATIONS",
      content: certHtml,
    });
  }

  return { basics, sections };
}
