"""
Resume Parser Service
Supports PDF (PyMuPDF) and DOCX (python-docx) files.
Extracts raw text and detects sections: summary, experience, education, skills, certifications.
"""
import re
import io
from typing import Optional
from pdfminer.high_level import extract_text as pdf_extract_text
from docx import Document


SECTION_HEADERS = {
    "summary": ["summary", "professional summary", "profile", "objective", "about me"],
    "experience": ["experience", "work experience", "employment history", "professional experience", "work history"],
    "education": ["education", "academic background", "qualifications", "academic qualifications"],
    "skills": ["skills", "technical skills", "core competencies", "competencies", "expertise", "technologies"],
    "certifications": ["certifications", "certificates", "licenses", "credentials", "awards"],
}


def _detect_section(line: str) -> Optional[str]:
    """Return section name if line matches a section header."""
    normalized = line.strip().lower().rstrip(":")
    for section, keywords in SECTION_HEADERS.items():
        if normalized in keywords:
            return section
    return None


def _parse_sections(text: str) -> dict:
    """Parse text into resume sections."""
    sections = {k: [] for k in SECTION_HEADERS}
    sections["other"] = []
    current_section = "other"
    
    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        detected = _detect_section(stripped)
        if detected:
            current_section = detected
        else:
            sections[current_section].append(stripped)
    
    return {k: "\n".join(v).strip() for k, v in sections.items() if v}


def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfminer.six (pure Python)."""
    return pdf_extract_text(io.BytesIO(file_bytes))


def parse_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(paragraphs)


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    # Remove excessive whitespace/blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    # Remove common PDF artifacts
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text.strip()


def parse_resume(file_bytes: bytes, file_type: str) -> dict:
    """
    Main entry point: parse resume file and return structured data.
    
    Returns:
        {
            "raw_text": str,
            "structured_json": {
                "summary": str,
                "experience": str,
                "education": str,
                "skills": str,
                "certifications": str,
            }
        }
    """
    if file_type == "pdf":
        raw_text = parse_pdf(file_bytes)
    elif file_type in ("docx", "doc"):
        raw_text = parse_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    raw_text = clean_text(raw_text)
    structured = _parse_sections(raw_text)
    
    return {
        "raw_text": raw_text,
        "structured_json": structured,
    }
