"""
Job Description, Cover Letter, Applications, Subscriptions, and Admin Routes
"""
import asyncio
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import defer

from app.core.database import get_db
from app.core.security import get_current_user, get_user_id_from_payload
from app.core.rate_limit import limiter
from app.core.config import get_settings as _get_settings

_cfg = _get_settings()
_ai_limit = f"{_cfg.ai_rate_limit_per_minute}/minute"
_general_limit = f"{_cfg.rate_limit_per_minute}/minute"
from app.models.job_description import JobDescription
from app.models.cover_letter import CoverLetter
from app.models.application import Application
from app.models.subscription import Subscription
from app.models.user import User, PlanType
from app.models.resume import Resume
from app.schemas.common import (
    JDCreateRequest, JDResponse,
    CoverLetterRequest, CoverLetterResponse,
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    CheckoutSessionRequest, CheckoutSessionResponse, SubscriptionStatusResponse,
)
from pydantic import BaseModel
from app.services.jd_parser import parse_job_description
from app.services.embedding_service import generate_embedding
from app.services.ai_service import generate_cover_letter
from app.services import stripe_service

# ─── Job Descriptions ──────────────────────────────────────────────────

jd_router = APIRouter(prefix="/api/jobs", tags=["job-descriptions"])


@jd_router.post("/", response_model=JDResponse, status_code=201)
async def create_job_description(
    payload: JDCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)

    # Check for duplicate title
    if payload.title:
        existing_jd = await db.execute(
            select(JobDescription).where(JobDescription.user_id == user_id, JobDescription.title == payload.title)
        )
        if existing_jd.scalar_one_or_none():
            raise HTTPException(status_code=409, detail=f"A job description titled '{payload.title}' already exists. Use a different title or delete the existing one first.")

    parsed = parse_job_description(payload.raw_text)
    try:
        embedding = await generate_embedding(parsed["cleaned_text"])
    except Exception:
        embedding = None  # Embeddings are optional; semantic search won't work but JD saves fine
    
    jd = JobDescription(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=payload.title,
        company=payload.company,
        raw_text=payload.raw_text,
        parsed_json=parsed,
        embedding=embedding,
    )
    db.add(jd)
    await db.commit()
    await db.refresh(jd)
    return jd


@jd_router.get("/", response_model=List[JDResponse])
async def list_job_descriptions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(JobDescription)
        .options(defer(JobDescription.raw_text), defer(JobDescription.embedding))
        .where(JobDescription.user_id == user_id)
        .order_by(JobDescription.created_at.desc())
    )
    return result.scalars().all()


@jd_router.delete("/{jd_id}", status_code=204)
async def delete_job_description(
    jd_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(JobDescription).where(JobDescription.id == jd_id, JobDescription.user_id == user_id)
    )
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    await db.delete(jd)
    await db.commit()


# ─── Cover Letters ─────────────────────────────────────────────────────

cl_router = APIRouter(prefix="/api/cover-letters", tags=["cover-letters"])


@cl_router.post("/", response_model=CoverLetterResponse, status_code=201)
@limiter.limit(_ai_limit)
async def create_cover_letter(
    request: Request,
    payload: CoverLetterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    
    # Check plan and monthly cover letter limit
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=402, detail="Cover letter generation requires Pro or Premium plan")
    from app.routes.resumes import PLAN_LIMITS, _month_start
    cl_limits = {PlanType.free: 1, PlanType.pro: 10, PlanType.premium: -1}
    cl_limit = cl_limits.get(user.plan, 1)
    if cl_limit == 0:
        raise HTTPException(status_code=402, detail="Cover letter generation requires Pro or Premium plan")
    if cl_limit != -1:
        month_count = await db.scalar(
            select(func.count(CoverLetter.id))
            .where(CoverLetter.user_id == user_id, CoverLetter.created_at >= _month_start())
        )
        if (month_count or 0) >= cl_limit:
            upgrade_msg = "Upgrade to Pro for 10/month." if user.plan == PlanType.free else "Upgrade to Premium for unlimited."
            raise HTTPException(status_code=402, detail=f"Monthly cover letter limit reached ({cl_limit}/month). {upgrade_msg}")
    
    # Fetch resume & JD (with ownership check)
    resume_result = await db.execute(
        select(Resume).where(Resume.id == payload.resume_id, Resume.user_id == user_id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    jd_result = await db.execute(
        select(JobDescription).where(JobDescription.id == payload.jd_id, JobDescription.user_id == user_id)
    )
    jd = jd_result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Generate cover letter
    try:
        content = await generate_cover_letter(
            resume_text=resume.raw_text,
            jd_text=jd.raw_text,
            tone=payload.tone.value,
            length=payload.length.value,
            applicant_name=payload.applicant_name,
            company_name=payload.company_name or jd.company,
            job_title=payload.job_title or jd.title,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")
    
    cl = CoverLetter(
        id=str(uuid.uuid4()),
        user_id=user_id,
        resume_id=payload.resume_id,
        jd_id=payload.jd_id,
        content=content,
        tone=payload.tone,
        length=payload.length,
        company_name=payload.company_name or jd.company,
        job_title=payload.job_title or jd.title,
    )
    db.add(cl)
    await db.commit()
    await db.refresh(cl)
    return cl


@cl_router.get("/", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(CoverLetter).where(CoverLetter.user_id == user_id).order_by(CoverLetter.created_at.desc())
    )
    return result.scalars().all()


# ─── Application Tracker ───────────────────────────────────────────────

app_router = APIRouter(prefix="/api/applications", tags=["applications"])


@app_router.post("/", response_model=ApplicationResponse, status_code=201)
async def create_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)

    # Enforce job tracker limit per plan
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    tracker_limits = {PlanType.free: 20, PlanType.pro: 200, PlanType.premium: -1}
    tracker_limit = tracker_limits.get(user.plan if user else PlanType.free, 20)
    if tracker_limit != -1:
        total = await db.scalar(select(func.count(Application.id)).where(Application.user_id == user_id))
        if (total or 0) >= tracker_limit:
            upgrade_msg = "Upgrade to Pro for 200 jobs." if (not user or user.plan == PlanType.free) else "Upgrade to Premium for unlimited."
            raise HTTPException(status_code=402, detail=f"Job tracker limit reached ({tracker_limit} applications). {upgrade_msg}")

    application = Application(id=str(uuid.uuid4()), user_id=user_id, **payload.model_dump())
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


@app_router.get("/", response_model=List[ApplicationResponse])
async def list_applications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Application).where(Application.user_id == user_id).order_by(Application.created_at.desc())
    )
    return result.scalars().all()


@app_router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    payload: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == user_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(application, key, value)
    
    await db.commit()
    await db.refresh(application)
    return application


@app_router.delete("/{app_id}", status_code=204)
async def delete_application(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == user_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.delete(application)
    await db.commit()


# ─── Subscriptions ─────────────────────────────────────────────────────

sub_router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@sub_router.post("/checkout", response_model=CheckoutSessionResponse)
async def create_checkout(
    payload: CheckoutSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    user_email = current_user.get("email") or f"{user_id}@placeholder.auth"
    
    try:
        result = await stripe_service.create_checkout_session(
            user_id=user_id,
            user_email=user_email,
            plan=payload.plan,
            success_url=payload.success_url,
            cancel_url=payload.cancel_url,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return result


@sub_router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    
    try:
        result = await stripe_service.handle_webhook(payload, sig_header, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return result


@sub_router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or user.plan.value == "free":
        return SubscriptionStatusResponse(plan="free", status="none", cancel_at_period_end=False)
    
    return SubscriptionStatusResponse(
        plan=user.plan.value,
        status="active",
        current_period_end=user.stripe_current_period_end,
        cancel_at_period_end=False,
    )


# ─── Dashboard ─────────────────────────────────────────────────────────

import time

dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

class DashboardStatsResponse(BaseModel):
    resumes: int
    scans: int
    cover_letters: int
    applications: int

@dashboard_router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        t0 = time.time()
        user_id = get_user_id_from_payload(current_user)
        
        t1 = time.time()
        resume_count = await db.scalar(select(func.count(Resume.id)).where(Resume.user_id == user_id))
        
        t2 = time.time()
        cl_count = await db.scalar(select(func.count(CoverLetter.id)).where(CoverLetter.user_id == user_id))
        
        t3 = time.time()
        app_count = await db.scalar(select(func.count(Application.id)).where(Application.user_id == user_id))
        
        t4 = time.time()
        
        print(f"Stats Timing: auth={t1-t0:.3f}s, q1={t2-t1:.3f}s, q2={t3-t2:.3f}s, q3={t4-t3:.3f}s, total={t4-t0:.3f}s")
        
        return DashboardStatsResponse(
            resumes=resume_count or 0,
            scans=resume_count or 0,
            cover_letters=cl_count or 0,
            applications=app_count or 0,
        )
    except Exception as e:
        print(f"Error in stats: {e}")
        raise


@dashboard_router.get("/init")
async def dashboard_init(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Single endpoint to fetch resumes, jobs, and plan in one DB round-trip."""
    user_id = get_user_id_from_payload(current_user)

    # asyncpg runs queries sequentially on one connection (no pipeline mode),
    # but we still save 2 × TCP connection overhead vs 3 separate API calls.
    resumes_q = await db.execute(
        select(Resume)
        .where(Resume.user_id == user_id)
        .options(defer(Resume.raw_text), defer(Resume.embedding))
        .order_by(Resume.created_at.desc())
    )
    jobs_q = await db.execute(
        select(JobDescription)
        .where(JobDescription.user_id == user_id)
        .options(defer(JobDescription.raw_text), defer(JobDescription.embedding))
        .order_by(JobDescription.created_at.desc())
    )
    user_q = await db.execute(select(User).where(User.id == user_id))

    resumes = resumes_q.scalars().all()
    jobs = jobs_q.scalars().all()
    user = user_q.scalar_one_or_none()
    plan = user.plan.value if user else "free"

    return {
        "resumes": [{"id": r.id, "filename": r.filename, "version_tag": r.version_tag, "is_optimized": r.is_optimized, "created_at": r.created_at} for r in resumes],
        "jobs": [{"id": j.id, "title": j.title, "company": j.company, "created_at": j.created_at} for j in jobs],
        "plan": plan,
    }


# ─── Admin ─────────────────────────────────────────────────────────────

admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


async def require_admin(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> User:
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@admin_router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total_users = await db.scalar(select(func.count(User.id)))
    total_resumes = await db.scalar(select(func.count(Resume.id)))
    pro_users = await db.scalar(select(func.count(User.id)).where(User.plan == PlanType.pro))
    premium_users = await db.scalar(select(func.count(User.id)).where(User.plan == PlanType.premium))
    total_applications = await db.scalar(select(func.count(Application.id)))
    
    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "pro_users": pro_users,
        "premium_users": premium_users,
        "free_users": (total_users or 0) - (pro_users or 0) - (premium_users or 0),
        "total_applications": total_applications,
    }
