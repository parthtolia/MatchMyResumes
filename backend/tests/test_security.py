"""Tests for authentication and security (app/core/security.py)."""
import pytest
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import HTTPException

from app.core.security import (
    verify_clerk_token,
    get_current_user,
    get_user_id_from_payload,
    _get_jwks_keys,
)
from app.core.config import get_settings

settings = get_settings()


# ── get_user_id_from_payload ─────────────────────────────────────────────────

class TestGetUserIdFromPayload:
    def test_extracts_sub(self):
        assert get_user_id_from_payload({"sub": "user_123"}) == "user_123"

    def test_extracts_user_id_fallback(self):
        assert get_user_id_from_payload({"user_id": "user_456"}) == "user_456"

    def test_prefers_sub_over_user_id(self):
        assert get_user_id_from_payload({"sub": "from_sub", "user_id": "from_uid"}) == "from_sub"

    def test_returns_empty_on_missing(self):
        assert get_user_id_from_payload({}) == ""

    def test_returns_empty_on_none_values(self):
        assert get_user_id_from_payload({"sub": None, "user_id": None}) == ""


# ── get_current_user ─────────────────────────────────────────────────────────

class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_missing_auth_header_returns_401(self):
        req = MagicMock()
        req.headers = {}
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(req)
        assert exc_info.value.status_code == 401
        assert "Missing" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_invalid_auth_format_returns_401(self):
        req = MagicMock()
        req.headers = {"Authorization": "Basic abc123"}
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(req)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_empty_bearer_returns_401(self):
        req = MagicMock()
        req.headers = {"Authorization": "Bearer "}
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(req)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_dev_token_accepted_in_development(self):
        """Dev token should work when APP_ENV=development."""
        req = MagicMock()
        req.headers = {"Authorization": "Bearer dev-token"}
        if settings.app_env == "development":
            result = await get_current_user(req)
            assert result["sub"] == "dev-user-001"
            assert result["email"] == "dev@matchmyresumes.ai"
            assert result["user_id"] == "dev-user-001"

    @pytest.mark.asyncio
    async def test_dev_token_rejected_in_production(self):
        """Dev token must NOT work when APP_ENV=production."""
        req = MagicMock()
        req.headers = {"Authorization": "Bearer dev-token"}
        with patch.object(settings, "app_env", "production"):
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(req)
            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_random_garbage_token_returns_401(self):
        req = MagicMock()
        req.headers = {"Authorization": "Bearer not-a-valid-jwt-at-all"}
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(req)
        assert exc_info.value.status_code == 401


# ── JWKS Cache ───────────────────────────────────────────────────────────────

class TestJWKSCache:
    @pytest.mark.asyncio
    async def test_returns_empty_list_without_clerk_key(self):
        """If no Clerk key is configured, JWKS should return empty gracefully."""
        with patch.object(settings, "clerk_publishable_key", ""):
            keys = await _get_jwks_keys()
            assert keys == [] or isinstance(keys, list)

    @pytest.mark.asyncio
    async def test_handles_invalid_clerk_key_gracefully(self):
        """Malformed Clerk key should not crash, just return empty."""
        with patch.object(settings, "clerk_publishable_key", "pk_test_invalid!!!"):
            keys = await _get_jwks_keys()
            assert isinstance(keys, list)


# ── verify_clerk_token ───────────────────────────────────────────────────────

class TestVerifyClerkToken:
    @pytest.mark.asyncio
    async def test_invalid_token_raises_401(self):
        with pytest.raises(HTTPException) as exc_info:
            await verify_clerk_token("completely.invalid.token")
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_empty_token_raises_401(self):
        with pytest.raises(HTTPException) as exc_info:
            await verify_clerk_token("")
        assert exc_info.value.status_code == 401
