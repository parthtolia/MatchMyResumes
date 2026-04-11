import {
  AffiliateProduct,
  AffiliateCategory,
  IntentLevel,
  RecommendationContext,
  RecommendationResult,
  RankedProduct,
  SectionHeading,
  ImprovementStep,
  ScoreGapTag,
  AbVariant,
} from "./types";
import { CATALOG, PAGE_CONTEXT_DEFAULTS } from "./catalog";

// ─── Intent Classification ─────────────────────────────────────────────────────

export function classifyIntent(context: RecommendationContext): IntentLevel {
  const { totalScore, missingKeywords, cvScores } = context;

  if (totalScore !== undefined) {
    if (totalScore < 40) return "CRITICAL";
    if (totalScore < 70) return "NEEDS_WORK";
    if (totalScore < 85) return "STRONG";
    return "READY";
  }

  // Infer from sub-scores when no total is available (cv-analysis page)
  const scores = Object.values(cvScores ?? {}).filter((v): v is number => v !== undefined);
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 100;
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 100;

  if (lowestScore < 40 || avgScore < 45) return "CRITICAL";
  if (lowestScore < 70 || (missingKeywords?.length ?? 0) > 5) return "NEEDS_WORK";
  if ((missingKeywords?.length ?? 0) > 0) return "STRONG";
  return "STRONG";
}

// ─── Section Headings ──────────────────────────────────────────────────────────

const HEADINGS: Record<IntentLevel, SectionHeading> = {
  CRITICAL: {
    title: "Your Resume Is Being Rejected Before Anyone Reads It",
    subtitle: "ATS systems are filtering you out automatically. Fix these gaps before you apply anywhere else.",
    urgencyTag: "Action Required",
  },
  NEEDS_WORK: {
    title: "You're Close — But Missing Keywords Are Costing You Interviews",
    subtitle: "Your resume has potential, but these targeted fixes could double your callback rate.",
    urgencyTag: "Don't Miss Out",
  },
  STRONG: {
    title: "Strong Resume — Now Lock In the Role",
    subtitle: "You're in recruiter review territory. These resources can put you at the top of the shortlist.",
  },
  READY: {
    title: "Your Resume Is Ready — Are You?",
    subtitle: "Strong match score. The next filter is the interview. Start preparing now.",
  },
};

// ─── Primary Hook Labels ───────────────────────────────────────────────────────

const PRIMARY_HOOKS: Record<IntentLevel, string> = {
  CRITICAL: "Fastest fix for your score",
  NEEDS_WORK: "Top recommendation for closing your gap",
  STRONG: "Most relevant resource for your skill set",
  READY: "Your next step after a strong application",
};

// ─── Intent Category Bias ──────────────────────────────────────────────────────

const INTENT_BIAS: Record<IntentLevel, { categories: AffiliateCategory[]; boost: number }> = {
  CRITICAL: {
    categories: [AffiliateCategory.RESUME_TOOLS, AffiliateCategory.LINKEDIN_TOOLS],
    boost: 7,
  },
  NEEDS_WORK: {
    categories: [AffiliateCategory.COURSES, AffiliateCategory.RESUME_TOOLS],
    boost: 4,
  },
  STRONG: {
    categories: [AffiliateCategory.COURSES, AffiliateCategory.CAREER_COACHING],
    boost: 2,
  },
  READY: {
    categories: [AffiliateCategory.INTERVIEW_PREP, AffiliateCategory.JOB_BOARDS],
    boost: 6,
  },
};

// ─── Scoring Algorithm ─────────────────────────────────────────────────────────

function scoreProducts(context: RecommendationContext, intent: IntentLevel): Map<string, number> {
  const scored = new Map<string, number>();

  // Keyword overload guard: cap to top 8 if >15 missing keywords
  const rawMissing = context.missingKeywords ?? [];
  const missing = rawMissing.length > 15 ? rawMissing.slice(0, 8) : rawMissing;

  // Keyword priority: top 2 get 5× weight, rest get 1.5×
  const priorityTokens = missing.slice(0, 2).map(k => k.toLowerCase());
  const normalTokens = missing.slice(2).map(k => k.toLowerCase());
  const detectedTokens = (context.skillsDetected ?? []).map(k => k.toLowerCase());

  for (const product of CATALOG) {
    let score = 0;

    // Pass 1a: High-priority keyword match (5 pts per tag)
    score += product.tags
      .filter(tag => priorityTokens.some(t => t.includes(tag) || tag.includes(t)))
      .length * 5;

    // Pass 1b: Normal keyword match (1.5 pts per tag)
    score += product.tags
      .filter(tag => normalTokens.some(t => t.includes(tag) || tag.includes(t)))
      .length * 1.5;

    // Pass 1c: Detected skill match (1 pt per tag)
    score += product.tags
      .filter(tag => detectedTokens.some(t => t.includes(tag) || tag.includes(t)))
      .length * 1;

    // Pass 2: Score-gap match (2 pts per matching gap below 70)
    if (context.cvScores) {
      const gaps = Object.entries(context.cvScores)
        .filter(([, v]) => v !== undefined && (v as number) < 70)
        .map(([k]) => k as ScoreGapTag);
      score += (product.scoreGapTags?.filter(t => gaps.includes(t)).length ?? 0) * 2;
    }

    // Pass 3: Intent category bias
    const { categories, boost } = INTENT_BIAS[intent];
    if (categories.includes(product.category)) score += boost;

    // Pass 4: isHighIntent bonus for urgent users
    if (product.isHighIntent && (intent === "CRITICAL" || intent === "NEEDS_WORK")) score += 2;

    // Pass 5: Revenue blend (max 1.5 pts — never overrides relevance)
    score += product.payoutWeight * 1.5;

    if (score > 0) scored.set(product.id, score);
  }

  return scored;
}

// ─── Reason Generator ──────────────────────────────────────────────────────────

function buildReason(product: AffiliateProduct, context: RecommendationContext): string {
  const missing = context.missingKeywords ?? [];
  const { cvScores, totalScore } = context;

  if (product.category === AffiliateCategory.COURSES && missing.length > 0) {
    const matched = product.tags
      .filter(t => missing.some(k => k.toLowerCase().includes(t) || t.includes(k.toLowerCase())))
      .slice(0, 2);
    if (matched.length > 0) {
      return `This JD requires ${matched.join(" and ")} — skills not found on your resume.`;
    }
  }

  if (product.category === AffiliateCategory.RESUME_TOOLS && cvScores) {
    const worst = Object.entries(cvScores)
      .filter(([, v]) => v !== undefined)
      .sort(([, a], [, b]) => (a as number) - (b as number))[0];
    if (worst && (worst[1] as number) < 70) {
      return `Your ${worst[0].replace(/_/g, " ")} is ${Math.round(worst[1] as number)}% — well below the passing threshold.`;
    }
  }

  if (product.category === AffiliateCategory.INTERVIEW_PREP && (totalScore ?? 0) >= 75) {
    return "Your resume is strong enough to get interviews. Now you need to win them.";
  }

  if (product.category === AffiliateCategory.JOB_BOARDS) {
    return "Your profile is ready. Start applying to roles that match your background.";
  }

  if (product.category === AffiliateCategory.LINKEDIN_TOOLS && missing.length > 0) {
    return "Recruiters search LinkedIn by keyword — your missing skills aren't visible to them yet.";
  }

  if (product.category === AffiliateCategory.CAREER_COACHING) {
    return "A 30-minute session with a recruiter will tell you more than any automated tool.";
  }

  return "";
}

// ─── Improvement Steps Generator ───────────────────────────────────────────────

function generateImprovementSteps(
  context: RecommendationContext,
  intent: IntentLevel,
  ranked: RankedProduct[]
): ImprovementStep[] {
  if (intent === "STRONG" || intent === "READY") return [];

  const steps: ImprovementStep[] = [];
  const { cvScores, missingKeywords } = context;

  // Step 1: Fix formatting/structure
  const formattingLow =
    (cvScores?.formatting_score ?? 100) < 70 || (cvScores?.section_score ?? 100) < 70;
  if (formattingLow) {
    steps.push({
      stepNumber: 1,
      action: "Rebuild your resume structure",
      reason: "ATS systems score your layout before reading your content — a bad structure means instant rejection.",
      urgencyNote:
        intent === "CRITICAL"
          ? "Recruiters at most companies never see resumes that fail ATS."
          : "Fixing your structure alone can add 10–20 points to your score.",
      product: ranked.find(r => r.product.category === AffiliateCategory.RESUME_TOOLS)?.product,
    });
  }

  // Step 2: Add missing skills
  if ((missingKeywords?.length ?? 0) > 0) {
    const top3 = missingKeywords!.slice(0, 3).join(", ");
    const remainder = missingKeywords!.length - 3;
    steps.push({
      stepNumber: steps.length + 1,
      action: "Close your keyword gap",
      reason: `Missing: ${top3}${remainder > 0 ? ` and ${remainder} more` : ""}`,
      urgencyNote: "Every missing keyword reduces your match score and lowers your ranking in applicant tracking systems.",
      product: ranked.find(r => r.product.category === AffiliateCategory.COURSES)?.product,
      internalCta: { label: "Optimize Resume with AI", href: "/dashboard/optimize" },
    });
  }

  // Step 3: Re-scan
  steps.push({
    stepNumber: steps.length + 1,
    action: "Re-scan and confirm your improvements",
    reason: "Run the JD match again after your fixes to see your updated score before applying.",
    internalCta: { label: "Run New Scan →", href: "/dashboard/scan" },
  });

  return steps.slice(0, 3);
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function getRecommendations(
  context: RecommendationContext,
  abVariant: AbVariant = "A"
): RecommendationResult {
  const intent = classifyIntent(context);
  const scored = scoreProducts(context, intent);

  let ranked = [...scored.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => CATALOG.find(p => p.id === id)!)
    .filter(Boolean)
    .slice(0, 4);

  // Pad with page-context defaults
  if (ranked.length < 2 && context.pageContext) {
    const defaults = PAGE_CONTEXT_DEFAULTS[context.pageContext] ?? [];
    for (const id of defaults) {
      if (!ranked.find(p => p.id === id)) {
        const fallback = CATALOG.find(p => p.id === id);
        if (fallback) ranked.push(fallback);
      }
      if (ranked.length >= 2) break;
    }
  }

  // Variant B: single card only
  if (abVariant === "B") ranked = ranked.slice(0, 1);

  const [primaryProduct, ...secondaryProducts] = ranked;
  const primary: RankedProduct | null = primaryProduct
    ? {
        product: primaryProduct,
        reason: buildReason(primaryProduct, context),
        position: "primary",
      }
    : null;
  const secondary: RankedProduct[] =
    abVariant === "A"
      ? secondaryProducts.map(p => ({
          product: p,
          reason: buildReason(p, context),
          position: "secondary" as const,
        }))
      : [];

  const allRanked = [primary, ...secondary].filter(Boolean) as RankedProduct[];
  const isEmpty = primary === null;

  // Progress frame
  let progressFrame: string | undefined;
  if (!isEmpty && context.totalScore !== undefined && intent !== "READY") {
    const target = intent === "CRITICAL" ? 60 : intent === "NEEDS_WORK" ? 80 : 90;
    progressFrame = `You're at ${Math.round(context.totalScore)}% — users who fixed these gaps reached ${target}%+ on their next scan.`;
  }

  return {
    intentLevel: intent,
    abVariant,
    heading: HEADINGS[intent],
    primaryHook: PRIMARY_HOOKS[intent],
    primary,
    secondary,
    improvementSteps: generateImprovementSteps(context, intent, allRanked),
    shouldShowSticky: intent === "CRITICAL" || intent === "NEEDS_WORK",
    progressFrame,
    isEmpty,
  };
}
