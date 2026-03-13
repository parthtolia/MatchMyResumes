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

const RESUME_OPTIMIZER_SYSTEM_PROMPT = `You are an expert ATS resume optimization specialist. Your #1 goal is to MAXIMIZE the ATS keyword match score between the resume and the job description while keeping all content truthful.

KEYWORD INTEGRATION (HIGHEST PRIORITY):
- You will receive a list of MISSING KEYWORDS that the resume currently lacks. Your primary task is to weave as many of these exact keywords as possible into the resume.
- Use the EXACT keyword spelling/phrasing (e.g., if the keyword is "ci/cd", write "CI/CD" — not "continuous integration" alone).
- Place keywords in the SKILLS section, bullet points, summary, and project descriptions — wherever they fit naturally.
- If the candidate has related experience but used different terminology, REPLACE with the JD's exact term (e.g., "wrote tests" → "implemented test-driven development (TDD)").
- Add a comprehensive SKILLS section (or expand the existing one) that lists ALL relevant technical skills from the JD that the candidate plausibly has based on their experience.
- For each work experience bullet, check if any missing keyword can be truthfully woven in.

OTHER RULES:
1. Do NOT invent or fabricate any experience, skills, or achievements — but DO rephrase existing content to use JD terminology
2. Improve clarity and impact of existing content
3. Add measurable impact where strongly implied (e.g., "managed team" → "managed team of 5")
4. Keep ATS-safe formatting: no tables, no columns, standard section headers
5. Use strong action verbs (achieved, delivered, developed, led, optimized)
6. Improve bullet point structure for readability
7. CRITICAL: Return the ENTIRE optimized resume. DO NOT truncate, summarize, or omit any sections (Experience, Education, etc.). Every single role from the original must be present in the output.
8. ABSOLUTE RULE: You MUST output the EXACT SAME number of work experiences as the original resume. If the original has 5 jobs spanning 10 years, your output MUST have exactly 5 jobs spanning 10 years. Under NO circumstances are you allowed to delete, combine, or shorten the timeline of a candidate's career history.
9. ABSOLUTE RULE: YOU MUST KEEP THE "EDUCATION", "SKILLS", "PROJECTS" (if present), and "SUMMARY" SECTIONS. Do not delete them.
10. If a section exists in the original resume, it MUST exist in your output. You must retain every single previous company name, role title, date range, and education degree.
11. ANTI-PLACEHOLDER RULE: NEVER output text like "(Education details not provided...)". You have the full text. If a section like Education was provided, transcribe it exactly as-is if you determine no ATS enhancements are needed. DO NOT hallucinate that data is missing.

Return a JSON object with this exact structure:
{
  "optimized_text": "<full optimized resume as plain text>",
  "changes_summary": ["<change 1>", "<change 2>"]
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

export async function extractKeywordsFromJdAi(
  jdText: string
): Promise<string[]> {
  const prompt = `${JD_KEYWORD_EXTRACTION_PROMPT}\n\nJOB DESCRIPTION:\n${String(jdText).slice(0, 5000)}`;
  try {
    if (useGroq()) {
      const client = getGroqClient();
      const response = await client.chat.completions.create({
        model: config.groqModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });
      const raw = response.choices[0].message.content || "";
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

export async function optimizeResume(
  resumeText: string,
  jdText: string,
  missingKeywords: string[]
): Promise<{ optimized_text: string; changes_summary: string[] }> {
  const kwList = (missingKeywords || []).slice(0, 20);
  const kwSection = kwList.length
    ? kwList.map((kw) => `  - ${kw}`).join("\n")
    : "  (none provided)";
  const userContent = `=== MISSING KEYWORDS (MUST integrate as many as possible using EXACT spelling) ===
${kwSection}

Your goal: integrate every keyword above into the resume where truthfully applicable. Each keyword that appears as an exact match in the output directly increases the candidate's ATS score. Aim for 80%+ keyword coverage.

=== JOB DESCRIPTION ===
${String(jdText).slice(0, 3000)}

=== CURRENT RESUME (optimize this) ===
${String(resumeText).slice(0, 10000)}`;

  let raw: string;

  if (useGroq()) {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: config.groqModel,
      messages: [
        { role: "system", content: RESUME_OPTIMIZER_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });
    raw = response.choices[0].message.content || "";
  } else {
    const model = getGeminiModel();
    const fullPrompt = `${RESUME_OPTIMIZER_SYSTEM_PROMPT}\n\n${userContent}`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    raw = result.response.text();
  }

  return parseOptimizeResponse(raw);
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
    const response = await client.chat.completions.create({
      model: config.groqModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    text = response.choices[0].message.content || "";
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
