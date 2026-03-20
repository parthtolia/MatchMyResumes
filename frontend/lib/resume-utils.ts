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
    
    // Phone
    if (!basics.phone && /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) {
       const phoneMatch = line.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
       if (phoneMatch) {
           basics.phone = phoneMatch[0];
           contactInfoLines.add(line);
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
 */
export function resumeSectionsToResumeData(
  sections: Record<string, string>,
  originalBasics?: ResumeBasics
): ResumeData {
  // ─── 1. Build basics block ────────────────────────────────────────────────
  const basics: ResumeBasics = originalBasics ? { ...originalBasics } : { name: "" };

  if (!originalBasics) {
    const basicsText = sections.basics || "";
    const rawLines = basicsText.split("\n").map((l) => l.trim()).filter(Boolean);

    // Tokenise: split each line on pipe separators AND runs of 2+ spaces/tabs.
    // This handles both "email | phone | LinkedIn" and "email  phone  linkedin" formats.
    const tokens: string[] = [];
    for (const line of rawLines) {
      const parts = line
        .split(/\s*\|\s*|\t+|  +/)  // pipe, tab, or 2+ spaces
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
    // Phone: optional + sign, then digits/spaces/parens/dashes, 7-15 digits total
    // Also supports Indian formats: +91-XXXXXXXXXX, 91-XXXXXXXXXX, 09XXXXXXXXXX
    const PHONE_RE = /(\+?91[\s.-]?\d{4,5}[\s.-]?\d{4,5}|\+?[\d][\d\s().x\-]{5,17}\d)/;
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
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
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
        const urlM = token.match(URL_RE);
        basics.website = urlM ? urlM[0] : token;
        usedTokens.add(token);
        continue;
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
   * - Everything else rendered as <p>.
   */
  function toHtml(rawContent: string, sectionKey: string): string {
    const lines = rawContent.split("\n").filter((l) => l.trim());
    const parts: string[] = [];
    let bulletBuffer: string[] = [];

    const flushBullets = () => {
      if (bulletBuffer.length > 0) {
        parts.push(`<ul>${bulletBuffer.map((b) => `<li>${b}</li>`).join("")}</ul>`);
        bulletBuffer = [];
      }
    };

    for (const rawLine of lines) {
      const l = rawLine.trim();
      if (!l) continue;

      // Skip contact-info lines in non-basics sections (PDF page-header residue)
      if (sectionKey !== "basics" && isContactInfoLine(l)) continue;

      // Bullet line?
      if (l.startsWith("-") || l.startsWith("•") || l.startsWith("*")) {
        bulletBuffer.push(l.substring(1).trim());
        continue;
      }

      // Flush any pending bullets before emitting a non-bullet line
      flushBullets();

      // Role / company header heuristic for experience sections:
      // Detect patterns like: "Title | Company | Date", "Company (Month Year – Month Year)", etc.
      const isRoleHeader =
        l.length < 150 &&
        (
          // Pattern 1: Multiple pipes (Title | Company | Location | Date)
          (l.match(/\|/g) || []).length >= 1 ||
          // Pattern 2: Em-dash or en-dash (common in "Dates" or "Company – City" separators)
          l.includes("–") ||
          l.includes("—") ||
          // Pattern 3: "Month Year – Month Year" style date range (e.g., "Jan 2023 - Mar 2023")
          /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—]/i.test(l) ||
          // Pattern 4: "Year - Year" style (e.g., "2019 - 2022" or "2019–2022")
          /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|current|now)\b/i.test(l) ||
          // Pattern 5: Comma followed by year range (e.g., "Company, 2019-2023")
          /,\s*\(?\s*\b(19|20)\d{2}[-–—]/.test(l) ||
          // Pattern 6: "Company (Month Year – ...)" format
          /\(.*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i.test(l) ||
          // Pattern 7: Contains @ symbol with company name (Software Engineer @ Company)
          (l.includes("@") && /\b(19|20)\d{2}|present|current/i.test(l)) ||
          // Pattern 8: All caps short line (< 80 chars) that looks like a title/company (common in formatted resumes)
          (l.length < 80 && l === l.toUpperCase() && /[A-Z]{2,}/.test(l) && !/\d/.test(l.substring(0, 10)))
        );

      if (isRoleHeader && sectionKey === "experience") {
        parts.push(`<p><strong>${l}</strong></p>`);
      } else {
        parts.push(`<p>${l}</p>`);
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
