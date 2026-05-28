from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_admin
from app.db.session import get_session
from app.models.domain import Event, Place, Restaurant, Review, User

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/analytics")
async def analytics(session: AsyncSession = Depends(get_session)) -> dict:
    counts = {}
    for name, model in {
        "users": User,
        "places": Place,
        "restaurants": Restaurant,
        "events": Event,
        "reviews": Review,
    }.items():
        result = await session.execute(select(func.count()).select_from(model))
        counts[name] = result.scalar_one()
    return {"counts": counts, "moderation_queue": 0, "seo_pages_indexed": counts.get("places", 0)}

