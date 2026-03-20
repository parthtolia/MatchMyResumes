import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

// Lazy-init clients
let groqClient: Groq | null = null;
let geminiAI: GoogleGenerativeAI | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: config.groqApiKey });
  }
  return groqClient;
}

function getGeminiModel() {
  if (!geminiAI) {
    geminiAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return geminiAI.getGenerativeModel({
    model: config.geminiChatModel,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  });
}

function useGroq(): boolean {
  return Boolean(config.groqApiKey);
}

// ── Section extraction ─────────────────────────────────────────────────────
const SECTION_EXTRACTION_PROMPT = `You are a precise resume parser.
Your task is to split the given resume text into its named sections.

Return a JSON object whose keys are the canonical section names from the list below,
and whose values are the VERBATIM text block that belongs to that section.

Canonical section names (use exactly these keys — omit any that are absent from the resume):
- "basics"         → The header block containing: Full Name, then ALL contact-info lines
                     (email, phone, LinkedIn, GitHub, location — even if they appear as one
                     pipe-separated line like "email | phone | linkedin | city").
                     Include the job title/label line if it appears in the header.
                     Capture ALL lines BEFORE the first named section (Summary, Experience, etc.).
- "summary"        → Professional Summary / Objective / Profile
- "experience"     → Work Experience / Employment History / Professional Experience
- "education"      → Education / Academic Background
- "skills"         → Skills / Technical Skills / Core Competencies / Expertise
- "projects"       → Projects / Personal Projects
- "certifications" → Certifications / Licenses / Awards / Credentials
- "other"          → anything else that doesn't fit above

RULES:
1. Copy the content VERBATIM — do not paraphrase, reorder, or reformat lines.
2. Do NOT include the section header line itself (e.g. the word "Experience") in the value.
3. For "basics": include every line before the first named section, exactly as written —
   including pipe-separated contact lines like "john@email.com | +91-9876543210 | Mumbai, India".
4. Return ONLY valid JSON. No markdown fences. No explanation outside the JSON.
5. If a section is empty or absent, omit its key entirely.

Example output:
{
  "basics": "John Smith\\nSoftware Engineer\\njohn@email.com | +1 555-1234 | linkedin.com/in/john | New York, USA",
  "summary": "Experienced software engineer with 7+ years...",
  "experience": "Senior Engineer | Acme Corp | Jan 2020 – Present\\n- Led team of 5 engineers\\n- Built CI/CD pipeline",
  "skills": "Python, TypeScript, AWS, Docker, Kubernetes",
  "education": "B.S. Computer Science | MIT | 2016"
}`;

// ── Per-section optimizer ──────────────────────────────────────────────────
const SECTION_OPTIMIZER_PROMPT = `You are an expert ATS resume optimization specialist with strict fact preservation rules.
You will receive ONE SECTION of a resume to optimize.

===== CORE RULES (MANDATORY) =====

FACTS (NEVER CHANGE):
- Company names, job titles, designations, employment dates (exact months/years)
- Degree names, institution names, graduation dates
- Email addresses, phone numbers, locations, LinkedIn/GitHub URLs
- Any line with the pattern: "Title | Company | Date" or "Company, Title (Year–Year)"
- Marked lines with [HEADER - DO NOT MODIFY]

CONTENT (YOU CAN IMPROVE):
- Bullet points describing achievements under each role
- Summary paragraphs and prose
- Skills list items
- Project descriptions

===== SECTION-SPECIFIC RULES =====

FOR BASICS SECTION:
- Return exactly as-is. NO changes whatsoever.

FOR EDUCATION SECTION:
- Return exactly as-is. NO changes whatsoever.

FOR EXPERIENCE SECTION:
- Role HEADER lines (containing company, title, dates) MUST be reproduced CHARACTER-FOR-CHARACTER.
- Role headers MUST appear on their own line — do NOT merge with bullets.
- ONLY modify/add BULLET POINT lines (starting with - or •).
- Preserve header line order exactly.
- Do NOT convert to prose. Do NOT merge roles. Do NOT add new role entries.
- For each role, you may: enhance existing bullets (add metrics, keywords, impact), add 1-2 new relevant bullets, or rephrase for clarity.
- Always retain the original header verbatim.

FOR SUMMARY SECTION:
- Rewrite to emphasize JD-aligned keywords while keeping tone professional and length similar (±10%).
- Preserve any factual claims (years of experience, specific technologies, proven achievements).

FOR SKILLS SECTION:
- Expand to include ALL relevant keywords from the JD that the candidate plausibly possesses.
- Keep ALL existing skills.
- Use EXACT keyword spelling (e.g., "CI/CD", not "continuous integration").
- Organize as comma-separated or bullet list (match input format).

FOR CERTIFICATIONS/PROJECTS SECTIONS:
- Enhance descriptions with JD keywords where applicable.
- Do NOT remove or fabricate any certifications.

===== GENERAL RULES =====

1. KEYWORD INTEGRATION: Weave provided MISSING KEYWORDS naturally — only where truthful.
2. Output plain text only — no markdown, no **, no HTML, no bold formatting.
3. No excessive whitespace. Single blank line between bullets/roles.
4. If a role header appears multiple times in input, PRESERVE EACH one verbatim.

Return a JSON object:
{
  "optimized_content": "<optimized plain text for this section — preserve all FACTS exactly>",
  "changes": ["<brief description of changes made>"]
}`;

const JD_KEYWORD_EXTRACTION_PROMPT = `You are an expert ATS (Applicant Tracking System) keyword extraction engine.
Your ONLY job: extract the top 30 most important, role-specific technical keywords from the given job description.

=== WHAT TO EXTRACT (these are GOOD keywords) ===
- Programming languages: Python, Java, TypeScript, C++, Rust, Go, R, etc.
- Frameworks & libraries: React, FastAPI, Django, Spring Boot, TensorFlow, PyTorch, etc.
- Databases & data stores: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, Snowflake, etc.
- Cloud & DevOps tools: AWS, Azure, GCP, Docker, Kubernetes, Terraform, CI/CD, Jenkins, etc.
- Domain methodologies: Agile, Scrum, Kanban, TDD, BDD, REST, GraphQL, microservices, etc.
- Industry-specific skills: NLP, machine learning, deep learning, data pipelines, ETL, LLM fine-tuning, RAG, etc.
- Certifications & standards: PMP, AWS Certified, CFA, ISO 27001, GDPR compliance, etc.
- Specific hard skills: financial modeling, statistical analysis, A/B testing, SEO optimization, etc.

=== WHAT NEVER TO EXTRACT (these are BAD keywords — you are BANNED from including them) ===
- Action verbs: manage, develop, build, lead, collaborate, deliver, coordinate, implement, execute, drive, ensure, support, improve, analyze, create, define, maintain, research, review, design, participate, contribute, work, own, look, enable, help, grow, achieve, utilize, apply, care, evaluate, identify, involve, require, allow
- Present participles (gerunds ending in -ing): building, leading, managing, looking, owning, doing, collaborating, driving, ensuring, shipping, working, learning, growing, delivering
- Soft skills & culture words: communication, leadership, team player, problem-solving, ownership, passion, fast-paced, diverse, inclusive, mission-driven, innovative, collaborative, self-motivated, curious, results-driven, proactive, adaptable, detail-oriented
- Generic nouns with no specificity: team, role, people, customer, client, business, product, company, mission, opportunity, environment, culture, success, impact, value, region, office, experience, skills, background, knowledge, ability, understanding
- Adjectives: strong, good, great, excellent, high, low, fast, deep, broad, large, global, new, modern, senior, junior, mid-level, entry-level, full-time, remote, hybrid
- Time/number words: years, months, experience of, plus, minimum, at least
- Company names: any specific company name that appears in the JD (e.g. "Google", "Amazon", "Revolut")

=== RULES ===
1. Return EXACTLY a JSON array of strings, all lowercase. No explanation, no markdown, no extra text.
2. Maximum 30 keywords. Rank by importance to the role (most critical first).
3. Multi-word phrases are fine if they are specific (e.g. "machine learning", "data pipeline", "cloud infrastructure").
4. Deduplicate similar terms (e.g. keep only "postgresql" not both "postgresql" and "postgres").
5. If no valid technical keywords exist in the JD, return an empty array: []

Example output for a backend engineer JD:
["python", "fastapi", "postgresql", "redis", "docker", "kubernetes", "aws", "rest api", "microservices", "sql", "agile", "ci/cd", "machine learning", "data modeling", "asyncio"]`;

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert career coach and professional cover letter writer. You create compelling, personalized cover letters that pass ATS screening and impress hiring managers.

Rules:
1. Write in the specified tone (professional, enthusiastic, confident, or creative)
2. Match the specified length (short: ~200 words, medium: ~350 words, long: ~500 words)
3. Include a strong opening hook referencing the specific role
4. Highlight 2-3 most relevant accomplishments from the resume
5. End with a clear call to action
6. Use ATS-safe formatting (no special characters)
7. Naturally incorporate key terms from the job description
8. MUST follow a standard formal business letter layout EXACTLY.

Format Template:
[Applicant Name]
[Applicant Address/City - from resume if available]
[Applicant Phone - from resume if available]
[Applicant Email - from resume if available]

{current_date}

Hiring Manager
[Company Name]

Dear Hiring Manager / [Company Name] Team,

[Body Paragraph 1: Hook and intention to apply]

[Body Paragraph 2: Key relevant achievements aligning with the JD]

[Body Paragraph 3: Cultural fit or secondary achievements]

[Body Paragraph 4: Call to action and thank you]

Sincerely,
[Applicant Name]

Return ONLY the cover letter text formatted as shown above, ready to copy-paste. Fill in ALL brackets with the actual information provided.`;

function cleanJsonString(text: string): string {
  // Strip markdown wrappers
  if (text.startsWith("```json")) text = text.slice(7);
  else if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  text = text.trim();

  // Escape unescaped newlines inside strings
  text = text.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/\n/g, "\\n").replace(/\r/g, "")
  );

  // Remove trailing commas
  text = text.replace(/,\s*}/g, "}");
  text = text.replace(/,\s*]/g, "]");

  return text;
}

function parseOptimizeResponse(raw: string): {
  optimized_text: string;
  changes_summary: string[];
} {
  try {
    return JSON.parse(cleanJsonString(raw));
  } catch (e) {
    console.warn(`JSON Parsing failed: ${e}\nRaw output: ${raw.slice(0, 500)}`);
    const match = raw.match(/"optimized_text"\s*:\s*"([\s\S]*?)(?:"\s*,|$)/);
    const extracted = match
      ? match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
      : raw.replace("```json", "").replace("```", "").trim();
    return {
      optimized_text: extracted,
      changes_summary: [
        "Failed to parse structured changes. Optimized text retrieved via fallback.",
      ],
    };
  }
}

function stripMarkdown(text: string): string {
  text = text.trim();
  if (text.startsWith("```")) {
    const firstNewline = text.indexOf("\n");
    text = firstNewline !== -1 ? text.slice(firstNewline + 1) : text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }
  return text.trim();
}

async function fetchGroqWithFallback(client: Groq, options: any): Promise<string> {
  // Ordered from best quality to highest rate-limit fallback
  // Using exact models specified by user (assuming custom endpoint configuration)
  const models = [
    config.groqModel,
    "openai/gpt-oss-120b",
    "qwen/qwen3-32b"
  ];
  let lastError: any = null;
  
  // Deduplicate in case config.groqModel is one of the fallbacks
  const uniqueModels = Array.from(new Set(models));

  for (const model of uniqueModels) {
    try {
      const response = await client.chat.completions.create({
        ...options,
        model: model,
      });
      return response.choices[0].message.content || "";
    } catch (e: any) {
      console.warn(`Groq model ${model} failed: ${e.message}. Trying next fallback...`);
      lastError = e;
    }
  }
  
  throw lastError || new Error("All Groq models failed.");
}

export async function extractKeywordsFromJdAi(
  jdText: string
): Promise<string[]> {
  const prompt = `${JD_KEYWORD_EXTRACTION_PROMPT}\n\nJOB DESCRIPTION:\n${String(jdText).slice(0, 5000)}`;
  try {
    if (useGroq()) {
      const client = getGroqClient();
      const raw = await fetchGroqWithFallback(client, {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });
      
      const parsed = JSON.parse(raw);
      let keywords: string[];
      if (Array.isArray(parsed)) {
        keywords = parsed;
      } else {
        // Groq JSON mode wraps array in an object; unwrap
        keywords =
          Object.values(parsed).find((v) => Array.isArray(v)) as string[] || [];
      }
      return keywords.filter(Boolean).map((k: any) => String(k).toLowerCase());
    } else {
      const model = getGeminiModel();
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      const raw = result.response.text();
      const parsed = JSON.parse(cleanJsonString(raw));
      const keywords = Array.isArray(parsed) ? parsed : [];
      return keywords.filter(Boolean).map((k: any) => String(k).toLowerCase());
    }
  } catch (e) {
    console.error(`AI Keyword Extraction failed: ${e}`);
    return [];
  }
}

// ── Internal: deterministic regex-based section splitter (no AI) ───────────
// Comprehensive list of section header variations
const SECTION_HEADER_MAP: Record<string, string> = {
  // Summary
  "summary": "summary",
  "professional summary": "summary",
  "career summary": "summary",
  "executive summary": "summary",
  "about me": "summary",
  "introduction": "summary",
  "professional profile": "summary",
  "overview": "summary",
  // Experience
  "experience": "experience",
  "work experience": "experience",
  "professional experience": "experience",
  "employment history": "experience",
  "work history": "experience",
  "career history": "experience",
  "relevant experience": "experience",
  "professional background": "experience",
  "experience summary": "experience",
  // Education
  "education": "education",
  "academic background": "education",
  "educational background": "education",
  "education & training": "education",
  "education and training": "education",
  "academic qualifications": "education",
  "qualifications": "education",
  // Skills
  "skills": "skills",
  "technical skills": "skills",
  "core competencies": "skills",
  "key skills": "skills",
  "technologies": "skills",
  "technical expertise": "skills",
  "skills & technologies": "skills",
  "skills and technologies": "skills",
  "competencies": "skills",
  "technical competencies": "skills",
  // Projects
  "projects": "projects",
  "personal projects": "projects",
  "academic projects": "projects",
  "key projects": "projects",
  "notable projects": "projects",
  // Certifications
  "certifications": "certifications",
  "certifications & courses": "certifications",
  "certifications and courses": "certifications",
  "certificates": "certifications",
  "professional certifications": "certifications",
  "awards & certifications": "certifications",
  "licenses": "certifications",
  "credentials": "certifications",
};

function isSectionHeader(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Skip lines that are clearly content:
  // - Starts with a bullet character (normalized in cleanText)
  if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) return null;

  // - Contains sentence-like content?
  //   We allow trailing periods/colons (common in PDFs),
  //   but reject if period is followed by space and more characters (a sentence).
  if (/[.!?]\s+[A-Z0-9]/.test(trimmed)) return null;

  // - Contains @ (email) or looks like a URL
  if (trimmed.includes("@") || /https?:\/\//.test(trimmed)) return null;

  // - Contains numbers (usually not in headers, but can appear in dates or years — skip if year-like)
  if (/\b(19|20)\d{2}\b/.test(trimmed)) return null;  // Skip lines with years
  if (/\d{1,2}[/-]\d{1,2}[/-]\d{4}/.test(trimmed)) return null;  // Skip dates

  // - Too long to be a header (but allow up to 80 chars for longer titles)
  if (trimmed.length > 80) return null;

  const normalized = trimmed.toLowerCase().replace(/[:.\s]+$/, "").trim();

  // Exact match in our map
  if (SECTION_HEADER_MAP[normalized]) return SECTION_HEADER_MAP[normalized];

  // Partial match: check if normalized starts with any known section keyword
  // This helps with variations like "SKILLS - TECHNICAL" → "skills"
  for (const [key, sectionName] of Object.entries(SECTION_HEADER_MAP)) {
    if (key.length >= 4 && normalized.startsWith(key)) {
      return sectionName;
    }
  }

  // All-caps match (many resumes use ALL CAPS headers like "WORK EXPERIENCE")
  if (trimmed === trimmed.toUpperCase() && /^[A-Z][A-Z\s&-]{2,}$/.test(trimmed)) {
    const lowerKey = trimmed.toLowerCase().replace(/[:.]$/, "").trim();
    if (SECTION_HEADER_MAP[lowerKey]) {
      return SECTION_HEADER_MAP[lowerKey];
    }
  }

  return null;
}

function extractSectionsFromText(resumeText: string): Record<string, string> {
  const lines = resumeText.split("\n");

  const sections: Record<string, string[]> = {};
  let currentSection: string | null = null; // null = basics (before first header)
  let basicsLines: string[] = [];
  let foundFirstSection = false;

  for (const rawLine of lines) {
    const detected = isSectionHeader(rawLine);

    if (detected) {
      foundFirstSection = true;
      currentSection = detected;
      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      if (!foundFirstSection) {
        basicsLines.push(rawLine);
      } else if (currentSection) {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(rawLine);
      }
    }
  }

  const result: Record<string, string> = {};

  const basicsJoined = basicsLines.join("\n").trim();
  if (basicsJoined) result["basics"] = basicsJoined;

  for (const [key, contentLines] of Object.entries(sections)) {
    const joined = contentLines.join("\n").trim();
    if (joined) result[key] = joined;
  }

  return result;
}

// ── Helper: detect role header lines in experience sections ──────────────
function detectRoleHeaders(text: string): Map<number, string> {
  const headers = new Map<number, string>();
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    const t = line.trim();
    // Skip bullets and empty lines
    if (!t || t.startsWith("-") || t.startsWith("•") || t.startsWith("*")) return;

    // Pattern 1: "Title | Company | Date" or "Company | Title | Date"
    if (t.includes("|") && /\d{4}|present|current/i.test(t) && t.length < 150) {
      headers.set(i, t);
      return;
    }

    // Pattern 2: "Title, Company (Jan 2020 – Mar 2023)" or "Engineer @ Company, 2020-2023"
    if (
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b.*\d{4}/i.test(t) &&
      t.length < 150
    ) {
      headers.set(i, t);
      return;
    }

    // Pattern 3: Single line with year range "2020 - 2023" or "2020-2024" (but > 10 chars to exclude random years)
    if (/\d{4}\s*[-–—]\s*\d{4}|present|current/i.test(t) && t.length < 120 && t.length > 10) {
      // Only if line doesn't look like a bullet or sub-item
      if (!/^[\s]*[-–—•*]/.test(line)) {
        headers.set(i, t);
      }
    }
  });

  return headers;
}

// ── Helper: restore role headers to ensure they are preserved ──────────────
function restoreRoleHeaders(optimizedText: string, originalHeaders: Map<number, string>): string {
  const optimizedLines = optimizedText.split("\n");
  const originalLines = Array.from(originalHeaders.values());

  // For each expected role header, check if it appears in the optimized version
  // If not found or altered, insert it back in the correct position
  let result = optimizedLines.slice();

  for (const [index, originalHeader] of originalHeaders.entries()) {
    // Check if this header appears anywhere in the optimized text
    const headerFound = result.some(line => line.trim() === originalHeader);

    if (!headerFound) {
      // Header was lost or modified; restore it
      // Best effort: insert at the same relative position if possible
      if (index < result.length) {
        // Replace the line at this position if it's not a bullet
        const lineAtIndex = result[index]?.trim() || "";
        if (!lineAtIndex.startsWith("-") && !lineAtIndex.startsWith("•") && lineAtIndex) {
          result[index] = originalHeader;
        } else {
          // Insert before the first bullet
          result.splice(index, 0, originalHeader);
        }
      } else {
        result.push(originalHeader);
      }
    }
  }

  return result.join("\n").trim();
}

// ── AI-based section extraction with fallback ──────────────────────────────
async function extractSectionsWithAI(
  resumeText: string
): Promise<Record<string, string>> {
  // For now, use regex extraction as primary since it's more reliable
  // AI extraction can be added later with better prompt engineering
  const sections = extractSectionsFromText(resumeText);

  // Validate extraction - if sections are empty or look wrong, try to improve
  if (Object.keys(sections).length <= 1 || !sections.experience) {
    // Try AI extraction as fallback if regex extraction failed
    const prompt = `${SECTION_EXTRACTION_PROMPT}\n\nRESUME TEXT:\n${String(resumeText).slice(0, 6000)}`;
    try {
      if (useGroq()) {
        const client = getGroqClient();
        const raw = await fetchGroqWithFallback(client, {
          messages: [{ role: "user", content: prompt }],
          temperature: 0.05,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(cleanJsonString(raw));
        if (typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 1) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("AI section extraction also failed:", e);
    }
  }

  // Return regex extraction results
  return sections;
}

// ── Internal: optimize a single named section ──────────────────────────────
async function optimizeSingleSection(
  sectionName: string,
  sectionContent: string,
  jdText: string,
  missingKeywords: string[]
): Promise<{ optimized_content: string; changes: string[] }> {
  // Basics and Education are kept verbatim
  if (sectionName === "basics" || sectionName === "education") {
    return { optimized_content: sectionContent, changes: [] };
  }

  const kwList = missingKeywords.slice(0, 25);
  const kwSection = kwList.length
    ? kwList.map((kw) => `  - ${kw}`).join("\n")
    : "  (none)";

  // For EXPERIENCE section: detect and protect role headers
  let roleHeaders: Map<number, string> = new Map();
  let headerProtectionNote = "";

  if (sectionName === "experience") {
    roleHeaders = detectRoleHeaders(sectionContent);
    if (roleHeaders.size > 0) {
      headerProtectionNote = `\n=== ROLE HEADER LINES THAT MUST NOT BE CHANGED ===
${Array.from(roleHeaders.values())
  .map((h, idx) => `${idx + 1}. ${h}`)
  .join("\n")}

These lines MUST appear exactly as shown above in the output with no changes to company name, job title, or dates.
`;
    }
  }

  const userContent = `=== SECTION NAME: ${sectionName.toUpperCase()} ===

=== MISSING JD KEYWORDS (integrate where applicable) ===
${kwSection}

=== JOB DESCRIPTION (for context, up to 3500 chars) ===
${String(jdText).slice(0, 3500)}
${headerProtectionNote}

=== SECTION CONTENT TO OPTIMIZE ===
${sectionContent}`;

  let raw: string;
  try {
    if (useGroq()) {
      const client = getGroqClient();
      raw = await fetchGroqWithFallback(client, {
        messages: [
          { role: "system", content: SECTION_OPTIMIZER_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.35,
        max_tokens: 3500,
        response_format: { type: "json_object" },
      });
    } else {
      const model = getGeminiModel();
      const fullPrompt = `${SECTION_OPTIMIZER_PROMPT}\n\n${userContent}`;
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });
      raw = result.response.text();
    }
    const parsed = JSON.parse(cleanJsonString(raw));
    let optimizedContent = parsed.optimized_content || sectionContent;

    // Post-process: restore role headers if needed (EXPERIENCE section)
    if (sectionName === "experience" && roleHeaders.size > 0) {
      optimizedContent = restoreRoleHeaders(optimizedContent, roleHeaders);
    }

    // Clean up any placeholder text that might have leaked into the output
    optimizedContent = optimizedContent
      .replace(/\[HEADER\s*[-–—]\s*DO\s+NOT\s+MODIFY\]:\s*/gi, "")
      .replace(/^=== ROLE HEADER.*/gm, "")
      .replace(/^These lines MUST appear.*/gm, "");

    return {
      optimized_content: optimizedContent.trim(),
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    };
  } catch (e) {
    console.warn(`Section "${sectionName}" optimization failed, keeping original:`, e);
    return { optimized_content: sectionContent, changes: [] };
  }
}

// ── Public: section-wise optimizer (new primary entry point) ───────────────
export async function optimizeResumeSectional(
  resumeText: string,
  jdText: string,
  missingKeywords: string[]
): Promise<{
  optimized_text: string;
  optimized_sections: Record<string, string>;
  changes_summary: string[];
}> {
  // Step 1 – Extract sections (AI-based with regex fallback)
  const rawSections = await extractSectionsWithAI(resumeText);

  // Step 1.1 - Deduplicate basics from other sections (PDF header/footer residue)
  const basicsContent = rawSections["basics"] || "";
  const basicsLines = basicsContent.split("\n").map(l => l.trim()).filter(l => l.length > 3);
  
  const deduplicatedSections: Record<string, string> = { ...rawSections };
  for (const [key, content] of Object.entries(rawSections)) {
    if (key === "basics" || !content) continue;
    
    // Split content into lines and filter out any line that exactly matches a basics line
    const refinedLines = content.split("\n").filter(line => {
      const tl = line.trim();
      if (tl.length < 4) return true;
      return !basicsLines.some(bl => tl === bl || bl.includes(tl) || tl.includes(bl));
    });
    
    deduplicatedSections[key] = refinedLines.join("\n").trim();
  }

  // Canonical section order for reassembly
  const SECTION_ORDER = ["basics", "summary", "experience", "skills", "education", "projects", "certifications", "other"];

  // Include any extra keys from our extraction
  const allKeys = Array.from(
    new Set([...SECTION_ORDER, ...Object.keys(deduplicatedSections)])
  ).filter((k) => deduplicatedSections[k]);

  const kwList = (missingKeywords || []).slice(0, 20);

  // Step 2 – Optimize each section (in parallel for speed)
  const optimized: Record<string, string> = {};
  const allChanges: string[] = [];

  await Promise.all(
    allKeys.map(async (sectionName) => {
      const content = deduplicatedSections[sectionName];
      if (!content?.trim()) return;
      const res = await optimizeSingleSection(sectionName, content, jdText, kwList);
      optimized[sectionName] = res.optimized_content;
      allChanges.push(...res.changes);
    })
  );

  // Step 3 – Reassemble into a full plain-text resume
  const headerLabels: Record<string, string> = {
    summary: "SUMMARY",
    experience: "WORK EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    projects: "PROJECTS",
    certifications: "CERTIFICATIONS",
    other: "",
  };

  let fullText = "";
  for (const key of allKeys) {
    if (!optimized[key]?.trim()) continue;
    if (key === "basics") {
      fullText += optimized[key] + "\n\n";
    } else {
      const header = headerLabels[key] ?? key.toUpperCase();
      fullText += header + "\n" + optimized[key] + "\n\n";
    }
  }

  return {
    optimized_text: fullText.trim(),
    optimized_sections: optimized,
    changes_summary: allChanges.length ? allChanges : ["Resume optimized for ATS keyword alignment."],
  };
}

// ── Legacy single-call optimizer (kept for backward compat) ────────────────
export async function optimizeResume(
  resumeText: string,
  jdText: string,
  missingKeywords: string[]
): Promise<{ optimized_text: string; changes_summary: string[] }> {
  const result = await optimizeResumeSectional(resumeText, jdText, missingKeywords);
  return {
    optimized_text: result.optimized_text,
    changes_summary: result.changes_summary,
  };
}

export async function generateCoverLetter(
  resumeText: string,
  jdText: string,
  tone: string = "professional",
  length: string = "medium",
  applicantName?: string | null,
  companyName?: string | null,
  jobTitle?: string | null
): Promise<string> {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const systemPrompt = COVER_LETTER_SYSTEM_PROMPT.replace(
    "{current_date}",
    currentDate
  );
  const userContent = `Write a ${length} cover letter in a ${tone} tone.

Applicant Name: ${applicantName || "the applicant"}
Company: ${companyName || "the company"}
Job Title: ${jobTitle || "the position"}

JOB DESCRIPTION:
${jdText.slice(0, 2500)}

RESUME HIGHLIGHTS:
${resumeText.slice(0, 2500)}

Write the cover letter now:`;

  let text: string;

  if (useGroq()) {
    const client = getGroqClient();
    text = await fetchGroqWithFallback(client, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
  } else {
    const ai = new GoogleGenerativeAI(config.geminiApiKey);
    const model = ai.getGenerativeModel({
      model: config.geminiChatModel,
      generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
    });
    const fullPrompt = `${systemPrompt}\n\n${userContent}`;
    const result = await model.generateContent(fullPrompt);
    text = result.response.text();
  }

  return stripMarkdown(text);
}
