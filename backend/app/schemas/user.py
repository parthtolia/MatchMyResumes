from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import PlanType


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    clerk_id: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    plan: Optional[PlanType] = None


class UserResponse(UserBase):
    id: str
    plan: PlanType
    usage_count: int
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageLimitResponse(BaseModel):
    plan: PlanType
    usage_count: int
    usage_limit: int
    remaining: int
    can_use_ai: bool
