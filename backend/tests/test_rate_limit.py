"""Tests for rate limiting configuration."""
import pytest
from app.core.rate_limit import limiter
from app.core.config import get_settings


class TestRateLimiter:
    def test_limiter_instance_exists(self):
        assert limiter is not None

    def test_limiter_uses_remote_address(self):
        assert limiter._key_func.__name__ == "get_remote_address"

    def test_shared_limiter_same_instance(self):
        """All route files must import the same limiter instance."""
        from app.core.rate_limit import limiter as core_limiter
        from app.routes.resumes import limiter as resume_limiter
        assert core_limiter is resume_limiter

    def test_rate_limit_config_values(self):
        settings = get_settings()
        assert settings.rate_limit_per_minute == 60
        assert settings.ai_rate_limit_per_minute == 10
