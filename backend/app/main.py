import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.services import cache

logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Explore Hyderabad API",
    description="AI-powered tourism, city exploration, itinerary, food, safety, and geo platform.",
    version="1.0.0",
)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error", path=request.url.path, error=str(exc))
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


@app.get("/ready")
async def ready() -> JSONResponse:
    checks: dict[str, str] = {}
    status_code = 200

    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        logger.warning("readiness_database_failed", error=str(exc))
        checks["database"] = "unavailable"
        status_code = 503

    try:
        await cache.ping()
        checks["redis"] = "ok"
    except Exception as exc:
        logger.warning("readiness_redis_failed", error=str(exc))
        checks["redis"] = "unavailable"
        status_code = 503

    checks["ai"] = "configured" if settings.openai_api_key else "offline_fallback"
    checks["maps"] = "configured" if settings.google_maps_api_key else "not_configured"
    return JSONResponse(
        status_code=status_code,
        content={"status": "ready" if status_code == 200 else "degraded", "checks": checks},
    )


app.include_router(api_router, prefix=settings.api_prefix)
