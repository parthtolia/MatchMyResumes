// Import the core lib directly to avoid pdf-parse's index.js test-file-read bug
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");
import mammoth from "mammoth";

const SECTION_HEADERS: Record<string, string[]> = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "objective",
    "about me",
  ],
  experience: [
    "experience",
    "work experience",
    "employment history",
    "professional experience",
    "work history",
  ],
  education: [
    "education",
    "academic background",
    "qualifications",
    "academic qualifications",
  ],
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "competencies",
    "expertise",
    "technologies",
  ],
  certifications: [
    "certifications",
    "certificates",
    "licenses",
    "credentials",
    "awards",
  ],
};

function detectSection(line: string): string | null {
  const normalized = line.trim().toLowerCase().replace(/:$/, "");
  for (const [section, keywords] of Object.entries(SECTION_HEADERS)) {
    if (keywords.includes(normalized)) {
      return section;
    }
  }
  return null;
}

export function parseSections(text: string): Record<string, string> {
  const sections: Record<string, string[]> = {};
  for (const key of Object.keys(SECTION_HEADERS)) {
    sections[key] = [];
  }
  sections["other"] = [];
  let currentSection = "other";

  for (const line of text.split("\n")) {
    const stripped = line.trim();
    if (!stripped) continue;
    const detected = detectSection(stripped);
    if (detected) {
      currentSection = detected;
    } else {
      sections[currentSection].push(stripped);
    }
  }

  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(sections)) {
    const joined = v.join("\n").trim();
    if (joined) {
      result[k] = joined;
    }
  }
  return result;
}

export async function parsePdf(fileBuffer: Buffer): Promise<string> {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

export async function parseDocx(fileBuffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  return result.value;
}

export function cleanText(text: string): string {
  // Remove excessive whitespace/blank lines
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  // Remove common PDF artifacts (non-ASCII)
  text = text.replace(/[^\x00-\x7F]+/g, " ");
  return text.trim();
}

export async function parseResume(
  fileBuffer: Buffer,
  fileType: string
): Promise<{ raw_text: string; structured_json: Record<string, string> }> {
  let rawText: string;

  if (fileType === "pdf") {
    rawText = await parsePdf(fileBuffer);
  } else if (fileType === "docx" || fileType === "doc") {
    rawText = await parseDocx(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  rawText = cleanText(rawText);
  const structured = parseSections(rawText);

  return {
    raw_text: rawText,
    structured_json: structured,
  };
}
