from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.cover_letter import ToneType, LengthType
from app.models.application import ApplicationStatus


# ─── Job Description ──────────────────────────────────────────────────

class JDCreateRequest(BaseModel):
    raw_text: str = Field(..., min_length=100)
    title: Optional[str] = None
    company: Optional[str] = None


class JDResponse(BaseModel):
    id: str
    title: Optional[str] = None
    company: Optional[str] = None
    parsed_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Cover Letter ─────────────────────────────────────────────────────

class CoverLetterRequest(BaseModel):
    resume_id: str
    jd_id: str
    tone: ToneType = ToneType.professional
    length: LengthType = LengthType.medium
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    applicant_name: Optional[str] = None


class CoverLetterResponse(BaseModel):
    id: str
    content: str
    tone: ToneType
    length: LengthType
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Application Tracker ─────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    company_name: str = Field(..., min_length=1)
    job_title: str = Field(..., min_length=1)
    job_url: Optional[str] = None
    resume_id: Optional[str] = None
    jd_id: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.saved
    notes: Optional[str] = None
    date_applied: Optional[datetime] = None


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    date_applied: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: str
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    status: ApplicationStatus
    notes: Optional[str] = None
    date_applied: Optional[datetime] = None
    resume_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Subscription ─────────────────────────────────────────────────────

class CheckoutSessionRequest(BaseModel):
    plan: str = Field(..., pattern="^(pro|premium)$")
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str


class SubscriptionStatusResponse(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False

    model_config = {"from_attributes": True}
