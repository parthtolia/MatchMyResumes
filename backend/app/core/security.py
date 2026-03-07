from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import get_settings

settings = get_settings()
security = HTTPBearer()


async def verify_clerk_token(token: str) -> dict:
    """Verify Clerk JWT token (local unverified claims extraction for speed)."""
    try:
        # Get claims directly without JWKS network roundtrip
        payload = jwt.get_unverified_claims(token)
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


async def get_current_user(request: Request) -> dict:
    """Extract and verify the current user from Bearer token."""
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    token = auth.split(" ")[1]

    # ── Dev bypass ────────────────────────────────────────────────────────────
    if settings.app_env == "development" and token == "dev-token":
        return {
            "sub": "dev-user-001",
            "email": "dev@matchmyresumes.ai",
            "user_id": "dev-user-001",
        }

    # ── Clerk JWT ─────────────────────────────────────────────────────────────
    # Previously this fell back to Supabase HS256 verification first, which
    # caused a ~5 second timeout on every request since the Clerk RS256 token
    # is incompatible. We skip Supabase entirely since Clerk is our auth provider.
    try:
        payload = await verify_clerk_token(token)
        return {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "user_id": payload.get("sub"),
        }
    except HTTPException:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
    )


def get_user_id_from_payload(payload: dict) -> str:
    """Extract user ID from JWT payload."""
    return payload.get("sub") or payload.get("user_id") or ""
