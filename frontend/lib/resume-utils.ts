import { ResumeData, ResumeSection, ResumeBasics } from "./types/resume";

const SECTION_HEADERS: Record<string, string[]> = {
  summary: ["summary", "professional summary", "profile", "objective", "about me"],
  experience: ["experience", "work experience", "employment history", "professional experience", "work history"],
  education: ["education", "academic background", "qualifications", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "competencies", "expertise", "technologies"],
  projects: ["projects", "personal projects", "academic projects"],
  certifications: ["certifications", "certificates", "licenses", "credentials", "awards"],
};

export function parseRawTextToResumeData(text: string): ResumeData {
  const lines = text.split("\n");
  const sections: ResumeSection[] = [];
  const basics: ResumeBasics = { name: "" };
  
  let currentSectionTitle = "";
  let currentSectionContent: string[] = [];
  let foundBasics = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // First non-empty line is likely the name
    if (!basics.name && !foundBasics) {
      basics.name = line;
      // Look ahead for email/phone in the next few lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.includes("@")) basics.email = nextLine;
        else if (/\d{3}/.test(nextLine)) basics.phone = nextLine;
        else if (nextLine.includes("linkedin.com") || nextLine.includes("github.com")) basics.website = nextLine;
      }
      foundBasics = true;
      continue;
    }

    // Skip basics lines if we already processed them
    if (line === basics.email || line === basics.phone || line === basics.website) continue;

    // Detect section headers
    const normalized = line.toLowerCase().replace(/:$/, "");
    let detectedSectionKey = "";
    for (const [key, keywords] of Object.entries(SECTION_HEADERS)) {
      if (keywords.includes(normalized)) {
        detectedSectionKey = key;
        break;
      }
    }

    if (detectedSectionKey || (line.toUpperCase() === line && line.length > 3 && line.length < 30)) {
      // Save previous section
      if (currentSectionTitle || currentSectionContent.length > 0) {
        sections.push({
          id: crypto.randomUUID(),
          title: currentSectionTitle || "Introduction",
          content: currentSectionContent.join("\n")
        });
      }
      
      currentSectionTitle = detectedSectionKey ? detectedSectionKey.toUpperCase() : line;
      currentSectionContent = [];
    } else {
      currentSectionContent.push(line);
    }
  }

  // Push last section
  if (currentSectionTitle || currentSectionContent.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      title: currentSectionTitle || "Other",
      content: currentSectionContent.join("\n")
    });
  }

  return { basics, sections };
}

export function resumeDataToRawText(data: ResumeData): string {
  let text = `${data.basics.name}\n`;
  if (data.basics.email) text += `${data.basics.email}\n`;
  if (data.basics.phone) text += `${data.basics.phone}\n`;
  if (data.basics.website) text += `${data.basics.website}\n`;
  if (data.basics.location) text += `${data.basics.location}\n`;
  text += "\n";

  data.sections.forEach(section => {
    text += `${section.title}\n`;
    text += `${section.content}\n\n`;
  });

  return text.trim();
}
