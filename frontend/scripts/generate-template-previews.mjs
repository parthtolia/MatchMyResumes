import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, "..", "public", "images", "templates")

const templates = [
  { id: "modern-clean", color: "#6c5ce7" },
  { id: "modern-minimal", color: "#00b894" },
  { id: "simple-classic", color: "#2d3436" },
  { id: "simple-one-column", color: "#636e72" },
  { id: "professional-standard", color: "#0984e3" },
  { id: "corporate-professional", color: "#2d3436" },
  { id: "fresh-graduate", color: "#e17055" },
  { id: "internship-ready", color: "#fdcb6e" },
  { id: "software-developer", color: "#6c5ce7" },
  { id: "data-science", color: "#00b894" },
  { id: "executive-leadership", color: "#2d3436" },
  { id: "senior-manager", color: "#0984e3" },
  { id: "modern-two-tone", color: "#34495e" },
  { id: "simple-elegant", color: "#828282" },
  { id: "chronological-professional", color: "#006400" },
  { id: "career-changer", color: "#993300" },
  { id: "devops-engineer", color: "#e67e22" },
  { id: "product-manager", color: "#8e44ad" },
  { id: "executive-vp", color: "#2c3e50" },
  { id: "creative-professional", color: "#c0392b" },
]

function textLines(y, count, width = 180) {
  let lines = ""
  for (let i = 0; i < count; i++) {
    const w = width - (i * 17 + 10) % 60
    lines += `<rect x="30" y="${y + i * 14}" width="${w}" height="6" rx="3" fill="#e0e0e0" opacity="0.6"/>\n`
  }
  return lines
}

function sectionHeader(y, color) {
  return `<rect x="30" y="${y}" width="200" height="1" fill="${color}" opacity="0.4"/>
<rect x="30" y="${y + 8}" width="80" height="8" rx="2" fill="${color}" opacity="0.7"/>\n`
}

function generateSVG(t) {
  const c = t.color
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320" viewBox="0 0 240 320">
  <rect width="240" height="320" fill="#ffffff" rx="4"/>
  <rect x="0" y="0" width="240" height="4" fill="${c}"/>
  <rect x="30" y="24" width="120" height="12" rx="2" fill="#333333"/>
  <rect x="30" y="42" width="90" height="6" rx="3" fill="${c}" opacity="0.6"/>
  <rect x="30" y="54" width="160" height="5" rx="2" fill="#cccccc"/>
  <rect x="30" y="68" width="180" height="1" fill="#eeeeee"/>
  <rect x="30" y="76" width="140" height="5" rx="2" fill="#dddddd"/>
  ${sectionHeader(96, c)}
  ${textLines(116, 4)}
  ${sectionHeader(180, c)}
  ${textLines(200, 2)}
  ${sectionHeader(240, c)}
  <rect x="30" y="260" width="40" height="14" rx="7" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="0.5" stroke-opacity="0.3"/>
  <rect x="76" y="260" width="50" height="14" rx="7" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="0.5" stroke-opacity="0.3"/>
  <rect x="132" y="260" width="44" height="14" rx="7" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="0.5" stroke-opacity="0.3"/>
  <rect x="30" y="280" width="55" height="14" rx="7" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="0.5" stroke-opacity="0.3"/>
  <rect x="91" y="280" width="38" height="14" rx="7" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="0.5" stroke-opacity="0.3"/>
</svg>`
}

for (const t of templates) {
  writeFileSync(join(outDir, `${t.id}.svg`), generateSVG(t))
  console.log(`Generated ${t.id}.svg`)
}
console.log("Done!")
