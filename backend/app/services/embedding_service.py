"""
Embedding Service
Uses Google Gemini to generate 768-dim vectors.
Falls back to None gracefully if the API is unavailable.
"""
from typing import List, Optional
import google.generativeai as genai
import numpy as np
from app.core.config import get_settings

settings = get_settings()
_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        genai.configure(api_key=settings.gemini_api_key)
        _configured = True


async def generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generate a 768-dim embedding vector using Gemini.
    Returns None on any API failure — callers must handle None gracefully.
    Semantic scoring simply falls back to 0.0 when embeddings are unavailable.
    """
    try:
        _ensure_configured()
        truncated = text[:8000]
        result = genai.embed_content(
            model=settings.gemini_embedding_model,
            content=truncated,
            task_type="retrieval_document",
        )
        return result["embedding"]
    except Exception as e:
        # Common causes: model not available in this region/plan, API key lacks
        # embedding quota, or network issue. ATS scoring degrades gracefully.
        print(f"[embedding_service] WARNING: Embedding failed ({type(e).__name__}): {e}")
        return None


async def cosine_similarity_from_embeddings(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))
