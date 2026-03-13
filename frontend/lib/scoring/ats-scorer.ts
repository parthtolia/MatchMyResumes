// ATS Scoring Engine
// Weights: Keyword 40%, Semantic 25%, Formatting 15%, Section 10%, Quantification 10%

import { TfIdf } from "natural";
import { cosineSimilarity } from "@/lib/services/embedding-service";
import { extractKeywordsFromJdAi } from "@/lib/services/ai-service";

const WEIGHTS = {
  keyword: 0.4,
  semantic: 0.25,
  formatting: 0.15,
  section: 0.1,
  quantification: 0.1,
};

const IRRELEVANT_WORDS = new Set([
  // Generic verbs
  "work", "works", "working", "ensure", "support", "improve", "manage", "build",
  "provide", "develop", "collaborate", "drive", "execute", "deliver", "maintain",
  "achieve", "create", "design", "implement", "lead", "research", "review",
  "identify", "monitor", "report", "assist", "coordinate", "participate",
  "contribute", "define", "evaluate", "analyze", "analyse", "utilize", "use",
  "apply", "meet", "help", "need", "make", "take", "give", "know", "think",
  "include", "involve", "require", "enable", "allow", "care", "grow",
  // Noise nouns / adjectives
  "days", "lives", "team", "teams", "role", "roles", "people", "person",
  "captains", "captain", "members", "member", "area", "areas", "level",
  "levels", "approach", "opportunity", "opportunities", "goal", "goals",
  "result", "results", "impact", "value", "values", "culture", "environment",
  "benefits", "benefit", "salary", "office", "location", "remote", "hybrid",
  "year", "years", "month", "months", "week", "weeks", "time", "times",
  "world", "life", "things", "thing", "way", "ways", "kind", "type", "types",
  "high", "low", "good", "great", "best", "strong", "excellent", "superior",
  "new", "current", "existing", "various", "key", "core", "main", "major",
  "large", "small", "global", "local", "national", "international",
  "mission", "services", "owning", "fast", "diverse", "products", "experience",
  "learning", "solutions", "success", "customers", "skills", "looking",
  "business", "client", "practice", "needs", "middle", "region", "aligned",
  "actionable", "capabilities", "consulting", "clients", "emails", "just", "doing",
  "revolut", "official",
  // Common filler
  "etc", "also", "well", "plus", "like", "able", "possible", "based",
  "related", "relevant", "required", "preferred", "desired", "ideally",
  "minimum", "least", "such", "including", "following",
]);

const KNOWN_SHORT_TECH = new Set([
  "sql", "r", "go", "aws", "gcp", "api", "cli", "sdk", "orm",
  "css", "ml", "ai", "nlp", "etl", "bi", "qa", "ci", "cd",
  "vm", "ui", "ux", "llm", "rag", "seo", "crm", "erp", "ios",
  "git", "jvm", "net", "php", "c",
]);

function isRelevantKeyword(kw: string): boolean {
  const tokens = kw.toLowerCase().split(/\s+/);

  if (tokens.every((t) => IRRELEVANT_WORDS.has(t))) return false;
  if (tokens.length === 1 && IRRELEVANT_WORDS.has(tokens[0])) return false;

  // Drop very short single words unless known tech
  if (tokens.length === 1 && tokens[0].length < 4) {
    if (tokens[0] !== tokens[0].toUpperCase() && !KNOWN_SHORT_TECH.has(tokens[0].toLowerCase())) {
      return false;
    }
  }

  // Drop likely proper nouns
  if (tokens.length === 1 && kw[0] === kw[0].toUpperCase() && kw !== kw.toUpperCase() && kw.length > 4) {
    return false;
  }

  return true;
}

function extractTopKeywords(text: string, n: number = 30): string[] {
  try {
    const tfidf = new TfIdf();
    tfidf.addDocument(text);

    const terms: { term: string; measure: number }[] = [];
    tfidf.listTerms(0).forEach((item: any) => {
      if (isRelevantKeyword(item.term)) {
        terms.push({ term: item.term, measure: item.tfidf });
      }
    });

    terms.sort((a, b) => b.measure - a.measure);
    return terms.slice(0, n).map((t) => t.term);
  } catch {
    const words = text.toLowerCase().match(/\b[a-zA-Z]{4,}\b/g) || [];
    const filtered = [...new Set(words)].filter(
      (w) => !IRRELEVANT_WORDS.has(w)
    );
    return filtered.slice(0, n);
  }
}

function kwInText(kw: string, text: string): boolean {
  const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<!\\w)${escaped}(?!\\w)`).test(text);
}

export async function computeKeywordScore(
  resumeText: string,
  jdText: string,
  topN: number = 30
): Promise<[number, string[], string[]]> {
  // 1. AI extraction
  let rawJdKeywords = await extractKeywordsFromJdAi(jdText);

  // 2. Post-filter
  let jdKeywords: string[] = [];
  if (rawJdKeywords.length) {
    jdKeywords = rawJdKeywords.filter((kw) => isRelevantKeyword(kw));
  }

  // 3. Fallback to TF-IDF
  if (!jdKeywords.length) {
    jdKeywords = extractTopKeywords(jdText, topN);
  }

  const resumeLower = resumeText.toLowerCase();
  const matched = jdKeywords.filter((kw) => kwInText(kw, resumeLower));
  const missing = jdKeywords.filter((kw) => !kwInText(kw, resumeLower));

  const score = (matched.length / Math.max(jdKeywords.length, 1)) * 100;
  return [Math.round(score * 100) / 100, matched, missing];
}

export async function computeSemanticScore(
  resumeEmbedding: number[] | null,
  jdEmbedding: number[] | null
): Promise<number> {
  if (!resumeEmbedding || !jdEmbedding) return 0.0;
  const similarity = cosineSimilarity(resumeEmbedding, jdEmbedding);
  const score = Math.max(0, similarity) * 100;
  return Math.round(score * 100) / 100;
}

export function computeFormattingScore(
  resumeText: string,
  fileType: string = "pdf"
): [number, Record<string, any>] {
  const checks: Record<string, boolean> = {
    no_tables: !/\|.*\|/.test(resumeText),
    minimal_special_chars:
      (resumeText.match(/[©®™•◆▪▸►→✓✔★☆❖□■●]/g) || []).length < 15,
    standard_headings:
      ["experience", "education", "skills", "summary"].filter((s) =>
        resumeText.toLowerCase().includes(s)
      ).length >= 3,
    appropriate_length:
      resumeText.split(/\s+/).length >= 200 &&
      resumeText.split(/\s+/).length <= 1500,
    has_contact_info: /\b[\w.-]+@[\w.-]+\.\w+\b/.test(resumeText),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = (passed / Object.keys(checks).length) * 100;
  return [Math.round(score * 100) / 100, checks];
}

export function computeSectionScore(
  structuredJson: Record<string, any>
): [number, Record<string, any>] {
  const required = ["experience", "education", "skills"];
  const optional = ["summary", "certifications"];

  const present: Record<string, boolean> = {};
  for (const section of required) {
    const content = structuredJson[section] || "";
    present[section] = Boolean(content && String(content).trim().length > 20);
  }
  for (const section of optional) {
    const content = structuredJson[section] || "";
    present[section] = Boolean(content && String(content).trim().length > 20);
  }

  const requiredScore =
    required.filter((s) => present[s]).length / required.length;
  const optionalBonus =
    optional.filter((s) => present[s]).length / (optional.length * 2);

  const score = Math.min(100, (requiredScore + optionalBonus) * 100);
  return [Math.round(score * 100) / 100, present];
}

export function computeQuantificationScore(
  resumeText: string
): [number, Record<string, any>] {
  const patterns: Record<string, RegExp> = {
    percentages: /\d+(\.\d+)?\s*%/gi,
    dollar_amounts: /\$[\d,]+(\.\d+)?[KkMmBb]?/gi,
    large_numbers: /\b\d{1,3}(,\d{3})+\b/gi,
    metrics_x: /\b\d+x\b/gi,
    team_size: /\b(team of|managed|led)\s+\d+/gi,
    year_ranges: /\b20\d\d\s*[-–]\s*(20\d\d|present)\b/gi,
  };

  const found: Record<string, number> = {};
  let totalHits = 0;
  for (const [name, pattern] of Object.entries(patterns)) {
    const count = (resumeText.match(pattern) || []).length;
    found[name] = count;
    totalHits += count;
  }

  const score = Math.min(100, totalHits * 10);
  return [Math.round(score * 100) / 100, found];
}

export async function computeAtsScore(
  resumeText: string,
  jdText: string,
  resumeEmbedding: number[] | null,
  jdEmbedding: number[] | null,
  structuredJson: Record<string, any>,
  fileType: string = "pdf",
  topKeywords: number = 30
): Promise<Record<string, any>> {
  const [kwScore, matchedKw, missingKw] = await computeKeywordScore(
    resumeText,
    jdText,
    topKeywords
  );
  const semScore = await computeSemanticScore(resumeEmbedding, jdEmbedding);
  const [fmtScore, fmtDetails] = computeFormattingScore(resumeText, fileType);
  const [secScore, secDetails] = computeSectionScore(structuredJson);
  const [quantScore, quantDetails] = computeQuantificationScore(resumeText);

  const total =
    kwScore * WEIGHTS.keyword +
    semScore * WEIGHTS.semantic +
    fmtScore * WEIGHTS.formatting +
    secScore * WEIGHTS.section +
    quantScore * WEIGHTS.quantification;

  return {
    total_score: Math.round(total * 10) / 10,
    keyword_score: kwScore,
    semantic_score: semScore,
    formatting_score: fmtScore,
    section_score: secScore,
    quantification_score: quantScore,
    matched_keywords: matchedKw,
    missing_keywords: missingKw,
    breakdown: {
      keyword: {
        score: kwScore,
        weight: "40%",
        matched: matchedKw.length,
        missing: missingKw.length,
      },
      semantic: { score: semScore, weight: "25%" },
      formatting: { score: fmtScore, weight: "15%", checks: fmtDetails },
      section: { score: secScore, weight: "10%", sections: secDetails },
      quantification: {
        score: quantScore,
        weight: "10%",
        found: quantDetails,
      },
    },
  };
}
