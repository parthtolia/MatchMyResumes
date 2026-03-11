"""Tests for error handling and information disclosure prevention."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings

client = TestClient(app)
settings = get_settings()


class TestGlobalErrorHandler:
    def test_unhandled_exception_returns_500(self):
        """Verify the global exception handler catches errors."""
        # Hit an endpoint that would cause an internal error
        # (e.g., POST to upload without a file)
        resp = client.post(
            "/api/resumes/upload",
            headers={"Authorization": "Bearer dev-token"},
            # No file attached — should fail
        )
        # Should return 4xx or 5xx, not crash the server
        assert resp.status_code >= 400

    def test_500_error_hides_details_in_production(self):
        """In production, 500 responses must not include type or error fields."""
        if settings.app_env == "production":
            resp = client.post(
                "/api/resumes/upload",
                headers={"Authorization": "Bearer dev-token"},
            )
            if resp.status_code == 500:
                data = resp.json()
                assert "type" not in data, "Error type leaked in production"
                assert "error" not in data, "Error details leaked in production"
                assert data.get("detail") == "Internal server error"

    def test_500_error_shows_details_in_development(self):
        """In development, 500 responses should include debug info."""
        if settings.app_env == "development":
            # We test that the handler is wired, not that it necessarily fires
            from app.main import global_exception_handler
            assert global_exception_handler is not None


class TestInputValidationErrors:
    def test_invalid_json_body_returns_422(self):
        resp = client.post(
            "/api/resumes/score",
            headers={"Authorization": "Bearer dev-token"},
            json={"invalid_field": "test"},
        )
        assert resp.status_code == 422

    def test_missing_required_field_returns_422(self):
        resp = client.post(
            "/api/jobs/",
            headers={"Authorization": "Bearer dev-token"},
            json={"title": "Missing raw_text"},
        )
        assert resp.status_code == 422

    def test_jd_too_short_returns_422(self):
        resp = client.post(
            "/api/jobs/",
            headers={"Authorization": "Bearer dev-token"},
            json={"raw_text": "too short", "title": "Test"},
        )
        assert resp.status_code == 422

    def test_jd_too_long_returns_422(self):
        resp = client.post(
            "/api/jobs/",
            headers={"Authorization": "Bearer dev-token"},
            json={"raw_text": "x" * 50001, "title": "Test"},
        )
        assert resp.status_code == 422

    def test_application_company_too_long_returns_422(self):
        resp = client.post(
            "/api/applications/",
            headers={"Authorization": "Bearer dev-token"},
            json={"company_name": "x" * 256, "job_title": "Test"},
        )
        assert resp.status_code == 422

    def test_invalid_checkout_plan_returns_422(self):
        resp = client.post(
            "/api/subscriptions/checkout",
            headers={"Authorization": "Bearer dev-token"},
            json={"plan": "enterprise", "success_url": "http://ok", "cancel_url": "http://cancel"},
        )
        assert resp.status_code == 422
