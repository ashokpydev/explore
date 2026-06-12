from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.domain import Restaurant
from app.schemas.domain import FoodAIRequest, FoodAIResponse, RestaurantRead
from app.services.ai import ai_service

router = APIRouter(prefix="/food", tags=["food"])


@router.get("/restaurants", response_model=list[RestaurantRead])
async def restaurants(
    cuisine: str | None = None,
    open_late: bool | None = None,
    limit: int = Query(default=20, le=100),
    session: AsyncSession = Depends(get_session),
) -> list[Restaurant]:
    stmt = select(Restaurant).order_by(Restaurant.rating.desc()).limit(limit)
    if open_late is not None:
        stmt = stmt.where(Restaurant.open_late == open_late)
    result = await session.execute(stmt)
    items = list(result.scalars().all())
    if cuisine:
        items = [item for item in items if cuisine.lower() in [c.lower() for c in item.cuisine]]
    return items


@router.post("/ai/recommendations", response_model=FoodAIResponse)
async def ai_food_recommendations(
    payload: FoodAIRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    return await ai_service.food_recommendations(payload.model_dump(), session)
