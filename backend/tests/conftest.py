"""Shared test fixtures for MatchMyResumes backend tests."""
import os
import pytest
from unittest.mock import MagicMock

# Use real .env config — the DB engine is created at import time from .env.
# Tests that hit actual DB endpoints will only connect if the DB is reachable.


@pytest.fixture
def mock_request():
    """Create a mock FastAPI Request object."""
    req = MagicMock()
    req.headers = {}
    req.client = MagicMock()
    req.client.host = "127.0.0.1"
    return req


@pytest.fixture
def auth_request(mock_request):
    """Create a mock request with dev-token auth."""
    mock_request.headers = {"Authorization": "Bearer dev-token"}
    return mock_request


@pytest.fixture
def forged_jwt_request(mock_request):
    """Create a mock request with a forged JWT."""
    # This is a properly-formatted but unsigned JWT
    import base64, json
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(json.dumps({"sub": "attacker-id", "email": "evil@attacker.com"}).encode()).rstrip(b"=").decode()
    fake_token = f"{header}.{payload}.fakesignature123"
    mock_request.headers = {"Authorization": f"Bearer {fake_token}"}
    return mock_request
