"""
ATS Scoring Engine

Weights:
  A. Keyword Match:        40%
  B. Semantic Similarity:  25%
  C. Formatting:           15%
  D. Section Completeness: 10%
  E. Quantification:       10%
"""
import re
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from app.services.embedding_service import cosine_similarity_from_embeddings
from app.services.ai_service import extract_keywords_from_jd_ai

# ─── Weights ─────────────────────────────────────────────────────────
WEIGHTS = {
    "keyword": 0.40,
    "semantic": 0.25,
    "formatting": 0.15,
    "section": 0.10,
    "quantification": 0.10,
}

# ─── Keyword Score (40%) ─────────────────────────────────────────────

# ─── Irrelevant word filter ──────────────────────────────────────────
# Generic verbs, noise words, and common single words that appear in JDs
# but are meaningless for resume matching
IRRELEVANT_WORDS = {
    # Generic verbs
    "work", "works", "working", "ensure", "support", "improve", "manage", "build",
    "provide", "develop", "collaborate", "drive", "execute", "deliver", "maintain",
    "achieve", "create", "design", "implement", "lead", "research", "review",
    "identify", "monitor", "report", "assist", "coordinate", "participate",
    "contribute", "define", "evaluate", "analyze", "analyse", "utilize", "use",
    "apply", "meet", "help", "need", "make", "take", "give", "know", "think",
    "include", "involve", "require", "enable", "allow", "care", "grow",
    # Noise nouns / adjectives frequently in JDs
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
    # Common filler
    "etc", "also", "well", "plus", "like", "able", "possible", "based",
    "related", "relevant", "required", "preferred", "desired", "ideally",
    "minimum", "least", "such", "including", "following",
}

# Short technical terms (< 4 chars) that are valid skills and must not be filtered
KNOWN_SHORT_TECH = {
    "sql", "r", "go", "aws", "gcp", "api", "cli", "sdk", "orm",
    "css", "ml", "ai", "nlp", "etl", "bi", "qa", "ci", "cd",
    "vm", "ui", "ux", "llm", "rag", "seo", "crm", "erp", "ios",
    "git", "jvm", "net", "php", "c",
}


def is_relevant_keyword(kw: str) -> bool:
    """Return True if the keyword should be kept (is a meaningful technical/domain term)."""
    tokens = kw.lower().split()

    # Drop if all tokens are irrelevant
    if all(t in IRRELEVANT_WORDS for t in tokens):
        return False

    # Drop if any single-word keyword is in the irrelevant set
    if len(tokens) == 1 and tokens[0] in IRRELEVANT_WORDS:
        return False

    # Drop very short single words (< 4 chars) unless they are known tech acronyms
    # Note: AI returns keywords lowercase, so isupper() is always False — use allowlist instead
    if len(tokens) == 1 and len(tokens[0]) < 4:
        t = tokens[0].lower()
        if not t.isupper() and t not in KNOWN_SHORT_TECH:
            return False

    # Drop likely proper nouns (Title Case single words like "Google", "Amazon")
    # Only filter single-token title-case words that are NOT all-caps acronyms
    if len(tokens) == 1 and kw[0].isupper() and not kw.isupper() and len(kw) > 4:
        return False

    return True


def extract_top_keywords(text: str, n: int = 30) -> List[str]:
    """Extract top N relevant keywords from text using TF-IDF with noise filtering."""
    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=n * 5,  # Extract more, then filter down
            min_df=1,
        )
        vectorizer.fit([text])
        feature_names = vectorizer.get_feature_names_out()
        scores = vectorizer.transform([text]).toarray()[0]
        sorted_idx = scores.argsort()[::-1]

        # Filter irrelevant keywords and collect up to n
        result = []
        for i in sorted_idx:
            if scores[i] <= 0:
                break
            kw = feature_names[i]
            if is_relevant_keyword(kw):
                result.append(kw)
            if len(result) >= n:
                break
        return result
    except Exception:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        filtered = [w for w in set(words) if w not in IRRELEVANT_WORDS]
        return filtered[:n]


async def compute_keyword_score(
    resume_text: str, jd_text: str, top_n: int = 30
) -> Tuple[float, List[str], List[str]]:
    """
    Returns:
        (score_0_to_100, matched_keywords, missing_keywords)
    """
    # 1. Try to use Gemini to extract highly accurate semantic keywords
    raw_jd_keywords = await extract_keywords_from_jd_ai(jd_text)
    
    # 2. Add aggressive post-filter to drop any hallucinations or filler words
    jd_keywords = []
    if raw_jd_keywords:
        jd_keywords = [kw for kw in raw_jd_keywords if is_relevant_keyword(kw)]
    
    # 3. Fallback to basic TF-IDF approach if AI extraction fails or returns nothing after filtering
    if not jd_keywords:
        jd_keywords = extract_top_keywords(jd_text, n=top_n)
        
    resume_lower = resume_text.lower()

    def _kw_in_text(kw: str, text: str) -> bool:
        """Check if keyword appears as a whole word/phrase in text (not as a substring)."""
        return bool(re.search(r'(?<!\w)' + re.escape(kw.lower()) + r'(?!\w)', text))

    matched = [kw for kw in jd_keywords if _kw_in_text(kw, resume_lower)]
    missing = [kw for kw in jd_keywords if not _kw_in_text(kw, resume_lower)]
    
    score = (len(matched) / max(len(jd_keywords), 1)) * 100
    return round(score, 2), matched, missing


# ─── Semantic Score (25%) ─────────────────────────────────────────────

async def compute_semantic_score(
    resume_embedding: List[float], jd_embedding: List[float]
) -> float:
    """Compute semantic similarity score (0-100)."""
    if not resume_embedding or not jd_embedding:
        return 0.0
    similarity = await cosine_similarity_from_embeddings(resume_embedding, jd_embedding)
    # Cosine similarity is -1 to 1; normalize to 0-100
    score = max(0.0, similarity) * 100
    return round(score, 2)


# ─── Formatting Score (15%) ───────────────────────────────────────────

def compute_formatting_score(resume_text: str, file_type: str = "pdf") -> Tuple[float, Dict[str, Any]]:
    """
    Check ATS-safe formatting heuristics.
    Returns (score_0_to_100, details_dict)
    """
    checks = {}
    
    # Check for table indicators (pipe characters suggesting table layout)
    has_tables = bool(re.search(r'\|.*\|', resume_text))
    checks["no_tables"] = not has_tables
    
    # Check for special characters that break ATS
    special_chars = len(re.findall(r'[©®™•◆▪▸►→✓✔★☆❖□■●]', resume_text))
    checks["minimal_special_chars"] = special_chars < 15
    
    # Check for standard section headings
    section_words = ["experience", "education", "skills", "summary"]
    found_sections = sum(1 for s in section_words if s in resume_text.lower())
    checks["standard_headings"] = found_sections >= 3
    
    # Check for appropriate length (not too short/long)
    word_count = len(resume_text.split())
    checks["appropriate_length"] = 200 <= word_count <= 1500
    
    # Check for contact info patterns
    has_email = bool(re.search(r'\b[\w.-]+@[\w.-]+\.\w+\b', resume_text))
    checks["has_contact_info"] = has_email
    
    passed = sum(1 for v in checks.values() if v)
    score = (passed / len(checks)) * 100
    return round(score, 2), checks


# ─── Section Score (10%) ─────────────────────────────────────────────

def compute_section_score(structured_json: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
    """Check if key resume sections are present."""
    required = ["experience", "education", "skills"]
    optional = ["summary", "certifications"]
    
    present = {}
    for section in required:
        content = structured_json.get(section, "")
        present[section] = bool(content and len(content.strip()) > 20)
    
    for section in optional:
        content = structured_json.get(section, "")
        present[section] = bool(content and len(content.strip()) > 20)
    
    # Required sections count fully, optional add bonus
    required_score = sum(1 for s in required if present.get(s, False)) / len(required)
    optional_bonus = sum(1 for s in optional if present.get(s, False)) / (len(optional) * 2)
    
    score = min(100, (required_score + optional_bonus) * 100)
    return round(score, 2), present


# ─── Quantification Score (10%) ──────────────────────────────────────

def compute_quantification_score(resume_text: str) -> Tuple[float, Dict[str, Any]]:
    """Detect quantifiable achievements in resume."""
    patterns = {
        "percentages": r'\d+(\.\d+)?\s*%',
        "dollar_amounts": r'\$[\d,]+(\.\d+)?[KkMmBb]?',
        "large_numbers": r'\b\d{1,3}(,\d{3})+\b',
        "metrics_x": r'\b\d+x\b',
        "team_size": r'\b(team of|managed|led)\s+\d+',
        "year_ranges": r'\b20\d\d\s*[-–]\s*(20\d\d|present)\b',
    }
    
    found = {}
    total_hits = 0
    for name, pattern in patterns.items():
        matches = re.findall(pattern, resume_text, re.IGNORECASE)
        count = len(matches)
        found[name] = count
        total_hits += count
    
    # Score based on number of quantifiable elements (10+ is excellent)
    score = min(100, total_hits * 10)
    return round(score, 2), found


# ─── Master Scoring Function ──────────────────────────────────────────

async def compute_ats_score(
    resume_text: str,
    jd_text: str,
    resume_embedding: List[float],
    jd_embedding: List[float],
    structured_json: Dict[str, Any],
    file_type: str = "pdf",
    top_keywords: int = 30,
) -> Dict[str, Any]:
    """
    Compute full ATS score with all components.
    
    Returns a detailed dict with scores, matched/missing keywords, and breakdowns.
    """
    # A. Keyword
    kw_score, matched_kw, missing_kw = await compute_keyword_score(resume_text, jd_text, top_keywords)
    
    # B. Semantic
    sem_score = await compute_semantic_score(resume_embedding, jd_embedding)
    
    # C. Formatting
    fmt_score, fmt_details = compute_formatting_score(resume_text, file_type)
    
    # D. Section Completeness
    sec_score, sec_details = compute_section_score(structured_json)
    
    # E. Quantification
    quant_score, quant_details = compute_quantification_score(resume_text)
    
    # Weighted total
    total = (
        kw_score * WEIGHTS["keyword"]
        + sem_score * WEIGHTS["semantic"]
        + fmt_score * WEIGHTS["formatting"]
        + sec_score * WEIGHTS["section"]
        + quant_score * WEIGHTS["quantification"]
    )
    
    return {
        "total_score": round(total, 1),
        "keyword_score": kw_score,
        "semantic_score": sem_score,
        "formatting_score": fmt_score,
        "section_score": sec_score,
        "quantification_score": quant_score,
        "matched_keywords": matched_kw,
        "missing_keywords": missing_kw,
        "breakdown": {
            "keyword": {"score": kw_score, "weight": "40%", "matched": len(matched_kw), "missing": len(missing_kw)},
            "semantic": {"score": sem_score, "weight": "25%"},
            "formatting": {"score": fmt_score, "weight": "15%", "checks": fmt_details},
            "section": {"score": sec_score, "weight": "10%", "sections": sec_details},
            "quantification": {"score": quant_score, "weight": "10%", "found": quant_details},
        },
    }
