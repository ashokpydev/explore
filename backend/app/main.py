import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from app.api.router import api_router
from app.core.config import settings

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


app.include_router(api_router, prefix=settings.api_prefix)

