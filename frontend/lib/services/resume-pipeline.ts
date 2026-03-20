/**
 * AI Resume Extraction Pipeline
 *
 * Modular 5-step pipeline for robust resume parsing and optimization:
 * Step 1: Extract raw text (PDF/DOCX)
 * Step 2: Segment into logical sections (adaptive: regex → AI fallback)
 * Step 3: Extract structured JSON via AI
 * Step 4: Optimize for JD alignment via AI
 * Step 5: Map to UI-ready ResumeData
 *
 * The pipeline NEVER throws — it always returns a valid PipelineResult.
 */

import { parseResume, cleanText } from "./resume-parser";
import {
  extractSectionsFromText,
  callStructuredAIWithRetry,
  STRUCTURED_EXTRACTION_PROMPT,
  STRUCTURED_OPTIMIZATION_PROMPT,
  AI_SEGMENTATION_PROMPT,
} from "./ai-service";
import { structuredResumeToResumeData } from "@/lib/resume-utils";
import { computeKeywordScore } from "@/lib/scoring/ats-scorer";
import type {
  StructuredResume,
  StructuredEducation,
  StructuredExperience,
  SegmentationResult,
  PipelineResult,
} from "@/lib/types/structured-resume";

// ── Step 1: Extract raw text from file ─────────────────────────────────────

export async function extractRawText(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<string> {
  const parsed = await parseResume(buffer, fileType);
  return parsed.raw_text;
}

// ── Step 1.5: Quality check ────────────────────────────────────────────────

function isTextUsable(text: string): boolean {
  const alphaChars = text.replace(/[^a-zA-Z]/g, "").length;
  const ratio = alphaChars / text.length;
  return text.length > 200 && ratio > 0.6;
}

// ── Step 2: Adaptive section segmentation ──────────────────────────────────

/**
 * Detect section confidence by checking:
 * - At least 4 major sections (summary, experience, education, skills)
 * - Each major section has > 30 chars
 * - Experience section contains relevant keywords
 * - Education section contains relevant keywords
 */
function getSegmentationConfidence(segments: Record<string, string>): "high" | "low" {
  const majorSections = ["summary", "experience", "education", "skills"];
  const detectedCount = majorSections.filter(
    (s) => segments[s]?.trim().length > 30
  ).length;

  // Check for fewer than 4 sections
  if (detectedCount < 4) return "low";

  // Check experience section keywords
  const expText = (segments.experience || "").toLowerCase();
  const expKeywords = [
    "experience",
    "work",
    "employment",
    "project",
    "developed",
    "managed",
  ];
  const hasExpKeyword = expKeywords.some((kw) => expText.includes(kw));
  if (!hasExpKeyword) return "low";

  // Check education section keywords
  const eduText = (segments.education || "").toLowerCase();
  const eduKeywords = ["education", "university", "degree", "college"];
  const hasEduKeyword = eduKeywords.some((kw) => eduText.includes(kw));
  if (!hasEduKeyword) return "low";

  return "high";
}

/**
 * Segment resume text using regex first, with AI fallback if confidence is low.
 */
export async function segmentResumeText(
  rawText: string
): Promise<SegmentationResult> {
  // Primary: regex-based segmentation
  const segments = extractSectionsFromText(rawText);

  // Check confidence
  const confidence = getSegmentationConfidence(segments);

  if (confidence === "high") {
    return { segments, confidence };
  }

  // Low confidence: try AI segmentation
  try {
    const aiSegments = await callStructuredAIWithRetry(
      AI_SEGMENTATION_PROMPT,
      `Resume text:\n\n${rawText.slice(0, 8000)}`
    );

    // Validate that AI returned something useful
    if (aiSegments && typeof aiSegments === "object") {
      const aiResult: Record<string, string> = {};
      for (const [key, val] of Object.entries(aiSegments)) {
        if (typeof val === "string" && val.trim()) {
          aiResult[key] = val.trim();
        }
      }

      if (Object.keys(aiResult).length > 0) {
        return { segments: aiResult, confidence: "low" };
      }
    }
  } catch (e) {
    // AI call failed; use regex result with low confidence
    console.warn("AI segmentation failed, using regex result:", e);
  }

  return { segments, confidence };
}

// ── Step 3: Extract structured data via AI ─────────────────────────────────

/**
 * Extract structured resume JSON using AI.
 * Input selection depends on segmentation confidence:
 * - High: send only segmented sections (more focused)
 * - Low: send only raw text (avoids weak segmentation)
 */
export async function extractStructuredData(
  rawText: string,
  seg: SegmentationResult
): Promise<StructuredResume> {
  let aiPromptContent: string;

  if (seg.confidence === "high") {
    // Send segmented data (6000 char cap)
    aiPromptContent = `SEGMENTED RESUME SECTIONS:\n\n${JSON.stringify(seg.segments, null, 2).slice(0, 6000)}`;
  } else {
    // Send raw text (8000 char cap)
    aiPromptContent = `RESUME TEXT:\n\n${rawText.slice(0, 8000)}`;
  }

  try {
    const aiResult = await callStructuredAIWithRetry(
      STRUCTURED_EXTRACTION_PROMPT,
      aiPromptContent
    );
    return validateAndNormalize(aiResult);
  } catch (e) {
    console.error("AI extraction failed:", e);
    // Fallback to heuristic extraction
    return buildFallbackStructuredResume(seg.segments, rawText);
  }
}

// ── Step 4: Optimize with JD alignment ─────────────────────────────────────

/**
 * Truncate input intelligently if total chars > 12000.
 * Priority: experience → skills → summary
 */
function truncateForToken(structured: StructuredResume): StructuredResume {
  const serializeSize = JSON.stringify(structured).length;

  if (serializeSize <= 12000) {
    return structured;
  }

  const truncated = { ...structured };

  // 1. Trim experience bullets (keep first 4 per role)
  truncated.experience = truncated.experience.map((exp) => ({
    ...exp,
    points: exp.points.slice(0, 4),
  }));

  // 2. Trim skills (keep first 30)
  if (truncated.skills.length > 30) {
    truncated.skills = truncated.skills.slice(0, 30);
  }

  // 3. Trim summary (keep first 500 chars)
  if (truncated.summary?.length > 500) {
    truncated.summary = truncated.summary.slice(0, 500);
  }

  return truncated;
}

/**
 * Match experience entry by company + role (not just index).
 */
function matchExperience(
  orig: StructuredExperience,
  aiList: StructuredExperience[]
): StructuredExperience | undefined {
  return aiList.find(
    (ai) => ai.company === orig.company && ai.role === orig.role
  );
}

/**
 * Post-process bullets: strip symbols, enforce min 3 / max 6.
 */
function postProcessBullets(points: string[]): string[] {
  // Strip leading bullet symbols
  const cleaned = points
    .map((p) => p.replace(/^[-•*·]\s*/, "").trim())
    .filter(Boolean);

  // Enforce limits
  if (cleaned.length < 3) return points; // Keep original if fewer than 3
  if (cleaned.length > 6) return cleaned.slice(0, 6);
  return cleaned;
}

export async function optimizeStructuredResume(
  structured: StructuredResume,
  jdText: string,
  missingKeywords: string[]
): Promise<StructuredResume> {
  // Token protect
  const toOptimize = truncateForToken(structured);

  // Construct optimization payload (only modifiable fields)
  const optimizationPayload = {
    summary: toOptimize.summary,
    skills: toOptimize.skills,
    experience: toOptimize.experience.map((e) => ({
      company: e.company,
      role: e.role,
      duration: e.duration,
      points: e.points,
    })),
  };

  const userMessage = `MISSING ATS KEYWORDS TO INTEGRATE (where truthful):
${missingKeywords.slice(0, 25).join(", ")}

JOB DESCRIPTION:
${jdText.slice(0, 3500)}

CURRENT RESUME JSON:
${JSON.stringify(optimizationPayload, null, 2)}`;

  try {
    const aiResult = await callStructuredAIWithRetry(
      STRUCTURED_OPTIMIZATION_PROMPT,
      userMessage
    );

    // Merge with preserved fields (company/role/duration/education/certifications)
    const merged: StructuredResume = {
      ...structured,
      summary: aiResult.summary ?? structured.summary,
      skills: aiResult.skills ?? structured.skills,
      experience: structured.experience.map((orig, i) => {
        const aiEntry = matchExperience(
          orig,
          aiResult.experience ?? []
        );
        const rawPoints = aiEntry?.points ?? [];
        const cleanPoints = postProcessBullets(rawPoints);
        const finalPoints =
          cleanPoints.length >= 3
            ? cleanPoints.slice(0, 6)
            : orig.points;
        return {
          company: orig.company,
          role: orig.role,
          duration: orig.duration,
          points: finalPoints,
        };
      }),
    };

    return validateAndNormalize(merged);
  } catch (e) {
    console.error("Optimization failed:", e);
    // Return original unchanged
    return structured;
  }
}

// ── Step 5: UI mapping ────────────────────────────────────────────────────

export function structuredResumeToUI(structured: StructuredResume) {
  return structuredResumeToResumeData(structured);
}

// ── Internal: Validation & Normalization ──────────────────────────────────

function emptyStructuredResume(): StructuredResume {
  return {
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    website: undefined,
    summary: "",
    skills: [],
    certifications: [],
    education: [],
    experience: [],
  };
}

/**
 * Normalize and validate extracted data:
 * - Ensure all fields exist with correct types
 * - Deduplicate and trim skills
 * - Strip bullet symbols
 * - Enforce experience bullet limits
 */
export function validateAndNormalize(raw: unknown): StructuredResume {
  if (!raw || typeof raw !== "object") {
    return emptyStructuredResume();
  }

  const data = raw as Record<string, any>;

  // Helper: ensure string or default to ""
  const str = (val: any): string => (typeof val === "string" ? val.trim() : "");

  // Helper: ensure array of strings
  const strArray = (val: any): string[] => {
    if (!Array.isArray(val)) return [];
    return val
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  };

  // Skills normalization: deduplicate, remove long phrases, trim
  const skills = strArray(data.skills);
  const uniqueSkills = new Map<string, string>();
  for (const skill of skills) {
    const lower = skill.toLowerCase();
    const wordCount = skill.split(/\s+/).length;
    if (wordCount <= 4 && !uniqueSkills.has(lower)) {
      uniqueSkills.set(lower, skill);
    }
  }
  const normalizedSkills = Array.from(uniqueSkills.values());

  // Education normalization
  const education: StructuredEducation[] = [];
  const eduArray = data.education;
  if (Array.isArray(eduArray)) {
    for (const e of eduArray) {
      if (e && typeof e === "object") {
        education.push({
          degree: str(e.degree),
          institution: str(e.institution),
          year: str(e.year),
        });
      }
    }
  }

  // Experience normalization
  const experience: StructuredExperience[] = [];
  const expArray = data.experience;
  if (Array.isArray(expArray)) {
    for (const e of expArray) {
      if (e && typeof e === "object") {
        let points = strArray(e.points);
        // Strip leading bullet symbols
        points = points.map((p) => p.replace(/^[-•*·]\s*/, "").trim()).filter(Boolean);
        // Cap at 6 bullets
        if (points.length > 6) points = points.slice(0, 6);

        experience.push({
          company: str(e.company),
          role: str(e.role),
          duration: str(e.duration),
          points,
        });
      }
    }
  }

  const website = str(data.website);
  return {
    name: str(data.name),
    email: str(data.email),
    phone: str(data.phone),
    location: str(data.location),
    title: str(data.title),
    website: website || undefined,
    summary: str(data.summary),
    skills: normalizedSkills,
    certifications: strArray(data.certifications),
    education,
    experience,
  };
}

// ── Missing field detection ────────────────────────────────────────────────

function detectMissingFields(s: StructuredResume): string[] {
  const missing: string[] = [];
  if (!s.name) missing.push("name");
  if (!s.email) missing.push("email");
  if (!s.phone) missing.push("phone");
  if (!s.skills.length) missing.push("skills");
  if (!s.experience.length) missing.push("experience");
  return missing;
}

// ── Fallback: Heuristic extraction ─────────────────────────────────────────

/**
 * Build a StructuredResume using regex heuristics when AI fails.
 * Uses existing extractContactInfoFromBasics and section content analysis.
 */
function buildFallbackStructuredResume(
  segments: Record<string, string>,
  rawText: string
): StructuredResume {
  const result = emptyStructuredResume();

  // Extract basics from header section
  const basicsText = segments.header || segments.basics || "";
  if (basicsText) {
    const lines = basicsText.split("\n");
    // First non-empty line = name
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && trimmed.length > 2) {
        result.name = trimmed;
        break;
      }
    }

    // Email
    const emailMatch = basicsText.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (emailMatch) result.email = emailMatch[0];

    // Phone
    const phoneMatch = basicsText.match(
      /(?:\+\d{1,3}[\s.-]?)?\(?(?:\d{1,4}[\s.-]?)*\d{3}[\s.-]\d{4}/
    );
    if (phoneMatch) result.phone = phoneMatch[0];

    // Location (contains comma, short)
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.includes(",") &&
        trimmed.length < 50 &&
        !/\d{4}/.test(trimmed)
      ) {
        result.location = trimmed;
        break;
      }
    }

    // LinkedIn/GitHub/Website URL
    const urlMatch = basicsText.match(
      /https?:\/\/(?:www\.)?(?:linkedin\.com|github\.com)[^\s]+/i
    );
    if (urlMatch) result.website = urlMatch[0];
  }

  // Extract summary
  if (segments.summary) {
    result.summary = segments.summary.trim();
  }

  // Extract skills (simple: comma-separated or newline-separated)
  if (segments.skills) {
    const skillText = segments.skills.toLowerCase();
    result.skills = segments.skills
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 50)
      .slice(0, 30);
  }

  // Extract education (basic)
  if (segments.education) {
    const eduLines = segments.education.split("\n").filter((l) => l.trim());
    for (const line of eduLines.slice(0, 5)) {
      result.education.push({
        degree: "",
        institution: line.trim(),
        year: "",
      });
    }
  }

  // Extract certifications
  if (segments.certifications) {
    const certLines = segments.certifications
      .split("\n")
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    result.certifications = certLines.slice(0, 20);
  }

  // Extract experience (basic)
  if (segments.experience) {
    const expLines = segments.experience.split("\n").filter((l) => l.trim());
    // Simple heuristic: every group of 2-3 lines is one role
    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i].trim();
      if (line.length > 0 && line.length < 150) {
        result.experience.push({
          company: "",
          role: line,
          duration: "",
          points: [],
        });
      }
    }
  }

  return validateAndNormalize(result);
}

// ── Confidence scoring ─────────────────────────────────────────────────────

function computeConfidenceScore(params: {
  textUsable: boolean;
  segmentationConfidence: "high" | "low";
  missingFields: string[];
  extractionUsedAI: boolean;
  optimizationSucceeded: boolean;
}): number {
  if (!params.textUsable) return 0.1;

  let score = 0;

  // Segmentation: high = +0.3, low = +0.1
  score += params.segmentationConfidence === "high" ? 0.3 : 0.1;

  // Missing fields: 0 = +0.3, each missing = -0.1 (floor 0)
  const missingPenalty = Math.max(0, 0.3 - params.missingFields.length * 0.1);
  score += missingPenalty;

  // AI extraction and optimization success: +0.2 each
  if (params.extractionUsedAI) score += 0.2;
  if (params.optimizationSucceeded) score += 0.2;

  return Math.min(1, Math.max(0, score));
}

// ── Changes summary generator ──────────────────────────────────────────────

function generateChangesSummary(
  original: StructuredResume,
  optimized: StructuredResume
): string[] {
  const changes: string[] = [];

  if (original.summary !== optimized.summary) {
    changes.push(
      "Summary optimized for better alignment with job description"
    );
  }

  if (original.skills.length !== optimized.skills.length) {
    changes.push("Relevant skills added based on job description");
  }

  changes.push(
    "Experience bullet points enhanced for impact and ATS optimization"
  );

  return changes;
}

// ── Main orchestrator ──────────────────────────────────────────────────────

/**
 * Run the full extraction and optimization pipeline.
 * NEVER throws — always returns a valid PipelineResult.
 */
export async function runExtractionPipeline(
  buffer: Buffer,
  fileType: "pdf" | "docx",
  jdText: string,
  missingKeywords: string[]
): Promise<PipelineResult> {
  try {
    // Step 1: Extract raw text
    const raw_text = await extractRawText(buffer, fileType);

    // Step 1.5: Quality check
    const textUsable = isTextUsable(raw_text);
    if (!textUsable) {
      return {
        structured: emptyStructuredResume(),
        optimized: emptyStructuredResume(),
        raw_text: "",
        changes_summary: [],
        missing_fields: [
          "name",
          "email",
          "phone",
          "skills",
          "experience",
        ],
        confidence_score: 0.1,
      };
    }

    // Step 2: Segment
    const segmentation = await segmentResumeText(raw_text);

    // Step 3: Extract structured data
    const structured = await extractStructuredData(raw_text, segmentation);

    // Detect missing fields after extraction
    const missingFields = detectMissingFields(structured);

    // Step 4: Optimize
    let optimized = structured;
    let optimizationSucceeded = false;
    try {
      optimized = await optimizeStructuredResume(structured, jdText, missingKeywords);
      optimizationSucceeded = true;
    } catch (e) {
      console.warn("Optimization step failed, using unoptimized result:", e);
    }

    // Generate changes summary
    const changes_summary = generateChangesSummary(structured, optimized);

    // Compute confidence score
    const confidence_score = computeConfidenceScore({
      textUsable,
      segmentationConfidence: segmentation.confidence,
      missingFields,
      extractionUsedAI: true, // We always attempt AI
      optimizationSucceeded,
    });

    return {
      structured,
      optimized,
      raw_text,
      changes_summary,
      missing_fields: missingFields,
      confidence_score,
    };
  } catch (e) {
    // Complete failure: return empty but valid result
    console.error("Pipeline completely failed:", e);
    return {
      structured: emptyStructuredResume(),
      optimized: emptyStructuredResume(),
      raw_text: "",
      changes_summary: [],
      missing_fields: [
        "name",
        "email",
        "phone",
        "skills",
        "experience",
      ],
      confidence_score: 0.0,
    };
  }
}
