from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.schemas.domain import FoodAIRequest, FoodAIResponse, RestaurantPhotoRead, RestaurantRead
from app.services.ai import ai_service
from app.services.food_catalog import food_catalog_as_restaurant_rows
from app.services.google_places import get_restaurant_photo

router = APIRouter(prefix="/food", tags=["food"])


@router.get("/restaurants", response_model=list[RestaurantRead])
async def restaurants(
    cuisine: str | None = None,
    open_late: bool | None = None,
    limit: int = Query(default=20, le=100),
    session: AsyncSession = Depends(get_session),  # Keeps route dependency lifecycle aligned.
) -> list[dict]:
    del session
    items = sorted(food_catalog_as_restaurant_rows(), key=lambda item: item["rating"], reverse=True)
    if open_late is not None:
        items = [item for item in items if item["open_late"] == open_late]
    if cuisine:
        cuisine_lower = cuisine.lower()
        items = [
            item
            for item in items
            if cuisine_lower in item["category"].lower()
            or any(cuisine_lower in value.lower() for value in item["cuisine"])
            or any(cuisine_lower in value.lower() for value in item["highlights"])
        ]
    return items[:limit]


@router.get("/restaurants/photo", response_model=RestaurantPhotoRead)
async def restaurant_photo(
    name: str = Query(min_length=2, max_length=180),
    address: str = Query(default="Hyderabad", max_length=300),
    width: int = Query(default=900, ge=200, le=1600),
) -> dict:
    return await get_restaurant_photo(name=name, address=address, width=width)


@router.post("/ai/recommendations", response_model=FoodAIResponse)
async def ai_food_recommendations(
    payload: FoodAIRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    return await ai_service.food_recommendations(payload.model_dump(), session)
