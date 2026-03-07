from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from app.core.config import get_settings
import time

settings = get_settings()

# NullPool + Supabase Transaction Pooler (port 6543) is the correct setup.
# PgBouncer's transaction pooler reuses pre-warmed connections server-side,
# so we get fast queries without needing SQLAlchemy to maintain its own pool,
# which would cause "DuplicatePreparedStatementError" conflicts.
engine = create_async_engine(
    settings.database_url,
    echo=settings.app_env == "development",
    poolclass=NullPool,
    connect_args={"statement_cache_size": 0},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    t0 = time.time()
    async with AsyncSessionLocal() as session:
        t1 = time.time()
        print(f"DB: connection acquired in {t1-t0:.3f}s")
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
            print(f"DB: full request done in {time.time()-t0:.3f}s")


async def init_db():
    """Initialize database tables."""
    from app.models import user, resume, job_description, resume_score, cover_letter, application, subscription  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
