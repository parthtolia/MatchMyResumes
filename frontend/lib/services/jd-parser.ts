const SKILL_INDICATORS = [
  "proficient in",
  "experience with",
  "knowledge of",
  "familiar with",
  "expertise in",
  "skilled in",
  "background in",
  "understanding of",
];

const REQUIREMENT_HEADERS = [
  "requirements",
  "qualifications",
  "what you need",
  "you must have",
  "required skills",
  "must have",
  "minimum qualifications",
  "basic qualifications",
];

const RESPONSIBILITY_HEADERS = [
  "responsibilities",
  "what you'll do",
  "role and responsibilities",
  "duties",
  "you will",
  "your role",
  "key responsibilities",
  "what you will do",
];

const TECH_SKILLS: Record<string, string[]> = {
  languages: [
    "python",
    "javascript",
    "typescript",
    "java",
    "c++",
    "c#",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "php",
    "sql",
  ],
  frameworks: [
    "react",
    "angular",
    "vue",
    "django",
    "flask",
    "fastapi",
    "spring",
    "node.js",
    "express",
    "next.js",
    "nuxt",
  ],
  cloud: [
    "aws",
    "azure",
    "gcp",
    "kubernetes",
    "docker",
    "terraform",
    "ci/cd",
  ],
  databases: [
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "dynamodb",
    "elasticsearch",
  ],
  tools: [
    "git",
    "jira",
    "confluence",
    "slack",
    "figma",
    "tableau",
    "power bi",
  ],
};

export function cleanJdText(text: string): string {
  text = text.replace(/<[^>]+>/g, " "); // Strip HTML
  text = text.replace(/\n{3,}/g, "\n\n"); // Normalize blank lines
  text = text.replace(/[ \t]+/g, " "); // Normalize spaces
  text = text.replace(/[^\x00-\x7F]+/g, " "); // Remove non-ASCII
  return text.trim();
}

export function extractSkillsFromText(text: string): string[] {
  const textLower = text.toLowerCase();
  const foundSkills: Set<string> = new Set();

  const allSkills = Object.values(TECH_SKILLS).flat();
  for (const skill of allSkills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`).test(textLower)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}

function extractSection(text: string, headers: string[]): string {
  const lines = text.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    const lineLower = line.trim().toLowerCase().replace(/:$/, "");
    if (headers.some((h) => lineLower.includes(h))) {
      inSection = true;
      continue;
    }
    if (inSection) {
      const allHeaders = [...REQUIREMENT_HEADERS, ...RESPONSIBILITY_HEADERS];
      if (
        allHeaders.some((h) => lineLower.includes(h)) &&
        !headers.some((h) => lineLower === h)
      ) {
        break;
      }
      if (line.trim()) {
        sectionLines.push(line.trim());
      }
    }
  }

  return sectionLines.join("\n");
}

export function parseJobDescription(rawText: string): {
  cleaned_text: string;
  required_skills: string[];
  responsibilities: string;
  qualifications: string;
} {
  const cleaned = cleanJdText(rawText);
  const requiredSkills = extractSkillsFromText(cleaned);
  const responsibilities = extractSection(cleaned, RESPONSIBILITY_HEADERS);
  const qualifications = extractSection(cleaned, REQUIREMENT_HEADERS);

  return {
    cleaned_text: cleaned,
    required_skills: requiredSkills,
    responsibilities,
    qualifications,
  };
}
