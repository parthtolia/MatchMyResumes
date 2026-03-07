"""
Resume & ATS Scoring Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import defer

from app.core.database import get_db
from app.core.security import get_current_user, get_user_id_from_payload
from app.models.resume import Resume
from app.models.user import User, PlanType
from app.models.job_description import JobDescription
from app.models.resume_score import ResumeScore
from app.schemas.resume import (
    ResumeUploadResponse, ResumeListItem, ResumeDetail,
    ATSScoreRequest, ATSScoreResponse, ScoreBreakdown,
    OptimizeResumeRequest, OptimizeResumeResponse,
)
from app.services.resume_parser import parse_resume
from app.services.jd_parser import parse_job_description
from app.services.embedding_service import generate_embedding
from app.services.ai_service import optimize_resume
from app.scoring.ats_scorer import compute_ats_score
from app.scoring.cv_scorer import compute_cv_score

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

ALLOWED_TYPES = {"application/pdf": "pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _get_usage_limit(plan: PlanType) -> int:
    return {PlanType.free: 2, PlanType.pro: 999, PlanType.premium: 9999}.get(plan, 2)


@router.post("/upload", response_model=ResumeUploadResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    version_tag: str = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Upload and parse a resume (PDF or DOCX)."""
    user_id = get_user_id_from_payload(current_user)
    
    # Validate file type
    file_type = ALLOWED_TYPES.get(file.content_type)
    filename_lower = (file.filename or "").lower()
    if not file_type:
        if filename_lower.endswith(".pdf"):
            file_type = "pdf"
        elif filename_lower.endswith(".docx"):
            file_type = "docx"
        else:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are accepted")
    
    # Check for duplicate filename (for this user)
    existing = await db.execute(
        select(Resume).where(Resume.user_id == user_id, Resume.filename == file.filename)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"A resume named '{file.filename}' already exists. Rename the file or delete the existing one first.")

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Parse resume
    try:
        parsed = parse_resume(file_bytes, file_type)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse resume: {str(e)}")
    
    # Generate embedding
    try:
        embedding = await generate_embedding(parsed["raw_text"])
    except Exception:
        embedding = None
    
    # Ensure user exists
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        # Explicitly set all fields with defaults — SQLAlchemy 2.0 mapped_column(default=...)
        # does NOT apply Python-level defaults at object creation time (only at INSERT flush).
        user = User(
            id=user_id,
            email=current_user.get("email") or f"{user_id}@placeholder.auth",
            clerk_id=user_id,
            plan=PlanType.free,
            usage_count=0,
            is_active=True,
            is_admin=False,
        )
        db.add(user)

    # Check usage limit for free plan
    count = user.usage_count or 0
    if user.plan == PlanType.free and count >= _get_usage_limit(PlanType.free):
        raise HTTPException(status_code=402, detail="Monthly upload limit reached. Upgrade to Pro for unlimited scans.")

    # Save resume
    resume = Resume(
        id=str(uuid.uuid4()),
        user_id=user_id,
        filename=file.filename,
        file_type=file_type,
        raw_text=parsed["raw_text"],
        structured_json=parsed["structured_json"],
        embedding=embedding,
        version_tag=version_tag,
        is_optimized=False,
    )
    db.add(resume)
    user.usage_count = (user.usage_count or 0) + 1
    await db.commit()
    await db.refresh(resume)
    
    return resume


@router.get("/", response_model=List[ResumeListItem])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all resumes for the current user."""
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Resume)
        .options(defer(Resume.raw_text), defer(Resume.structured_json), defer(Resume.embedding))
        .where(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{resume_id}", response_model=ResumeDetail)
async def get_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get resume detail by ID."""
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete a resume."""
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    await db.delete(resume)
    await db.commit()


@router.post("/score", response_model=ATSScoreResponse)
async def score_resume(
    request: ATSScoreRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Compute ATS score for a resume against a job description."""
    user_id = get_user_id_from_payload(current_user)
    
    # Fetch resume
    resume_result = await db.execute(
        select(Resume).where(Resume.id == request.resume_id, Resume.user_id == user_id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Fetch JD
    jd_result = await db.execute(
        select(JobDescription).where(JobDescription.id == request.jd_id, JobDescription.user_id == user_id)
    )
    jd = jd_result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Generate embeddings if missing (use `is None` not `not` — pgvector returns numpy arrays
    # which raise ValueError when used in boolean context with `not` or `or`)
    if resume.embedding is None and resume.raw_text:
        resume.embedding = await generate_embedding(resume.raw_text)
    if jd.embedding is None and jd.raw_text:
        jd.embedding = await generate_embedding(jd.raw_text)

    resume_emb = resume.embedding.tolist() if hasattr(resume.embedding, "tolist") else (resume.embedding or [])
    jd_emb = jd.embedding.tolist() if hasattr(jd.embedding, "tolist") else (jd.embedding or [])

    # Compute score
    score_data = await compute_ats_score(
        resume_text=resume.raw_text,
        jd_text=jd.raw_text,
        resume_embedding=resume_emb,
        jd_embedding=jd_emb,
        structured_json=resume.structured_json or {},
        file_type=resume.file_type,
    )
    
    # Store score
    score_record = ResumeScore(
        id=str(uuid.uuid4()),
        resume_id=resume.id,
        jd_id=jd.id,
        total_score=score_data["total_score"],
        keyword_score=score_data["keyword_score"],
        semantic_score=score_data["semantic_score"],
        formatting_score=score_data["formatting_score"],
        section_score=score_data["section_score"],
        quantification_score=score_data["quantification_score"],
        matched_keywords=score_data["matched_keywords"],
        missing_keywords=score_data["missing_keywords"],
        breakdown=score_data["breakdown"],
    )
    db.add(score_record)
    await db.commit()
    await db.refresh(score_record)
    
    return ATSScoreResponse(
        id=score_record.id,
        resume_id=resume.id,
        jd_id=jd.id,
        total_score=score_record.total_score,
        breakdown=ScoreBreakdown(
            keyword_score=score_record.keyword_score,
            semantic_score=score_record.semantic_score,
            formatting_score=score_record.formatting_score,
            section_score=score_record.section_score,
            quantification_score=score_record.quantification_score,
            details=score_record.breakdown,
        ),
        matched_keywords=score_record.matched_keywords or [],
        missing_keywords=score_record.missing_keywords or [],
        created_at=score_record.created_at,
    )


from pydantic import BaseModel as PydanticBaseModel

class CVScoreRequest(PydanticBaseModel):
    resume_id: str

@router.post("/cv-score")
async def cv_score_resume(
    request: CVScoreRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Compute a standalone CV quality score without a JD."""
    user_id = get_user_id_from_payload(current_user)
    result = await db.execute(
        select(Resume).where(Resume.id == request.resume_id, Resume.user_id == user_id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume has no parsed text")

    score_data = compute_cv_score(
        resume_text=resume.raw_text,
        structured_json=resume.structured_json or {},
    )
    return {"resume_id": resume.id, "filename": resume.filename, **score_data}



@router.post("/optimize", response_model=OptimizeResumeResponse)
async def optimize_resume_endpoint(
    request: OptimizeResumeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """AI-optimize a resume for a job description (Pro/Premium only)."""
    user_id = get_user_id_from_payload(current_user)
    
    # Check plan access
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user or user.plan == PlanType.free:
        raise HTTPException(status_code=402, detail="AI optimization requires Pro or Premium plan")
    
    # Fetch resume & JD
    resume_result = await db.execute(
        select(Resume).where(Resume.id == request.resume_id, Resume.user_id == user_id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not request.jd_id and not request.jd_text:
        raise HTTPException(status_code=400, detail="Must provide either jd_id or jd_text")

    raw_jd_text = ""
    job_title = "job"
    missing_keywords = []

    if request.jd_id:
        jd_result = await db.execute(
            select(JobDescription).where(JobDescription.id == request.jd_id)
        )
        jd = jd_result.scalar_one_or_none()
        if not jd:
            raise HTTPException(status_code=404, detail="Job description not found")
        raw_jd_text = jd.raw_text
        job_title = jd.title or "job"
        
        # Get missing keywords for context
        score_result = await db.execute(
            select(ResumeScore)
            .where(ResumeScore.resume_id == resume.id, ResumeScore.jd_id == jd.id)
            .order_by(ResumeScore.created_at.desc())
            .limit(1)
        )
        latest_score = score_result.scalar_one_or_none()
        missing_keywords = latest_score.missing_keywords if latest_score else []
    else:
        raw_jd_text = request.jd_text
        job_title = "custom job"
    # Run AI optimization
    try:
        result = await optimize_resume(
            resume_text=resume.raw_text,
            jd_text=raw_jd_text,
            missing_keywords=missing_keywords,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI optimization failed: {str(e)}")
    
    new_resume_id = None
    if request.save_as_version:
        tag = request.version_tag or f"Optimized for {job_title}"
        
        # Calculate version number for this specific root resume
        count_result = await db.execute(
            select(func.count(Resume.id)).where(Resume.parent_resume_id == resume.id)
        )
        version_count = count_result.scalar() or 0
        new_version = version_count + 1
        
        # Clean JD title for filename (remove invalid chars)
        clean_jd_title = "".join(c for c in job_title if c.isalnum() or c in " -_").strip().replace(" ", "_").replace("__", "_")
        if not clean_jd_title:
            clean_jd_title = "job"
            
        # Extract base and extension
        parts = resume.filename.rsplit('.', 1)
        base_name = parts[0]
        ext = parts[1] if len(parts) > 1 else "txt"
        
        new_filename = f"{base_name}_{clean_jd_title}_v{new_version}.{ext}"

        new_embedding = await generate_embedding(result.get("optimized_text", ""))
        new_resume = Resume(
            id=str(uuid.uuid4()),
            user_id=user_id,
            filename=new_filename,
            file_type=resume.file_type,
            raw_text=result.get("optimized_text", resume.raw_text),
            structured_json=result.get("structured_json", resume.structured_json),
            embedding=new_embedding,
            version_tag=tag,
            is_optimized=True,
            parent_resume_id=resume.id,
        )
        db.add(new_resume)
        await db.commit()
        await db.refresh(new_resume)
        new_resume_id = new_resume.id
    
    return OptimizeResumeResponse(
        optimized_text=result.get("optimized_text", ""),
        changes_summary=result.get("changes_summary", []),
        new_resume_id=new_resume_id,
        structured_json=result.get("structured_json"),
    )
