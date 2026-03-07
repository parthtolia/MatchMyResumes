"""
CV-Only ATS Scorer

Evaluates a resume without a job description.
Analyses structural completeness, formatting, quantification,
and overall content quality to give a standalone ATS readiness score.
"""
import re
from typing import Dict, Any, List, Tuple

# ─── Weights for CV-only analysis ────────────────────────────────────
CV_WEIGHTS = {
    "section":        0.30,   # Are all key sections present?
    "formatting":     0.25,   # Is the formatting ATS-safe?
    "quantification": 0.20,   # Does it use numbers/metrics?
    "content_density": 0.15,  # Is the content rich enough?
    "contact_info":   0.10,   # Is contact info present?
}

# ─── Section completeness ─────────────────────────────────────────────

REQUIRED_SECTIONS = ["experience", "education", "skills"]
OPTIONAL_SECTIONS = ["summary", "projects", "certifications", "awards", "publications"]

def compute_cv_section_score(text: str) -> Tuple[float, Dict[str, bool], List[str]]:
    """Check whether essential resume sections are present."""
    lower = text.lower()
    present: Dict[str, bool] = {}
    missing: List[str] = []

    for s in REQUIRED_SECTIONS:
        found = bool(re.search(rf'\b{s}\b', lower))
        present[s] = found
        if not found:
            missing.append(s.title())

    for s in OPTIONAL_SECTIONS:
        found = bool(re.search(rf'\b{s}\b', lower))
        present[s] = found

    required_ok = sum(1 for s in REQUIRED_SECTIONS if present.get(s, False))
    optional_ok = sum(1 for s in OPTIONAL_SECTIONS if present.get(s, False))

    required_score = required_ok / len(REQUIRED_SECTIONS)
    optional_bonus = optional_ok / (len(OPTIONAL_SECTIONS) * 2)
    score = min(100.0, (required_score + optional_bonus) * 100)
    return round(score, 2), present, missing


# ─── Formatting check ─────────────────────────────────────────────────

def compute_cv_formatting_score(text: str) -> Tuple[float, Dict[str, bool]]:
    """ATS-friendly formatting heuristics."""
    checks: Dict[str, bool] = {
        "no_tables": not bool(re.search(r'\|.*\|', text)),
        "minimal_special_chars": len(re.findall(r'[©®™•◆▪▸►→✓✔★☆❖□■●]', text)) < 15,
        "standard_headings": sum(
            1 for s in ["experience", "education", "skills", "summary"]
            if s in text.lower()
        ) >= 2,
        "appropriate_length": 200 <= len(text.split()) <= 1500,
        "no_graphics_indicators": not bool(re.search(r'(Lorem ipsum|graphic|image)', text, re.I)),
    }
    score = (sum(checks.values()) / len(checks)) * 100
    return round(score, 2), checks


# ─── Quantification check ────────────────────────────────────────────

def compute_cv_quantification_score(text: str) -> Tuple[float, Dict[str, int], List[str]]:
    """Check how many numerical achievements are present."""
    patterns = {
        "percentages":    r'\d+(\.\d+)?\s*%',
        "dollar_amounts": r'\$[\d,]+(\.\d+)?[KkMmBb]?',
        "large_numbers":  r'\b\d{1,3}(,\d{3})+\b',
        "metrics_x":      r'\b\d+x\b',
        "team_size":      r'\b(team of|managed|led)\s+\d+',
        "year_ranges":    r'\b20\d\d\s*[-–]\s*(20\d\d|present)\b',
    }
    found: Dict[str, int] = {}
    total = 0
    tips: List[str] = []
    for name, pat in patterns.items():
        count = len(re.findall(pat, text, re.I))
        found[name] = count
        total += count

    if found.get("percentages", 0) == 0:
        tips.append("Your experiences lack percentage-based metrics (e.g., 'Improved efficiency by 30%'). Converting text achievements to percentage KPIs significantly lifts your ATS quantification.")
    if found.get("dollar_amounts", 0) == 0:
        tips.append("No financial impact detected. Include dollar metrics (e.g. 'Managed $500K budget', 'Generated $50K revenue') to strengthen executive visibility.")
    if total < 3:
        tips.append(f"Only found {total} numerical metrics. ATS engines prioritize candidates with highly quantified bullet points. Try to include at least 5-10 numbers across your roles.")

    score = min(100.0, total * 10)
    return round(score, 2), found, tips


# ─── Content density ──────────────────────────────────────────────────

TECH_SKILL_PATTERNS = [
    r'\b(python|java|javascript|typescript|react|angular|vue|node|sql|nosql'
    r'|aws|azure|gcp|docker|kubernetes|git|linux|machine learning|deep learning'
    r'|tensorflow|pytorch|pandas|spark|hadoop|api|rest|graphql|agile|scrum'
    r'|excel|powerbi|tableau|salesforce|sap|selenium|junit|pytest|flask|django'
    r'|spring|hibernate|mongodb|postgres|redis|kafka|elasticsearch|ci/cd)\b',
]

def compute_cv_content_density(text: str) -> Tuple[float, Dict[str, Any]]:
    """Measure technical skill density and content richness."""
    skills_found: list = []
    for pat in TECH_SKILL_PATTERNS:
        skills_found.extend(re.findall(pat, text.lower()))
    unique_skills = list(set(skills_found))

    word_count = len(text.split())
    action_verbs = re.findall(
        r'\b(developed|built|designed|implemented|led|managed|optimized|automated'
        r'|deployed|integrated|created|delivered|launched|reduced|increased|improved'
        r'|established|streamlined|collaborated|architected|mentored|resolved)\b',
        text.lower()
    )

    skill_score = min(100.0, len(unique_skills) * 8)
    verb_score = min(100.0, len(action_verbs) * 10)
    length_score = min(100.0, max(0.0, (word_count - 100) / 10))

    score = round((skill_score * 0.5 + verb_score * 0.3 + length_score * 0.2), 2)
    return score, {
        "unique_skills": unique_skills[:15],
        "skill_count": len(unique_skills),
        "action_verb_count": len(action_verbs),
        "word_count": word_count,
    }


# ─── Contact info ─────────────────────────────────────────────────────

def compute_cv_contact_score(text: str) -> Tuple[float, Dict[str, bool]]:
    """Check if essential contact information is present."""
    checks: Dict[str, bool] = {
        "email":    bool(re.search(r'\b[\w.-]+@[\w.-]+\.\w+\b', text)),
        "phone":    bool(re.search(r'(\+?\d[\d\s\-().]{7,}\d)', text)),
        "linkedin": bool(re.search(r'linkedin\.com', text, re.I)),
        "github":   bool(re.search(r'github\.com', text, re.I)),
    }
    # Email and phone are must-haves; LinkedIn/GitHub are nice-to-have
    must_haves = sum([checks["email"], checks["phone"]])
    nice_to_have = sum([checks["linkedin"], checks["github"]])
    score = min(100.0, (must_haves / 2 * 70) + (nice_to_have / 2 * 30))
    return round(score, 2), checks


# ─── Master function ──────────────────────────────────────────────────

def compute_cv_score(resume_text: str, structured_json: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    Compute a standalone CV quality score (no JD required).
    Returns a detailed dict with overall score, breakdowns, hints, and skill list.
    """
    sec_score, sec_details, missing_sections = compute_cv_section_score(resume_text)
    fmt_score, fmt_details = compute_cv_formatting_score(resume_text)
    quant_score, quant_details, quant_tips = compute_cv_quantification_score(resume_text)
    density_score, density_details = compute_cv_content_density(resume_text)
    contact_score, contact_details = compute_cv_contact_score(resume_text)

    total = (
        sec_score    * CV_WEIGHTS["section"]
        + fmt_score  * CV_WEIGHTS["formatting"]
        + quant_score * CV_WEIGHTS["quantification"]
        + density_score * CV_WEIGHTS["content_density"]
        + contact_score * CV_WEIGHTS["contact_info"]
    )

    # Build actionable feedback categorized by scoring contexts
    suggestions: Dict[str, List[str]] = {
        "Section Completeness": [],
        "ATS Formatting": [],
        "Quantification": [],
        "Content Density": [],
        "Contact Information": []
    }
    
    if missing_sections:
        suggestions["Section Completeness"].append(f"Your resume is missing essential sections. Add an '{missing_sections[0]}' section with detailed bullet points to improve your structural score by ~30%.")
    if not fmt_details.get("standard_headings"):
        suggestions["ATS Formatting"].append("Your section headers aren't standard. Rename them to exactly 'Experience', 'Education', and 'Skills' to ensure ATS parsers classify your content correctly.")
    if not fmt_details.get("appropriate_length"):
        wc = density_details.get("word_count", 0)
        if wc < 200:
            suggestions["Content Density"].append(f"Your resume is extremely short ({wc} words). ATS prefers 400-800 words detailing depth of experience to build semantic relevance. Add more descriptive bullet points.")
        else:
            suggestions["Content Density"].append(f"Your resume is too long ({wc} words). ATS parsers may truncate it or penalize verbosity. Trim irrelevant older roles to improve your keyword density.")

    skill_count = density_details.get("skill_count", 0)
    verb_count = density_details.get("action_verb_count", 0)
    word_count = density_details.get("word_count", 0)
    if skill_count < 12:
        suggestions["Content Density"].append(
            f"Only {skill_count} technical skills detected (need 12+ for a full score). "
            f"Add more specific tools, languages, and frameworks to your Skills section to boost ATS keyword density."
        )
    if verb_count < 10:
        suggestions["Content Density"].append(
            f"Only {verb_count} strong action verbs found (need 10+ for a full score). "
            f"Start each bullet with verbs like 'Developed', 'Led', 'Optimized', 'Delivered', or 'Reduced'."
        )
    if 200 <= word_count < 400:
        suggestions["Content Density"].append(
            f"Resume is thin at {word_count} words. ATS engines build semantic relevance from content volume — "
            f"aim for 400–800 words by adding detailed bullet points under each role."
        )

    suggestions["Quantification"] = quant_tips
    
    if not contact_details.get("email"):
        suggestions["Contact Information"].append("ATS filters explicitly require contact info. Please prominently include a standard email address in the header.")
    if not contact_details.get("linkedin"):
        suggestions["Contact Information"].append("Add a LinkedIn profile URL to boost your ATS contact completeness score.")

    return {
        "total_score": round(total, 1),
        "section_score": sec_score,
        "formatting_score": fmt_score,
        "quantification_score": quant_score,
        "content_density_score": density_score,
        "contact_score": contact_score,
        "skills_detected": density_details.get("unique_skills", []),
        "missing_sections": missing_sections,
        "suggestions": suggestions,
        "breakdown": {
            "section":          {"score": sec_score,      "weight": "30%", "details": sec_details},
            "formatting":       {"score": fmt_score,      "weight": "25%", "details": fmt_details},
            "quantification":   {"score": quant_score,    "weight": "20%", "details": quant_details},
            "content_density":  {"score": density_score,  "weight": "15%", "details": density_details},
            "contact_info":     {"score": contact_score,  "weight": "10%", "details": contact_details},
        },
    }
