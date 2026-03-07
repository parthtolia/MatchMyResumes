import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10))  # pdf or docx
    raw_text: Mapped[str] = mapped_column(Text)
    structured_json: Mapped[dict | None] = mapped_column(JSON)  # {summary, experience, education, skills, certifications}
    embedding: Mapped[list | None] = mapped_column(Vector(3072))  # gemini-embedding-001 dim
    version_tag: Mapped[str | None] = mapped_column(String(255))  # e.g. "Software Engineer v2"
    is_optimized: Mapped[bool] = mapped_column(default=False)
    parent_resume_id: Mapped[str | None] = mapped_column(String, ForeignKey("resumes.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates=None)
    scores = relationship("ResumeScore", back_populates="resume", cascade="all, delete-orphan")
