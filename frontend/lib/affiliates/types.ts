// ─── Intent ───────────────────────────────────────────────────────────────────

export type IntentLevel = "CRITICAL" | "NEEDS_WORK" | "STRONG" | "READY";

// ─── A/B Variant ──────────────────────────────────────────────────────────────

export type AbVariant = "A" | "B";
// A = primary card + secondary grid + improvement steps (default)
// B = single focused card only (no secondary grid, no steps)

// ─── Categories ───────────────────────────────────────────────────────────────

export enum AffiliateCategory {
  COURSES         = "COURSES",
  RESUME_TOOLS    = "RESUME_TOOLS",
  INTERVIEW_PREP  = "INTERVIEW_PREP",
  JOB_BOARDS      = "JOB_BOARDS",
  CAREER_COACHING = "CAREER_COACHING",
  LINKEDIN_TOOLS  = "LINKEDIN_TOOLS",
}

export type ScoreGapTag =
  | "section_score" | "formatting_score" | "quantification_score"
  | "contact_score" | "content_density_score" | "keyword_score" | "semantic_score";

export type PageContext =
  | "cv-analysis" | "scan" | "optimize" | "cover-letter"
  | "tracker" | "marketing-ats" | "marketing-jd" | "marketing-optimizer";

// ─── Product ──────────────────────────────────────────────────────────────────

export interface AffiliateProduct {
  id: string;
  name: string;               // outcome-driven: "Become Python Job-Ready in 30 Days"
  description: string;        // 1-2 sentences on what the user achieves
  url: string;                // full URL with affiliate/UTM params embedded
  category: AffiliateCategory;
  subcategory?: string;
  tags: string[];             // lowercased skill tokens for keyword matching
  scoreGapTags?: ScoreGapTag[];
  ctaLabel: string;           // action-driven: "Fix My Resume", "Start Free"
  badge?: string;             // "Most Popular" | "Free Trial" | "Top Rated"
  trustSignal?: string;       // "Used by 1M+ job seekers" | "4.8★ from 50k ratings"
  hookLabel?: string;         // above-the-fold label: "Fastest fix for your score"
  isHighIntent?: boolean;     // score boost for CRITICAL/NEEDS_WORK users
  payoutWeight: number;       // 0.0–1.0 — relative revenue potential (0=low, 1=high)
  conversionRateEstimate?: number; // [V2] 0.0–1.0 — estimated % of clicks that convert to paid
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface CVScores {
  section_score?: number;
  formatting_score?: number;
  quantification_score?: number;
  contact_score?: number;
  content_density_score?: number;
  keyword_score?: number;
  semantic_score?: number;
}

export interface RecommendationContext {
  totalScore?: number;
  missingKeywords?: string[];
  skillsDetected?: string[];
  cvScores?: CVScores;
  pageContext?: PageContext;
}

// ─── Engine output ────────────────────────────────────────────────────────────

export interface RankedProduct {
  product: AffiliateProduct;
  reason: string;             // "You're missing python, aws from this JD"
  position: "primary" | "secondary";
}

export interface ImprovementStep {
  stepNumber: number;
  action: string;
  reason: string;
  urgencyNote?: string;       // "Every day you wait, recruiters are reviewing other candidates"
  product?: AffiliateProduct;
  internalCta?: { label: string; href: string };
}

export interface SectionHeading {
  title: string;
  subtitle: string;
  urgencyTag?: string;        // Small red/orange pill above title: "Action Required" | "You're Close"
}

export interface RecommendationResult {
  intentLevel: IntentLevel;
  abVariant: AbVariant;
  heading: SectionHeading;
  primaryHook: string;        // text above primary card: "Fastest way to close your skill gap"
  primary: RankedProduct | null;
  secondary: RankedProduct[];
  improvementSteps: ImprovementStep[];
  shouldShowSticky: boolean;  // true when intent is CRITICAL or NEEDS_WORK
  progressFrame?: string;     // optional motivational line: "You're at 55% — users like you reached 80%..."
  isEmpty: boolean;           // true when no products could be ranked (triggers fallback UI)
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

export type AffiliateEventType = "impression" | "click";

export interface AffiliateEventPayload {
  eventType: AffiliateEventType;
  productId: string;
  page: PageContext | string;
  position: "primary" | "secondary" | "sticky";
  intentLevel?: IntentLevel;
  userScore?: number;
  abVariant?: AbVariant;
  sessionId: string;          // from sessionStorage — enables impression dedup
}
