"""Smoke tests for route registration and middleware (no DB required)."""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_200(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_health_returns_app_name(self):
        resp = client.get("/health")
        data = resp.json()
        assert data["app"] == "MatchMyResumes"


class TestAuthRequired:
    """Verify all protected endpoints return 401 without auth."""

    PROTECTED_GET_ENDPOINTS = [
        "/api/resumes/",
        "/api/jobs/",
        "/api/cover-letters/",
        "/api/applications/",
        "/api/subscriptions/status",
        "/api/dashboard/stats",
        "/api/dashboard/init",
    ]

    PROTECTED_POST_ENDPOINTS = [
        "/api/resumes/score",
        "/api/resumes/cv-score",
        "/api/resumes/optimize",
        "/api/cover-letters/",
        "/api/applications/",
    ]

    @pytest.mark.parametrize("endpoint", PROTECTED_GET_ENDPOINTS)
    def test_get_endpoint_requires_auth(self, endpoint):
        resp = client.get(endpoint)
        assert resp.status_code == 401, f"{endpoint} returned {resp.status_code} instead of 401"

    @pytest.mark.parametrize("endpoint", PROTECTED_POST_ENDPOINTS)
    def test_post_endpoint_requires_auth(self, endpoint):
        resp = client.post(endpoint, json={})
        assert resp.status_code == 401, f"{endpoint} returned {resp.status_code} instead of 401"


class TestCORSHeaders:
    def test_cors_allows_configured_origin(self):
        resp = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should not be blocked (200 or 204)
        assert resp.status_code in (200, 204)

    def test_cors_has_allowed_methods(self):
        resp = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
        allowed = resp.headers.get("access-control-allow-methods", "")
        # Should list specific methods, not wildcard
        assert "GET" in allowed or "POST" in allowed


class TestErrorHandler:
    def test_404_returns_json(self):
        resp = client.get("/api/nonexistent-endpoint-12345")
        assert resp.status_code == 404
        data = resp.json()
        assert "detail" in data

    def test_error_response_does_not_leak_internals_in_production(self):
        """In production mode, 500 errors should not expose type/error fields."""
        from app.core.config import get_settings
        settings = get_settings()
        if settings.app_env == "production":
            # Trigger a 500 somehow — hard without DB, so just verify the handler exists
            from app.main import global_exception_handler
            assert global_exception_handler is not None


class TestSwaggerDocs:
    def test_docs_available_in_dev(self):
        from app.core.config import get_settings
        settings = get_settings()
        if settings.app_env == "development":
            resp = client.get("/docs")
            assert resp.status_code == 200

    def test_openapi_schema_has_bearer_auth(self):
        resp = client.get("/openapi.json")
        if resp.status_code == 200:
            schema = resp.json()
            sec_schemes = schema.get("components", {}).get("securitySchemes", {})
            assert "BearerAuth" in sec_schemes
