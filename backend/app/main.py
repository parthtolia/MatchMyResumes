"""
MatchMyResumes – FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import init_db
from app.core.rate_limit import limiter
from app.routes.resumes import router as resume_router
from app.routes.all_routes import (
    jd_router, cl_router, app_router, sub_router, admin_router, dashboard_router
)
from app.routes.stripe import router as stripe_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up the DB connection on startup so the first user request is fast.
    A plain SELECT 1 triggers SQLAlchemy's one-time dialect init queries
    (pg_catalog.version, current_schema, etc.) before any user hits the server.
    """
    try:
        from app.core.database import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("DB warmup complete.")
    except Exception as e:
        print(f"DB warmup failed (non-fatal): {e}")
    yield


app = FastAPI(
    title="MatchMyResumes API",
    description="ATS Resume & Cover Letter Optimization Suite",
    version="1.0.0",
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url="/redoc" if settings.app_env == "development" else None,
    lifespan=lifespan,
)

# Add Bearer token security scheme so Swagger UI shows the Authorize button
from fastapi.openapi.utils import get_openapi  # noqa

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema.setdefault("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer"}
    }
    schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# Register routers
app.include_router(resume_router)
app.include_router(jd_router)
app.include_router(cl_router)
app.include_router(app_router)
app.include_router(sub_router)
app.include_router(admin_router)
app.include_router(stripe_router)
app.include_router(dashboard_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.app_name, "version": "1.0.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True)
    if settings.app_env == "development":
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
