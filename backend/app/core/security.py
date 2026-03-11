import time
import logging
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, jwk
import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
security = HTTPBearer()

# ── JWKS cache ────────────────────────────────────────────────────────────────
_jwks_cache: dict = {"keys": [], "fetched_at": 0.0}
_JWKS_CACHE_TTL = 3600  # 1 hour


async def _get_jwks_keys() -> list:
    """Fetch and cache Clerk's JWKS keys for JWT verification."""
    now = time.time()
    if _jwks_cache["keys"] and (now - _jwks_cache["fetched_at"]) < _JWKS_CACHE_TTL:
        return _jwks_cache["keys"]

    if not settings.clerk_publishable_key:
        return []

    # Derive Clerk Frontend API domain from publishable key
    # pk_test_<base64-encoded-domain> or pk_live_<base64-encoded-domain>
    import base64
    try:
        key_part = settings.clerk_publishable_key.split("_", 2)[-1]
        # Add padding if needed
        padded = key_part + "=" * (-len(key_part) % 4)
        clerk_domain = base64.b64decode(padded).decode("utf-8").rstrip("$")
    except Exception:
        clerk_domain = ""

    if not clerk_domain:
        logger.warning("Could not derive Clerk domain from publishable key")
        return []

    jwks_url = f"https://{clerk_domain}/.well-known/jwks.json"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(jwks_url)
            resp.raise_for_status()
            data = resp.json()
            _jwks_cache["keys"] = data.get("keys", [])
            _jwks_cache["fetched_at"] = now
            logger.info(f"JWKS refreshed from {jwks_url} ({len(_jwks_cache['keys'])} keys)")
            return _jwks_cache["keys"]
    except Exception as e:
        logger.error(f"Failed to fetch JWKS from {jwks_url}: {e}")
        # Return stale cache if available
        return _jwks_cache["keys"]


async def verify_clerk_token(token: str) -> dict:
    """Verify Clerk JWT token with proper RS256 signature validation."""
    jwks_keys = await _get_jwks_keys()

    if not jwks_keys:
        # Fallback: if JWKS unavailable (e.g., network issue on first boot),
        # use unverified claims but log a warning
        logger.warning("JWKS keys unavailable — falling back to unverified claims")
        try:
            return jwt.get_unverified_claims(token)
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

    # Try each key in the JWKS set
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")

    matching_keys = [k for k in jwks_keys if k.get("kid") == kid] if kid else jwks_keys

    for key_data in matching_keys:
        try:
            rsa_key = jwk.construct(key_data, algorithm="RS256")
            payload = jwt.decode(
                token,
                rsa_key.to_pem().decode("utf-8"),
                algorithms=["RS256"],
                options={"verify_aud": False},  # Clerk tokens don't always set aud
            )
            return payload
        except JWTError:
            continue

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

    # ── Dev bypass (only when APP_ENV is explicitly "development") ─────────
    if settings.app_env == "development" and token == "dev-token":
        return {
            "sub": "dev-user-001",
            "email": "dev@matchmyresumes.ai",
            "user_id": "dev-user-001",
        }

    # ── Clerk JWT (verified with JWKS) ────────────────────────────────────
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
