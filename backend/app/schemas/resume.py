from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    structured_json: Optional[Dict[str, Any]] = None
    version_tag: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeListItem(BaseModel):
    id: str
    filename: str
    version_tag: Optional[str] = None
    is_optimized: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeDetail(ResumeListItem):
    raw_text: str
    structured_json: Optional[Dict[str, Any]] = None


class ResumeVersionCreate(BaseModel):
    source_resume_id: str
    version_tag: str


class ATSScoreRequest(BaseModel):
    resume_id: str
    jd_id: str


class ScoreBreakdown(BaseModel):
    keyword_score: float = Field(..., ge=0, le=100)
    semantic_score: float = Field(..., ge=0, le=100)
    formatting_score: float = Field(..., ge=0, le=100)
    section_score: float = Field(..., ge=0, le=100)
    quantification_score: float = Field(..., ge=0, le=100)
    details: Optional[Dict[str, Any]] = None


class ATSScoreResponse(BaseModel):
    id: str
    resume_id: str
    jd_id: str
    total_score: float
    breakdown: ScoreBreakdown
    matched_keywords: List[str]
    missing_keywords: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class OptimizeResumeRequest(BaseModel):
    resume_id: str
    jd_id: Optional[str] = None
    jd_text: Optional[str] = Field(None, max_length=50000)
    save_as_version: bool = True
    version_tag: Optional[str] = Field(None, max_length=255)


class OptimizeResumeResponse(BaseModel):
    optimized_text: str
    changes_summary: List[str]
    new_resume_id: Optional[str] = None
    structured_json: Optional[Dict[str, Any]] = None
