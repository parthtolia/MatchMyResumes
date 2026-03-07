"""
AI Service Module
Handles resume optimization and cover letter generation.
Primary: Groq (llama-3.3-70b-versatile) — fast and free.
Fallback: Google Gemini — used when GROQ_API_KEY is not set.
"""
import json
from typing import List, Optional
import google.generativeai as genai
from app.core.config import get_settings

settings = get_settings()

# ── Groq client (lazy-init) ──────────────────────────────────────────────────
_groq_client = None

def _get_groq_client():
    global _groq_client
    if _groq_client is None:
        from groq import AsyncGroq
        _groq_client = AsyncGroq(api_key=settings.groq_api_key)
    return _groq_client

# ── Gemini model (lazy-init, fallback only) ──────────────────────────────────
_gemini_configured = False
_gemini_model = None

def _get_gemini_model():
    global _gemini_configured, _gemini_model
    if not _gemini_configured:
        genai.configure(api_key=settings.gemini_api_key)
        _gemini_configured = True
    if _gemini_model is None:
        _gemini_model = genai.GenerativeModel(
            model_name=settings.gemini_chat_model,
            generation_config=genai.GenerationConfig(
                temperature=0.4,
                max_output_tokens=8192,
            ),
        )
    return _gemini_model

def _use_groq() -> bool:
    return bool(settings.groq_api_key)


RESUME_OPTIMIZER_SYSTEM_PROMPT = """You are an expert ATS resume optimization specialist. Your role is to improve resumes for ATS compatibility without fabricating experience.

Rules:
1. Do NOT invent or fabricate any experience, skills, or achievements
2. Improve clarity and impact of existing content
3. Add measurable impact where strongly implied (e.g., "managed team" → "managed team of 5")
4. naturally integrate missing keywords from the job description
5. Keep ATS-safe formatting: no tables, no columns, standard section headers
6. Use strong action verbs (achieved, delivered, developed, led, optimized)
7. Improve bullet point structure for readability
8. CRITICAL: Return the ENTIRE optimized resume. DO NOT truncate, summarize, or omit any sections (Experience, Education, etc.). Every single role from the original must be present in the output.
9. ABSOLUTE RULE: You MUST output the EXACT SAME number of work experiences as the original resume. If the original has 5 jobs spanning 10 years, your output MUST have exactly 5 jobs spanning 10 years. Under NO circumstances are you allowed to delete, combine, or shorten the timeline of a candidate's career history.
10. ABSOLUTE RULE: YOU MUST KEEP THE "EDUCATION", "SKILLS", "PROJECTS" (if present), and "SUMMARY" SECTIONS. Do not delete them.
11. If a section exists in the original resume, it MUST exist in your output. You must retain every single previous company name, role title, date range, and education degree.
12. ANTI-PLACEHOLDER RULE: NEVER output text like "(Education details not provided...)". You have the full text. If a section like Education was provided, transcribe it exactly as-is if you determine no ATS enhancements are needed. DO NOT hallucinate that data is missing.

Return a JSON object with this exact structure:
{
  "optimized_text": "<full optimized resume as plain text>",
  "changes_summary": ["<change 1>", "<change 2>"]
}"""

JD_KEYWORD_EXTRACTION_PROMPT = """You are an expert ATS (Applicant Tracking System) keyword extraction engine.
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
["python", "fastapi", "postgresql", "redis", "docker", "kubernetes", "aws", "rest api", "microservices", "sql", "agile", "ci/cd", "machine learning", "data modeling", "asyncio"]"""

from datetime import datetime

COVER_LETTER_SYSTEM_PROMPT = """You are an expert career coach and professional cover letter writer. You create compelling, personalized cover letters that pass ATS screening and impress hiring managers.

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

Return ONLY the cover letter text formatted as shown above, ready to copy-paste. Fill in ALL brackets with the actual information provided."""

import re

def _clean_json_string(text: str) -> str:
    """Aggressively scrub LLM JSON output of common syntax errors."""
    # 1. Strip markdown wrappers
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()

    # 2. Escape unescaped newlines inside strings (a common Gemini flaw)
    # We find all strings by matching quotes, then replace literal newlines with \n
    def escape_newlines(match):
        return match.group(0).replace('\n', '\\n').replace('\r', '')
    text = re.sub(r'"(?:[^"\\]|\\.)*"', escape_newlines, text)
    
    # 3. Fix unescaped internal quotes (e.g. "He said "hello"" -> "He said \"hello\"")
    # This is harder to regex safely, but we can try to catch common patterns if needed.
    
    # 4. Remove trailing commas in objects and arrays
    text = re.sub(r',\s*}', '}', text)
    text = re.sub(r',\s*]', ']', text)
    
    return text

async def extract_keywords_from_jd_ai(jd_text: str) -> List[str]:
    """Extract high-quality hard skills and keywords from a JD (Groq → Gemini fallback)."""
    prompt = f"{JD_KEYWORD_EXTRACTION_PROMPT}\n\nJOB DESCRIPTION:\n{str(jd_text)[:5000]}"
    try:
        if _use_groq():
            client = _get_groq_client()
            response = await client.chat.completions.create(
                model=settings.groq_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content or ""
            # Groq JSON mode wraps array in an object; unwrap if needed
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                keywords = parsed
            else:
                # Find the first list value in the object
                keywords = next((v for v in parsed.values() if isinstance(v, list)), [])
        else:
            model = _get_gemini_model()
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            parsed = json.loads(_clean_json_string(response.text))
            keywords = parsed if isinstance(parsed, list) else []

        return [str(k).lower() for k in keywords if k]
    except Exception as e:
        print(f"AI Keyword Extraction failed: {e}")
    return []

def _parse_optimize_response(raw: str) -> dict:
    """Parse the JSON response from the LLM for resume optimization."""
    try:
        return json.loads(_clean_json_string(raw))
    except json.JSONDecodeError as e:
        print(f"JSON Parsing failed: {e}\nRaw output: {raw[:500]}")
        match = re.search(r'"optimized_text"\s*:\s*"(.*?)(?:"\s*,|\Z)', raw, re.DOTALL)
        extracted = (
            match.group(1).replace('\\n', '\n').replace('\\"', '"')
            if match
            else raw.replace("```json", "").replace("```", "").strip()
        )
        return {
            "optimized_text": extracted,
            "changes_summary": ["Failed to parse structured changes. Optimized text retrieved via fallback."],
        }


async def optimize_resume(
    resume_text: str,
    jd_text: str,
    missing_keywords: List[str],
) -> dict:
    """Optimize a resume for a specific job description (Groq → Gemini fallback)."""
    user_content = f"""MISSING KEYWORDS TO INTEGRATE (only if relevant):
{', '.join((missing_keywords or [])[:15])}

JOB DESCRIPTION:
{str(jd_text)[:3000]}

CURRENT RESUME:
{str(resume_text)[:10000]}"""

    if _use_groq():
        client = _get_groq_client()
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": RESUME_OPTIMIZER_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.4,
            max_tokens=8192,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or ""
    else:
        model = _get_gemini_model()
        full_prompt = f"{RESUME_OPTIMIZER_SYSTEM_PROMPT}\n\n{user_content}"
        response = await model.generate_content_async(
            full_prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        raw = response.text

    return _parse_optimize_response(raw)


def _strip_markdown(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        first_newline = text.find("\n")
        text = text[first_newline + 1:] if first_newline != -1 else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


async def generate_cover_letter(
    resume_text: str,
    jd_text: str,
    tone: str = "professional",
    length: str = "medium",
    applicant_name: Optional[str] = None,
    company_name: Optional[str] = None,
    job_title: Optional[str] = None,
) -> str:
    """Generate a tailored cover letter (Groq → Gemini fallback)."""
    current_date = datetime.now().strftime("%B %d, %Y")
    system_prompt = COVER_LETTER_SYSTEM_PROMPT.format(current_date=current_date)
    user_content = f"""Write a {length} cover letter in a {tone} tone.

Applicant Name: {applicant_name or 'the applicant'}
Company: {company_name or 'the company'}
Job Title: {job_title or 'the position'}

JOB DESCRIPTION:
{jd_text[:2500]}

RESUME HIGHLIGHTS:
{resume_text[:2500]}

Write the cover letter now:"""

    if _use_groq():
        client = _get_groq_client()
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.7,
            max_tokens=4000,
        )
        text = response.choices[0].message.content or ""
    else:
        genai.configure(api_key=settings.gemini_api_key)
        text_model = genai.GenerativeModel(
            model_name=settings.gemini_chat_model,
            generation_config=genai.GenerationConfig(temperature=0.7, max_output_tokens=4000),
        )
        full_prompt = system_prompt + "\n\n" + user_content
        response = await text_model.generate_content_async(full_prompt)
        text = response.text

    return _strip_markdown(text)
