/**
 * Structured Resume Types
 *
 * These types define the canonical JSON schema for resume extraction.
 * Unlike ResumeData (which contains Tiptap HTML), StructuredResume
 * holds clean, plain-text structured data from the extraction pipeline.
 */

export interface StructuredExperience {
  company: string;
  role: string;
  duration: string;
  points: string[];
}

export interface StructuredEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface StructuredResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  website?: string;
  summary: string;
  skills: string[];
  certifications: string[];
  education: StructuredEducation[];
  experience: StructuredExperience[];
}

export interface SegmentationResult {
  /** Resume sections mapped from headers: header, summary, experience, education, skills, certifications */
  segments: Record<string, string>;
  /** "high" if all major sections detected with content; "low" if missing or weak */
  confidence: "high" | "low";
}

export interface PipelineResult {
  /** Extracted structured data (before JD optimization) */
  structured: StructuredResume;
  /** Optimized structured data (after JD optimization) */
  optimized: StructuredResume;
  /** Original raw text from file */
  raw_text: string;
  /** Human-readable list of changes made during optimization */
  changes_summary: string[];
  /** Fields not found in the resume (e.g., ["phone", "skills"]) */
  missing_fields: string[];
  /** Confidence score 0–1; lower = more fallback used, more missing fields */
  confidence_score: number;
}
