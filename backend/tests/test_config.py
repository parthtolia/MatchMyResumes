"""Tests for app configuration and security defaults."""
import pytest
from app.core.config import get_settings


class TestConfig:
    def test_settings_loads(self):
        settings = get_settings()
        assert settings.app_name == "MatchMyResumes"

    def test_default_environment(self):
        settings = get_settings()
        assert settings.app_env in ("development", "production", "staging")

    def test_cors_origins_is_list(self):
        settings = get_settings()
        origins = settings.allowed_origins_list
        assert isinstance(origins, list)
        assert len(origins) > 0

    def test_rate_limits_are_positive(self):
        settings = get_settings()
        assert settings.rate_limit_per_minute > 0
        assert settings.ai_rate_limit_per_minute > 0

    def test_ai_limit_stricter_than_general(self):
        settings = get_settings()
        assert settings.ai_rate_limit_per_minute <= settings.rate_limit_per_minute


class TestSecurityConfig:
    def test_docs_disabled_in_production(self):
        """Swagger docs must not be exposed in production."""
        settings = get_settings()
        if settings.app_env == "production":
            from app.main import app
            assert app.docs_url is None
            assert app.redoc_url is None

    def test_secret_key_not_default_in_production(self):
        settings = get_settings()
        if settings.app_env == "production":
            assert settings.secret_key != "change-me-in-production"
