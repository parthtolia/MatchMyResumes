import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, ForeignKey, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id: Mapped[str] = mapped_column(String, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    jd_id: Mapped[str] = mapped_column(String, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False, index=True)

    # Score components
    total_score: Mapped[float] = mapped_column(Float, default=0.0)
    keyword_score: Mapped[float] = mapped_column(Float, default=0.0)
    semantic_score: Mapped[float] = mapped_column(Float, default=0.0)
    formatting_score: Mapped[float] = mapped_column(Float, default=0.0)
    section_score: Mapped[float] = mapped_column(Float, default=0.0)
    quantification_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Details
    matched_keywords: Mapped[list | None] = mapped_column(JSON)
    missing_keywords: Mapped[list | None] = mapped_column(JSON)
    breakdown: Mapped[dict | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="scores")
    job_description = relationship("JobDescription", back_populates="scores")
