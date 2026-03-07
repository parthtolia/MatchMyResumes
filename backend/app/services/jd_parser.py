"""
Job Description Parser Service
Cleans, normalizes, and extracts structured data from job descriptions.
"""
import re
from typing import Dict, Any, List


SKILL_INDICATORS = [
    "proficient in", "experience with", "knowledge of", "familiar with",
    "expertise in", "skilled in", "background in", "understanding of",
]

REQUIREMENT_HEADERS = [
    "requirements", "qualifications", "what you need", "you must have",
    "required skills", "must have", "minimum qualifications", "basic qualifications",
]

RESPONSIBILITY_HEADERS = [
    "responsibilities", "what you'll do", "role and responsibilities",
    "duties", "you will", "your role", "key responsibilities", "what you will do",
]

# Common tech skills for extraction
TECH_SKILLS = {
    "languages": ["python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "sql"],
    "frameworks": ["react", "angular", "vue", "django", "flask", "fastapi", "spring", "node.js", "express", "next.js", "nuxt"],
    "cloud": ["aws", "azure", "gcp", "kubernetes", "docker", "terraform", "ci/cd"],
    "databases": ["postgresql", "mysql", "mongodb", "redis", "dynamodb", "elasticsearch"],
    "tools": ["git", "jira", "confluence", "slack", "figma", "tableau", "power bi"],
}


def clean_jd_text(text: str) -> str:
    """Clean and normalize job description text."""
    text = re.sub(r'<[^>]+>', ' ', text)          # Strip HTML
    text = re.sub(r'\n{3,}', '\n\n', text)         # Normalize blank lines
    text = re.sub(r'[ \t]+', ' ', text)            # Normalize spaces
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)    # Remove non-ASCII
    return text.strip()


def extract_skills_from_text(text: str) -> List[str]:
    """Extract technical skills mentioned in the JD."""
    text_lower = text.lower()
    found_skills = []
    
    all_skills = [skill for category in TECH_SKILLS.values() for skill in category]
    for skill in all_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill)
    
    return list(set(found_skills))


def _extract_section(text: str, headers: List[str]) -> str:
    """Extract a section from JD based on header keywords."""
    lines = text.split("\n")
    in_section = False
    section_lines = []
    
    for line in lines:
        line_lower = line.strip().lower().rstrip(":")
        if any(h in line_lower for h in headers):
            in_section = True
            continue
        if in_section:
            # Stop at next section header
            if any(h in line_lower for h in REQUIREMENT_HEADERS + RESPONSIBILITY_HEADERS):
                if line_lower not in [h for h in headers]:
                    break
            if line.strip():
                section_lines.append(line.strip())
    
    return "\n".join(section_lines)


def parse_job_description(raw_text: str) -> Dict[str, Any]:
    """
    Parse job description text into structured format.
    
    Returns:
        {
            "cleaned_text": str,
            "required_skills": List[str],
            "responsibilities": str,
            "qualifications": str,
        }
    """
    cleaned = clean_jd_text(raw_text)
    
    required_skills = extract_skills_from_text(cleaned)
    responsibilities = _extract_section(cleaned, RESPONSIBILITY_HEADERS)
    qualifications = _extract_section(cleaned, REQUIREMENT_HEADERS)
    
    return {
        "cleaned_text": cleaned,
        "required_skills": required_skills,
        "responsibilities": responsibilities,
        "qualifications": qualifications,
    }
