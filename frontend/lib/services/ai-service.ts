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

// ── Contact Information Extraction (AI-based) ──────────────────────────────
const CONTACT_EXTRACTION_PROMPT = `You are an expert at extracting structured contact information from resume headers.
Given the "basics" section of a resume, extract the following fields:
- name: Full name of the candidate
- title: Job title / position label (e.g., "Software Engineer", "Data Scientist")
- email: Email address
- phone: Phone number (in any format)
- location: City, Country or City, State
- website: LinkedIn, GitHub, or personal website URL

Return ONLY a JSON object with these exact keys. If a field is not found, omit it (but "name" is required).
Parse the basics text carefully - information can be on separate lines or pipe/comma-separated on one line.

Example:
{
  "name": "John Smith",
  "title": "Senior Engineer",
  "email": "john@email.com",
  "phone": "+1-555-1234",
  "location": "New York, USA",
  "website": "linkedin.com/in/john"
}`;

// ── Section extraction ─────────────────────────────────────────────────────
const SECTION_EXTRACTION_PROMPT = `You are a precise resume parser specializing in careful section extraction.
Your task is to split the given resume text into its named sections, preserving all contact information.

Return a JSON object whose keys are the canonical section names from the list below,
and whose values are the VERBATIM text block that belongs to that section.

Canonical section names (use exactly these keys — omit any that are absent from the resume):
- "basics"         → The header block containing: Full Name (REQUIRED), Title/Position, and ALL contact-info
                     This includes: email, phone, location/city, LinkedIn, GitHub, website, or any combo.
                     Capture ALL lines BEFORE the first major section header (Summary, Experience, Education, Skills, etc).
                     CRITICAL: Do NOT omit any line that comes before the first section header.
- "summary"        → Professional Summary / Objective / Profile / About Me
- "experience"     → Work Experience / Employment History / Professional Experience
- "education"      → Education / Academic Background / Qualifications
- "skills"         → Skills / Technical Skills / Core Competencies / Expertise / Technologies
- "projects"       → Projects / Personal Projects / Key Projects
- "certifications" → Certifications / Licenses / Awards / Credentials / Certifications & Courses
- "other"          → anything else that doesn't fit above

RULES:
1. Copy the content VERBATIM — do not paraphrase, reorder, or reformat lines.
2. Do NOT include the section header line itself (e.g. the word "Experience") in the value.
3. For "basics": include EVERY line before the first major section header, no exceptions.
   Even if a line has an email, phone, or looks "structural", if it comes before the first section header, it belongs here.
4. Contact information may appear in many formats:
   - Separate lines: "john@email.com" / "+1 555-1234" / "New York, USA"
   - Pipe-separated: "john@email.com | +1 555-1234 | linkedin.com/in/john | New York, USA"
   - Comma-separated: "john@email.com, +1 555-1234, New York, USA"
   Include ALL of these verbatim in the basics section.
5. Return ONLY valid JSON. No markdown fences. No explanation outside the JSON.
6. If a section is empty or absent, omit its key entirely.

Example output:
{
  "basics": "POORNIMA SONKAR\\nSoftware Engineer\\njohn@email.com | +91-9876543210 | Mumbai, India",
  "summary": "Experienced software engineer with 7+ years...",
  "experience": "Senior Engineer | Acme Corp | Jan 2020 – Present\\n- Led team of 5 engineers\\n- Built CI/CD pipeline",
  "skills": "Python, TypeScript, AWS, Docker, Kubernetes",
  "education": "B.S. Computer Science | MIT | 2016"
}`;

// ── Per-section optimizer ──────────────────────────────────────────────────
const SECTION_OPTIMIZER_PROMPT = `You are an expert ATS resume optimization specialist with STRICT fact preservation rules.
You will receive ONE SECTION of a resume to optimize.

===== CRITICAL CORE RULES (NON-NEGOTIABLE) =====

FACTS THAT MUST NEVER CHANGE:
- Company names, job titles, designations, employment dates (exact months/years)
- Degree names, institution names, graduation dates
- Email addresses, phone numbers, locations, LinkedIn/GitHub URLs
- Any line with role headers: "Title | Company | Date" or "Company, Title (Year–Year)" or similar
- School/degree headers like "B.S. Computer Science | University Name | 2020"
- Marked lines with [ROLE_HEADER_START]...[ROLE_HEADER_END]
- ALL existing certifications, licenses, and credentials (NEVER add fabricated ones)

CONTENT YOU CAN IMPROVE:
- Bullet point descriptions under roles (enhance, reword, add metrics)
- Summary paragraphs and prose sections
- Skills list items
- Project descriptions
- Certification descriptions (descriptions only, NEVER add new certs)

===== SECTION-SPECIFIC RULES =====

FOR BASICS SECTION:
- RETURN EXACTLY AS-IS. NO CHANGES. NOT A SINGLE CHARACTER.
- This section contains: Name, Title, Email, Phone, Location, Links
- Simply output it unchanged.

FOR EDUCATION SECTION:
- RETURN EXACTLY AS-IS. NO CHANGES. Preserve degree names, schools, dates exactly.
- You may reorder bullet points under each degree but NOT the degree headers themselves.

FOR EXPERIENCE SECTION (MOST CRITICAL):
- Preserve EVERY role header verbatim (marked with [ROLE_HEADER_START]...[ROLE_HEADER_END]).
- Remove the markers [ROLE_HEADER_START] and [ROLE_HEADER_END] but keep the header text exactly.
- Output structure for EACH ROLE:
  * Role Header on its own line (character-for-character exact)
  * One blank line after header
  * Bullet points (3-5 bullets starting with "- ")
  * One blank line before next role
- ONLY modify bullet point lines (those starting with - or •)
- DO NOT convert headers to prose. DO NOT merge multiple roles. DO NOT reformat headers.
- For each role's bullets: enhance/reword for clarity, add 1-2 new bullets if missing context, integrate JD keywords naturally.
- Each bullet should start with "- " and describe ONE measurable achievement or responsibility.
- Quantify with metrics/numbers where available (e.g., "improved performance by 40%", "reduced time by 95%").

FOR SUMMARY SECTION:
- Rewrite to emphasize JD-aligned keywords while maintaining professional tone and similar length (±10%).
- Preserve factual claims: years of experience, specific proven technologies, achievements.
- Integrate up to 5-7 missing keywords naturally (only if truthful to the person's background).

FOR SKILLS SECTION:
- Expand to include ALL relevant keywords from the JD that the candidate plausibly possesses.
- Keep ALL existing skills (never remove).
- ORGANIZE BY CATEGORY like this format:
  Programming Languages: Python, Java, TypeScript, Go
  Frameworks & Libraries: React, FastAPI, Django, Spring Boot
  Databases: PostgreSQL, MongoDB, Redis
  Cloud & DevOps: AWS, Docker, Kubernetes
  - Use comma-separated values within each category
  - Put category name followed by colon, then comma-separated skills
  - Leave a blank line between categories
- Use EXACT keyword spelling (e.g., "CI/CD", not "continuous integration").

FOR CERTIFICATIONS SECTION:
- PRESERVE EVERY certification, license, credential EXACTLY as written.
- NEVER fabricate, invent, or add new certifications that weren't in the original resume.
- ONLY enhance the description text if present (e.g., "IQ Bot Developer → Specialized in AI-enhanced document processing...")
- If resume has: "Automation Anywhere Certified Master RPA", keep it EXACTLY. Do NOT add related certs like "UiPath Certified" unless explicitly in the original.
- For certifications with descriptions, you may reword descriptions for clarity but NEVER add new certifications.

===== GENERAL RULES =====

1. KEYWORD INTEGRATION: Weave provided MISSING KEYWORDS naturally into existing content — ONLY where truthful.
2. Output PLAIN TEXT ONLY — no markdown, no **, no HTML, no bold, no formatting.
3. Preserve formatting: If input has "- bullet", keep "- bullet" format. If it has "• bullet", keep "•".
4. Manage whitespace: Single blank line between items/roles, no excessive spacing.
5. NEVER fabricate experience, dates, companies, degrees, skills, or certifications.
6. When in doubt, preserve the original.

Return a JSON object:
{
  "optimized_content": "<optimized plain text for this section — PRESERVE ALL FACTS exactly>",
  "changes": ["<brief description of changes made>", "..."]
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

// ── PHASE 2: Simple regex-based contact information extraction ──────────────
export async function extractContactInfoFromBasics(
  basicsText: string
): Promise<{
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}> {
  if (!basicsText?.trim()) return { name: "" };

  const result: any = {};
  const lines = basicsText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract all tokens (split on pipes, commas, etc.)
  const tokens: string[] = [];
  for (const line of lines) {
    const parts = line
      .split(/\s*[\|,\t]\s*/)
      .map((p) => p.trim())
      .filter(Boolean);
    tokens.push(...parts);
  }

  const usedTokens = new Set<string>();

  // STEP 1: Extract email
  for (const token of tokens) {
    if (!result.email && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(token)) {
      result.email = token;
      usedTokens.add(token);
      break;
    }
  }

  // STEP 2: Extract phone (7+ digits)
  for (const token of tokens) {
    if (
      !result.phone &&
      !token.includes("@") &&
      !token.startsWith("http") &&
      !/linkedin|github/i.test(token)
    ) {
      const digitsOnly = token.replace(/\D/g, "");
      if (digitsOnly.length >= 7 && digitsOnly.length <= 20) {
        result.phone = token;
        usedTokens.add(token);
        break;
      }
    }
  }

  // STEP 3: Extract website/LinkedIn/GitHub
  for (const token of tokens) {
    if (
      !result.website &&
      (token.startsWith("http") || /linkedin\.com|github\.com/i.test(token))
    ) {
      result.website = token;
      usedTokens.add(token);
      break;
    }
  }

  // STEP 4: Extract location (contains comma, no @, no http, no years)
  for (const token of tokens) {
    if (
      !result.location &&
      token.includes(",") &&
      token.length < 50 &&
      !token.includes("@") &&
      !token.startsWith("http") &&
      !/linkedin|github/i.test(token) &&
      !/\d{4}/.test(token)
    ) {
      result.location = token;
      usedTokens.add(token);
      break;
    }
  }

  // STEP 5: Extract name (first unused, non-numeric, substantial token)
  for (const token of tokens) {
    if (usedTokens.has(token)) continue;
    if (
      !result.name &&
      token.length > 2 &&
      !token.includes("@") &&
      !token.startsWith("http") &&
      !/\d{3,}/.test(token) &&
      !token.includes(",")
    ) {
      result.name = token;
      usedTokens.add(token);
      break;
    }
  }

  // STEP 6: Extract title (first remaining short token, likely job title)
  for (const token of tokens) {
    if (usedTokens.has(token)) continue;
    if (
      !result.title &&
      token.length > 2 &&
      token.length < 60 &&
      !token.includes("@") &&
      !token.startsWith("http") &&
      !/\d{4}|linkedin|github/i.test(token) &&
      !token.includes(",")
    ) {
      result.title = token;
      break;
    }
  }

  return result;
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

  // PHASE 3: Stricter section header detection to prevent false positives

  // Skip lines that are clearly content (not headers):
  // - Starts with a bullet character
  if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) return null;

  // - Is a sentence or prose (multiple spaces, sentence punctuation, real words)
  //   Check for: period/exclamation/question followed by space and capital (sentence pattern)
  if (/[.!?]\s+[A-Z][a-z]/.test(trimmed)) return null;
  //   Check for: contains more than 2 words (likely prose, not a header)
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > 6) return null;

  // - Too long to be a header (headers are short, < 80 chars)
  if (trimmed.length > 80) return null;

  // - Contains date patterns (job date ranges) - likely experience content, not a header
  if (/\d{4}\s*[-–—]\s*(\d{4}|present|current)/i.test(trimmed)) return null;

  // - Contains pipes with dates/companies (role header, not section header)
  if (trimmed.includes("|") && /\d{4}|present|current/i.test(trimmed)) return null;

  // - Looks like a company name or job role line (too specific)
  if (/\b(at|company|engineer|developer|manager|analyst|specialist)\b/i.test(trimmed) && wordCount <= 5) {
    // Only if it doesn't match known section names
    const normalized = trimmed.toLowerCase().replace(/[:.\s]+$/, "").trim();
    if (!SECTION_HEADER_MAP[normalized]) return null;
  }

  const normalized = trimmed.toLowerCase().replace(/[:.\s]+$/, "").trim();

  // Exact match in our map (most reliable)
  if (SECTION_HEADER_MAP[normalized]) return SECTION_HEADER_MAP[normalized];

  // Partial match: check if normalized starts with any known section keyword
  // But require minimum 4 chars to avoid false matches like "ski" for "skills"
  for (const [key, sectionName] of Object.entries(SECTION_HEADER_MAP)) {
    if (key.length >= 4 && normalized.startsWith(key) && normalized.length < key.length + 8) {
      return sectionName;
    }
  }

  // All-caps match (many resumes use ALL CAPS headers like "WORK EXPERIENCE")
  // But only if it matches known section names
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
      const trimmed = rawLine.trim();
      if (!trimmed) continue; // Skip empty lines

      if (!foundFirstSection) {
        basicsLines.push(rawLine);
      } else if (currentSection) {
        // PHASE 3: Validate content belongs to this section
        // Prevent experience bullets from appearing in skills
        // Prevent education content in experience
        const isValidForSection = validateSectionContent(trimmed, currentSection);
        if (isValidForSection) {
          if (!sections[currentSection]) sections[currentSection] = [];
          sections[currentSection].push(rawLine);
        } else {
          // Content doesn't match section type - might be a missed header
          const redetected = isSectionHeader(trimmed);
          if (redetected) {
            // This line should actually be a header
            currentSection = redetected;
            if (!sections[currentSection]) sections[currentSection] = [];
          } else {
            // Unknown content - add to current section anyway
            if (!sections[currentSection]) sections[currentSection] = [];
            sections[currentSection].push(rawLine);
          }
        }
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

// ── Helper: Validate that content belongs to a section type ────────────────
function validateSectionContent(line: string, sectionName: string): boolean {
  const trimmed = line.trim();

  // Empty lines are always OK
  if (!trimmed) return true;

  // Bullet points are OK in most sections
  if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) return true;

  // Section-specific validation
  if (sectionName === "experience") {
    // Experience: should have company/title/dates or bullets
    // Accept: lines with dates, "at"/"Company" patterns, or bullets
    if (/\d{4}|present|current|\bat\b|engineer|developer|manager/i.test(trimmed)) {
      console.log(`✅ VALIDATED: Experience line accepted: "${trimmed.substring(0, 50)}..."`);
      return true;
    }
    if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
      console.log(`✅ VALIDATED: Experience bullet accepted: "${trimmed.substring(0, 50)}..."`);
      return true;
    }
    // Reject: lines that look like certifications, education, skills
    if (/bachelor|master|certificate|certified|proficiency|license|skill:/i.test(trimmed)) {
      console.log(`❌ REJECTED: Non-experience line in experience: "${trimmed.substring(0, 50)}..."`);
      return false;
    }
    console.log(`✅ VALIDATED: Experience line (generic): "${trimmed.substring(0, 50)}..."`);
    return true;
  }

  if (sectionName === "education") {
    // Education: should have degree, school, date
    // Accept: lines with years, degree keywords, school names
    if (/bachelor|master|phd|b\.|m\.|degree|university|college|\d{4}/i.test(trimmed)) return true;
    if (trimmed.startsWith("-") || trimmed.startsWith("•")) return true;
    // Reject: work experience bullets
    if (/engineer|developer|manager|designed|implemented|built|led\s+/i.test(trimmed)) return false;
    return true;
  }

  if (sectionName === "skills") {
    // Skills: should be comma-separated or bullets with skills
    // Reject: lines with job titles, dates, company names
    if (/\d{4}[-–—]\d{4}|present|current/.test(trimmed)) return false;
    if (/at\s+[A-Z]|company|inc\.|ltd\.|llc/i.test(trimmed)) return false;
    return true;
  }

  if (sectionName === "certifications") {
    // Certifications: should mention cert, license, award, credential
    // Reject: pure job descriptions
    if (/certificate|certified|license|credential|award|badge/i.test(trimmed)) return true;
    if (trimmed.startsWith("-") || trimmed.startsWith("•")) return true;
    // Single line might be cert name
    if (trimmed.length < 100) return true;
    return false;
  }

  // Default: accept (for summary, projects, other)
  return true;
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
    // This is the most common format for structured resumes
    if (t.includes("|")) {
      // Must have at least a year or "Present"
      if (/\b\d{4}\b|present|current/i.test(t) && t.length < 200) {
        headers.set(i, t);
        return;
      }
    }

    // Pattern 2: "Title, Company (Jan 2020 – Mar 2023)" or variations
    // Look for month abbreviation or full month name followed by year
    if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b.*\d{4}/i.test(t) && t.length < 200) {
      headers.set(i, t);
      return;
    }

    // Pattern 3: "Company, Title, YYYY-YYYY" format
    if (/,.*\d{4}\s*[-–—]\s*(\d{4}|present|current)/i.test(t) && t.length < 200) {
      headers.set(i, t);
      return;
    }

    // Pattern 4: Starts with company name followed by year range
    // e.g., "Acme Corp | 2020 - 2023" or similar
    if (t.includes(",") || t.includes("|")) {
      if (/\d{4}\s*[-–—]\s*(\d{4}|present|current)|present|current/i.test(t) && t.length < 150) {
        headers.set(i, t);
        return;
      }
    }

    // Pattern 5: "Title at Company (Date Range)" - less common but valid
    if (/\sat\s/i.test(t) && /\d{4}|\(.*\)/i.test(t) && t.length < 150) {
      headers.set(i, t);
      return;
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

// ── Section extraction (regex-primary, AI fallback) ─────────────────────────
async function extractSectionsWithAI(
  resumeText: string
): Promise<Record<string, string>> {
  // PHASE 1: Use REGEX-based extraction as PRIMARY (more reliable for boundaries)
  // AI extraction available as optional fallback only
  const sections = extractSectionsFromText(resumeText);

  // DIAGNOSTIC LOG 1: After section extraction
  console.log(
    "🔍 DEBUG: Sections extracted (REGEX-PRIMARY):",
    Object.keys(sections)
  );
  if (sections.basics) {
    console.log("  📋 BASICS content (first 200 chars):", sections.basics.substring(0, 200));
  }
  if (sections.experience) {
    console.log("  📋 EXPERIENCE content (first 300 chars):", sections.experience.substring(0, 300));
  }
  if (sections.skills) {
    console.log("  📋 SKILLS content:", sections.skills);
  }

  // Validate extraction - if sections look incomplete, optionally try AI as fallback
  const hasMinimalContent =
    Object.keys(sections).length >= 2 &&
    (sections.basics || sections.summary || sections.experience);

  if (!hasMinimalContent) {
    console.warn("Regex extraction returned minimal content, trying AI fallback...");
    const prompt = `${SECTION_EXTRACTION_PROMPT}\n\nRESUME TEXT:\n${String(resumeText).slice(0, 8000)}`;

    try {
      if (useGroq()) {
        const client = getGroqClient();
        const raw = await fetchGroqWithFallback(client, {
          messages: [{ role: "user", content: prompt }],
          temperature: 0.02,
          max_tokens: 5000,
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(cleanJsonString(raw));
        if (
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Object.keys(parsed).length >= 2
        ) {
          console.log("AI fallback extraction succeeded");
          return parsed;
        }
      } else {
        const model = getGeminiModel();
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        });
        const raw = result.response.text();
        const parsed = JSON.parse(cleanJsonString(raw));
        if (
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Object.keys(parsed).length >= 2
        ) {
          console.log("AI fallback extraction succeeded");
          return parsed;
        }
      }
    } catch (e) {
      console.warn("AI fallback also failed, using regex result:", e);
    }
  }

  // Return regex extraction (primary result or fallback)
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

  // For EXPERIENCE section: detect and protect role headers with special markers
  let roleHeaders: Map<number, string> = new Map();
  let markedContent = sectionContent;

  if (sectionName === "experience") {
    roleHeaders = detectRoleHeaders(sectionContent);
    if (roleHeaders.size > 0) {
      // Mark role headers with special markers so AI can identify them
      let lines = sectionContent.split("\n");
      const sortedIndices = Array.from(roleHeaders.keys()).sort((a, b) => b - a); // Process in reverse to maintain indices
      for (const idx of sortedIndices) {
        lines[idx] = `[ROLE_HEADER_START]${roleHeaders.get(idx)}[ROLE_HEADER_END]`;
      }
      markedContent = lines.join("\n");
    }
  }

  const userContent = `=== SECTION NAME: ${sectionName.toUpperCase()} ===

=== MISSING JD KEYWORDS (integrate naturally where applicable) ===
${kwSection}

=== JOB DESCRIPTION (for context) ===
${String(jdText).slice(0, 3500)}

=== SECTION CONTENT TO OPTIMIZE ===
${markedContent}

${
  sectionName === "experience"
    ? `\nIMPORTANT: Lines marked with [ROLE_HEADER_START]...[ROLE_HEADER_END] contain company name, job title, and dates.
PRESERVE these EXACTLY character-for-character. Remove the markers but keep the content unchanged.
Optimize only the bullet points (lines starting with - or •) below each role header.`
    : ""
}`;

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

    // Clean up role header markers and instruction artifacts
    optimizedContent = optimizedContent
      .replace(/\[ROLE_HEADER_START\]/g, "")
      .replace(/\[ROLE_HEADER_END\]/g, "")
      .replace(/\[HEADER\s*[-–—]\s*DO\s+NOT\s+MODIFY\]:\s*/gi, "")
      .replace(/^=== ROLE HEADER.*/gm, "")
      .replace(/^=== MISSING JD KEYWORDS.*/gm, "")
      .replace(/^=== JOB DESCRIPTION.*/gm, "")
      .replace(/^=== SECTION CONTENT.*/gm, "")
      .replace(/^These lines MUST appear.*/gm, "")
      .replace(/^IMPORTANT:.*$/gm, "")
      .replace(/^\- Do NOT|^Programming Languages:|^Frameworks|^Databases:|^Cloud|^Certifications:|^PRESERVE|^NEVER|^Only|^Use EXACT|^ORGANIZE/gm, "")
      .replace(/^\s*For each role|^\s*Each bullet|^\s*Quantify with|^\s*Leave a blank/gm, "")
      .trim();

    // PHASE 4: Apply simple formatting for experience section
    // (just adds spacing, doesn't reorganize content)
    if (sectionName === "experience" && roleHeaders.size > 0) {
      optimizedContent = formatExperienceSection(optimizedContent);
    }

    // For certifications section, ensure we don't have instruction artifacts
    if (sectionName === "certifications") {
      const lines = optimizedContent.split("\n");
      const cleanedLines = lines.filter(l => {
        const trimmed = l.trim();
        // Remove lines that look like instructions
        return !(
          /^(PRESERVE|NEVER|Only|For|When in doubt|If you|ALWAYS|DO NOT|CRITICAL|RULES|Do NOT add|new certs|ONLY enhance)/i.test(
            trimmed
          ) || trimmed.length > 200 // Remove overly long lines that might be copy-pasted prompts
        );
      });
      optimizedContent = cleanedLines.join("\n").trim();
    }

    return {
      optimized_content: optimizedContent.trim(),
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    };
  } catch (e) {
    console.warn(`Section "${sectionName}" optimization failed, keeping original:`, e);
    return { optimized_content: sectionContent, changes: [] };
  }
}

// ── PHASE 4: Simple work experience formatting (minimal changes) ──────────────
function formatExperienceSection(text: string): string {
  // PHASE 4: Minimal formatting - preserve text structure, just fix spacing
  const lines = text.split("\n");
  const result: string[] = [];
  let lastLineWasHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Is this a role header? (has dates and company/title info)
    const isRoleHeader =
      trimmed.includes("|") ||
      /\d{4}\s*[-–—]\s*(\d{4}|present|current)/i.test(trimmed);

    if (isRoleHeader) {
      // Add blank line before header (except first)
      if (result.length > 0) {
        result.push("");
      }
      result.push(trimmed);
      lastLineWasHeader = true;
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
      // Bullet point
      result.push(trimmed);
      lastLineWasHeader = false;
    } else {
      // Regular content - add blank line after header if needed
      if (lastLineWasHeader && trimmed && !trimmed.startsWith("-")) {
        result.push(""); // Blank line after header
      }
      result.push(trimmed);
      lastLineWasHeader = false;
    }
  }

  return result.join("\n").trim();
}

// ── PHASE 5: Helper to categorize skills ──────────────────────────────────
function categorizeSkills(skillsText: string): string {
  // PHASE 5: Post-process skills section to organize by category
  // Only if text looks like a flat list (comma or semicolon-separated)
  // Skip if already formatted with categories

  if (!skillsText?.trim()) return skillsText;

  // Check if already categorized (has colons indicating categories)
  if ((skillsText.match(/:/g) || []).length >= 2) {
    return skillsText; // Already formatted
  }

  // Parse skills (comma, semicolon, or bullet-separated)
  const skills = skillsText
    .split(/[,;•\-\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50 && !/^\d+/.test(s));

  if (skills.length < 5) {
    return skillsText; // Too few skills, not worth categorizing
  }

  // Categorize each skill
  const categories: Record<string, string[]> = {
    "Programming Languages": [],
    "Frameworks & Libraries": [],
    "Databases & Data": [],
    "Cloud & DevOps": [],
    "Other": [],
  };

  const skillPatterns: Record<string, RegExp[]> = {
    "Programming Languages": [
      /^(python|java|c\+\+|c#|javascript|typescript|ruby|go|rust|php|kotlin|swift|scala|r|perl)$/i,
    ],
    "Frameworks & Libraries": [
      /^(react|vue|angular|fastapi|django|flask|spring|springboot|rails|express|asp\.net|nextjs|nuxt|tensorflow|pytorch|torch)$/i,
    ],
    "Databases & Data": [
      /^(postgresql|mysql|mongodb|redis|elasticsearch|dynamodb|cassandra|sql|snowflake|bigquery|datawarehouse)$/i,
    ],
    "Cloud & DevOps": [
      /^(aws|azure|gcp|docker|kubernetes|jenkins|terraform|ci\/cd|gitlab|github|circleci)$/i,
    ],
  };

  // Assign skills to categories
  for (const skill of skills) {
    let assigned = false;
    for (const [category, patterns] of Object.entries(skillPatterns)) {
      if (patterns.some((p) => p.test(skill))) {
        categories[category].push(skill);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      categories["Other"].push(skill);
    }
  }

  // Build categorized output
  const output: string[] = [];
  for (const [category, skillList] of Object.entries(categories)) {
    if (skillList.length > 0) {
      output.push(`${category}: ${skillList.join(", ")}`);
    }
  }

  return output.length > 0 ? output.join("\n") : skillsText;
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
  // But be careful: only remove truly duplicate header info, not legitimate content
  const basicsContent = rawSections["basics"] || "";
  const basicsLines = basicsContent
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 3);

  const deduplicatedSections: Record<string, string> = { ...rawSections };
  const basicsPatternsToRemove = [
    // Only remove common header-like patterns: name, email, phone, location
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, // Email
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, // Phone
    /^https?:\/\//, // URLs/LinkedIn
  ];

  for (const [key, content] of Object.entries(rawSections)) {
    if (key === "basics" || !content) continue;

    // Only deduplicate for sections that shouldn't have contact info
    if (!["experience", "education", "skills", "certifications"].includes(key)) continue;

    const refinedLines = content.split("\n").filter(line => {
      const tl = line.trim();
      if (tl.length < 4) return true;

      // Check if this line matches a basics pattern
      for (const pattern of basicsPatternsToRemove) {
        if (pattern.test(tl)) return false;
      }

      // Also check against exact basics lines (but be lenient - only exact matches for full lines)
      return !basicsLines.some(bl => tl === bl);
    });

    deduplicatedSections[key] = refinedLines.join("\n").trim();
  }

  // PHASE 2: Extract contact info in parallel (non-blocking)
  // Start extraction but don't wait for it - optimization continues
  let contactInfoPromise = Promise.resolve({});
  if (basicsContent) {
    // Fire-and-forget: extract in background
    console.log("🔍 DEBUG: Extracting contact info from basics section");
    contactInfoPromise = extractContactInfoFromBasics(basicsContent)
      .then((info) => {
        console.log("✅ Contact extraction result:", info);
        return info;
      })
      .catch((e) => {
        console.warn("❌ Contact extraction failed (non-blocking):", e);
        return {};
      });
  } else {
    console.warn("⚠️ DEBUG: No basics content found for contact extraction");
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

      console.log(`🔍 DEBUG: Optimizing ${sectionName} section (first 200 chars):`, content.substring(0, 200));

      const res = await optimizeSingleSection(sectionName, content, jdText, kwList);
      let optimizedContent = res.optimized_content;

      console.log(`✅ Optimized ${sectionName} section (first 200 chars):`, optimizedContent.substring(0, 200));

      // PHASE 5: Categorize skills if applicable
      if (sectionName === "skills") {
        try {
          optimizedContent = categorizeSkills(optimizedContent);
        } catch (e) {
          console.warn("Skill categorization failed, using original:", e);
          // Fallback to non-categorized version
        }
      }

      optimized[sectionName] = optimizedContent;
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

  // Step 4 - Resolve contact info promise (after optimization completes)
  const contactInfo = await contactInfoPromise;

  // Step 5 - Return optimized data along with extracted contact info for UI consumption
  const result = {
    optimized_text: fullText.trim(),
    optimized_sections: optimized,
    changes_summary: allChanges.length ? allChanges : ["Resume optimized for ATS keyword alignment."],
  };

  // Attach contact info as metadata (if available)
  if (contactInfo && Object.keys(contactInfo).length > 0) {
    (result as any).contact_info = contactInfo;
  }

  return result;
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
