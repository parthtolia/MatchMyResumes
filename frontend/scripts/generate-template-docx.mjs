import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, "..", "public", "templates")

// Minimal valid DOCX is a ZIP with specific XML files.
// We'll create a simple text file with .docx extension as placeholder.
// Replace these with real DOCX templates from free sources.

const templateFiles = [
  "modern-clean-ats-resume.docx",
  "modern-minimal-ats-resume.docx",
  "simple-classic-ats-resume.docx",
  "simple-one-column-ats-resume.docx",
  "professional-standard-ats-resume.docx",
  "corporate-professional-ats-resume.docx",
  "fresh-graduate-ats-resume.docx",
  "internship-ready-ats-resume.docx",
  "software-developer-ats-resume.docx",
  "data-science-ats-resume.docx",
  "executive-leadership-ats-resume.docx",
  "senior-manager-ats-resume.docx",
]

// Create a minimal placeholder for each template
for (const file of templateFiles) {
  const name = file.replace(/-ats-resume\.docx$/, "").replace(/-/g, " ")
  const content = `[${name.toUpperCase()} - ATS Resume Template]

Replace this placeholder with a real DOCX resume template.

Download free ATS-friendly templates from:
- https://www.overleaf.com/gallery/tagged/cv
- https://docs.google.com/document/u/0/?ftv=1&tgif=c (Google Docs templates)
- https://templates.office.com/en-us/resumes-and-cover-letters

Save as .docx and place in /public/templates/
`
  writeFileSync(join(outDir, file), content)
  console.log(`Created placeholder: ${file}`)
}

console.log(`\nCreated ${templateFiles.length} placeholder files in ${outDir}`)
console.log("Replace these with real DOCX templates before deploying.")
