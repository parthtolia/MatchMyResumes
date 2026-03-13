// CV-Only ATS Scorer — evaluates a resume without a job description.

const CV_WEIGHTS = {
  section: 0.3,
  formatting: 0.25,
  quantification: 0.2,
  content_density: 0.15,
  contact_info: 0.1,
};

const REQUIRED_SECTIONS = ["experience", "education", "skills"];
const OPTIONAL_SECTIONS = [
  "summary",
  "projects",
  "certifications",
  "awards",
  "publications",
];

export function computeCvSectionScore(
  text: string
): [number, Record<string, boolean>, string[]] {
  const lower = text.toLowerCase();
  const present: Record<string, boolean> = {};
  const missing: string[] = [];

  for (const s of REQUIRED_SECTIONS) {
    const found = new RegExp(`\\b${s}\\b`).test(lower);
    present[s] = found;
    if (!found) missing.push(s.charAt(0).toUpperCase() + s.slice(1));
  }

  for (const s of OPTIONAL_SECTIONS) {
    present[s] = new RegExp(`\\b${s}\\b`).test(lower);
  }

  const requiredOk = REQUIRED_SECTIONS.filter((s) => present[s]).length;
  const optionalOk = OPTIONAL_SECTIONS.filter((s) => present[s]).length;

  const requiredScore = requiredOk / REQUIRED_SECTIONS.length;
  const optionalBonus = optionalOk / (OPTIONAL_SECTIONS.length * 2);
  const score = Math.min(100, (requiredScore + optionalBonus) * 100);
  return [Math.round(score * 100) / 100, present, missing];
}

export function computeCvFormattingScore(
  text: string
): [number, Record<string, boolean>] {
  const checks: Record<string, boolean> = {
    no_tables: !/\|.*\|/.test(text),
    minimal_special_chars:
      (text.match(/[©®™•◆▪▸►→✓✔★☆❖□■●]/g) || []).length < 15,
    standard_headings:
      ["experience", "education", "skills", "summary"].filter((s) =>
        text.toLowerCase().includes(s)
      ).length >= 2,
    appropriate_length:
      text.split(/\s+/).length >= 200 && text.split(/\s+/).length <= 1500,
    no_graphics_indicators: !/(Lorem ipsum|graphic|image)/i.test(text),
  };
  const score =
    (Object.values(checks).filter(Boolean).length / Object.keys(checks).length) *
    100;
  return [Math.round(score * 100) / 100, checks];
}

export function computeCvQuantificationScore(
  text: string
): [number, Record<string, number>, string[]] {
  const patterns: Record<string, RegExp> = {
    percentages: /\d+(\.\d+)?\s*%/gi,
    dollar_amounts: /\$[\d,]+(\.\d+)?[KkMmBb]?/gi,
    large_numbers: /\b\d{1,3}(,\d{3})+\b/gi,
    metrics_x: /\b\d+x\b/gi,
    team_size: /\b(team of|managed|led)\s+\d+/gi,
    year_ranges: /\b20\d\d\s*[-–]\s*(20\d\d|present)\b/gi,
  };
  const found: Record<string, number> = {};
  let total = 0;
  const tips: string[] = [];

  for (const [name, pat] of Object.entries(patterns)) {
    const count = (text.match(pat) || []).length;
    found[name] = count;
    total += count;
  }

  if ((found.percentages || 0) === 0) {
    tips.push(
      "Your experiences lack percentage-based metrics (e.g., 'Improved efficiency by 30%'). Converting text achievements to percentage KPIs significantly lifts your ATS quantification."
    );
  }
  if ((found.dollar_amounts || 0) === 0) {
    tips.push(
      "No financial impact detected. Quantify budget or revenue impact using your local currency (e.g. 'Managed a ₹50L budget', 'Generated €10K revenue', 'Saved $500K in costs') to strengthen executive visibility."
    );
  }
  if (total < 3) {
    tips.push(
      `Only found ${total} numerical metrics. ATS engines prioritize candidates with highly quantified bullet points. Try to include at least 5-10 numbers across your roles.`
    );
  }

  const score = Math.min(100, total * 10);
  return [Math.round(score * 100) / 100, found, tips];
}

const TECH_SKILL_PATTERNS = [
  /\b(python|java|javascript|typescript|react|angular|vue|node|sql|nosql|aws|azure|gcp|docker|kubernetes|git|linux|machine learning|deep learning|tensorflow|pytorch|pandas|spark|hadoop|api|rest|graphql|agile|scrum|excel|powerbi|tableau|salesforce|sap|selenium|junit|pytest|flask|django|spring|hibernate|mongodb|postgres|redis|kafka|elasticsearch|ci\/cd)\b/gi,
];

export function computeCvContentDensity(
  text: string
): [number, Record<string, any>] {
  const skillsFound: string[] = [];
  for (const pat of TECH_SKILL_PATTERNS) {
    const matches = text.toLowerCase().match(pat);
    if (matches) skillsFound.push(...matches);
  }
  const uniqueSkills = [...new Set(skillsFound)];

  const wordCount = text.split(/\s+/).length;
  const actionVerbs = (
    text
      .toLowerCase()
      .match(
        /\b(developed|built|designed|implemented|led|managed|optimized|automated|deployed|integrated|created|delivered|launched|reduced|increased|improved|established|streamlined|collaborated|architected|mentored|resolved)\b/g
      ) || []
  );

  const skillScore = Math.min(100, uniqueSkills.length * 8);
  const verbScore = Math.min(100, actionVerbs.length * 10);
  const lengthScore = Math.min(100, Math.max(0, (wordCount - 100) / 10));

  const score =
    Math.round((skillScore * 0.5 + verbScore * 0.3 + lengthScore * 0.2) * 100) /
    100;
  return [
    score,
    {
      unique_skills: uniqueSkills.slice(0, 15),
      skill_count: uniqueSkills.length,
      action_verb_count: actionVerbs.length,
      word_count: wordCount,
    },
  ];
}

export function computeCvContactScore(
  text: string
): [number, Record<string, boolean>] {
  const checks: Record<string, boolean> = {
    email: /\b[\w.-]+@[\w.-]+\.\w+\b/.test(text),
    phone: /(\+?\d[\d\s\-().]{7,}\d)/.test(text),
    linkedin: /linkedin\.com/i.test(text),
    github: /github\.com/i.test(text),
  };
  const mustHaves = [checks.email, checks.phone].filter(Boolean).length;
  const niceToHave = [checks.linkedin, checks.github].filter(Boolean).length;
  const score = Math.min(100, (mustHaves / 2) * 70 + (niceToHave / 2) * 30);
  return [Math.round(score * 100) / 100, checks];
}

export function computeCvScore(
  resumeText: string,
  structuredJson?: Record<string, any> | null
): Record<string, any> {
  const [secScore, secDetails, missingSections] =
    computeCvSectionScore(resumeText);
  const [fmtScore, fmtDetails] = computeCvFormattingScore(resumeText);
  const [quantScore, quantDetails, quantTips] =
    computeCvQuantificationScore(resumeText);
  const [densityScore, densityDetails] = computeCvContentDensity(resumeText);
  const [contactScore, contactDetails] = computeCvContactScore(resumeText);

  const total =
    secScore * CV_WEIGHTS.section +
    fmtScore * CV_WEIGHTS.formatting +
    quantScore * CV_WEIGHTS.quantification +
    densityScore * CV_WEIGHTS.content_density +
    contactScore * CV_WEIGHTS.contact_info;

  const suggestions: Record<string, string[]> = {
    "Section Completeness": [],
    "ATS Formatting": [],
    Quantification: [],
    "Content Density": [],
    "Contact Information": [],
  };

  if (missingSections.length > 0) {
    suggestions["Section Completeness"].push(
      `Your resume is missing essential sections. Add an '${missingSections[0]}' section with detailed bullet points to improve your structural score by ~30%.`
    );
  }
  if (!fmtDetails.standard_headings) {
    suggestions["ATS Formatting"].push(
      "Your section headers aren't standard. Rename them to exactly 'Experience', 'Education', and 'Skills' to ensure ATS parsers classify your content correctly."
    );
  }
  if (!fmtDetails.appropriate_length) {
    const wc = densityDetails.word_count || 0;
    if (wc < 200) {
      suggestions["Content Density"].push(
        `Your resume is extremely short (${wc} words). ATS prefers 400-800 words detailing depth of experience to build semantic relevance. Add more descriptive bullet points.`
      );
    } else {
      suggestions["Content Density"].push(
        `Your resume is too long (${wc} words). ATS parsers may truncate it or penalize verbosity. Trim irrelevant older roles to improve your keyword density.`
      );
    }
  }

  const skillCount = densityDetails.skill_count || 0;
  const verbCount = densityDetails.action_verb_count || 0;
  const wordCount = densityDetails.word_count || 0;

  if (skillCount < 12) {
    suggestions["Content Density"].push(
      `Only ${skillCount} technical skills detected (need 12+ for a full score). Add more specific tools, languages, and frameworks to your Skills section to boost ATS keyword density.`
    );
  }
  if (verbCount < 10) {
    suggestions["Content Density"].push(
      `Only ${verbCount} strong action verbs found (need 10+ for a full score). Start each bullet with verbs like 'Developed', 'Led', 'Optimized', 'Delivered', or 'Reduced'.`
    );
  }
  if (wordCount >= 200 && wordCount < 400) {
    suggestions["Content Density"].push(
      `Resume is thin at ${wordCount} words. ATS engines build semantic relevance from content volume — aim for 400–800 words by adding detailed bullet points under each role.`
    );
  }

  suggestions["Quantification"] = quantTips;

  if (!contactDetails.email) {
    suggestions["Contact Information"].push(
      "ATS filters explicitly require contact info. Please prominently include a standard email address in the header."
    );
  }
  if (!contactDetails.linkedin) {
    suggestions["Contact Information"].push(
      "Add a LinkedIn profile URL to boost your ATS contact completeness score."
    );
  }

  return {
    total_score: Math.round(total * 10) / 10,
    section_score: secScore,
    formatting_score: fmtScore,
    quantification_score: quantScore,
    content_density_score: densityScore,
    contact_score: contactScore,
    skills_detected: densityDetails.unique_skills || [],
    missing_sections: missingSections,
    suggestions,
    breakdown: {
      section: { score: secScore, weight: "30%", details: secDetails },
      formatting: { score: fmtScore, weight: "25%", details: fmtDetails },
      quantification: {
        score: quantScore,
        weight: "20%",
        details: quantDetails,
      },
      content_density: {
        score: densityScore,
        weight: "15%",
        details: densityDetails,
      },
      contact_info: {
        score: contactScore,
        weight: "10%",
        details: contactDetails,
      },
    },
  };
}
