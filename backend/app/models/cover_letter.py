import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class ToneType(str, enum.Enum):
    professional = "professional"
    enthusiastic = "enthusiastic"
    confident = "confident"
    creative = "creative"


class LengthType(str, enum.Enum):
    short = "short"       # ~200 words
    medium = "medium"     # ~350 words
    long = "long"         # ~500 words


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id: Mapped[str | None] = mapped_column(String, ForeignKey("resumes.id", ondelete="SET NULL"))
    jd_id: Mapped[str | None] = mapped_column(String, ForeignKey("job_descriptions.id", ondelete="SET NULL"))
    content: Mapped[str] = mapped_column(Text)
    tone: Mapped[ToneType] = mapped_column(SAEnum(ToneType), default=ToneType.professional)
    length: Mapped[LengthType] = mapped_column(SAEnum(LengthType), default=LengthType.medium)
    company_name: Mapped[str | None] = mapped_column(String(255))
    job_title: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
