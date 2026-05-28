from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.domain import Favorite, Place, Review, User
from app.schemas.domain import PlaceRead, ReviewCreate, ReviewRead

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=list[PlaceRead])
async def list_places(
    query: str | None = None,
    kind: str | None = None,
    featured: bool | None = None,
    limit: int = Query(default=20, le=100),
    session: AsyncSession = Depends(get_session),
) -> list[Place]:
    stmt: Select = select(Place).limit(limit).order_by(Place.rating.desc())
    if query:
        stmt = stmt.where(Place.name.ilike(f"%{query}%") | Place.short_description.ilike(f"%{query}%"))
    if kind:
        stmt = stmt.where(Place.kind == kind)
    if featured is not None:
        stmt = stmt.where(Place.is_featured == featured)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{slug}", response_model=PlaceRead)
async def get_place(slug: str, session: AsyncSession = Depends(get_session)) -> Place:
    return await _place_by_slug(slug, session)


@router.get("/{slug}/reviews", response_model=list[ReviewRead])
async def list_reviews(slug: str, session: AsyncSession = Depends(get_session)) -> list[Review]:
    place = await _place_by_slug(slug, session)
    result = await session.execute(
        select(Review).where(Review.place_id == place.id).order_by(Review.created_at.desc()).limit(50)
    )
    return list(result.scalars().all())


@router.post("/{slug}/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    slug: str,
    payload: ReviewCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Review:
    place = await _place_by_slug(slug, session)
    existing = await session.execute(
        select(Review).where(Review.user_id == user.id, Review.place_id == place.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already reviewed this place")
    review = Review(
        user_id=user.id,
        place_id=place.id,
        rating=payload.rating,
        body=payload.body,
        sentiment="positive" if payload.rating >= 4 else "needs_review" if payload.rating <= 2 else "neutral",
    )
    session.add(review)
    await session.commit()
    await session.refresh(review)
    return review


@router.post("/{slug}/favorite", status_code=status.HTTP_201_CREATED)
async def favorite_place(
    slug: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> dict:
    place = await _place_by_slug(slug, session)
    existing = await session.execute(
        select(Favorite).where(Favorite.user_id == user.id, Favorite.place_id == place.id)
    )
    if existing.scalar_one_or_none():
        return {"status": "already_favorited"}
    session.add(Favorite(user_id=user.id, place_id=place.id))
    await session.commit()
    return {"status": "favorited"}


async def _place_by_slug(slug: str, session: AsyncSession) -> Place:
    result = await session.execute(select(Place).where(Place.slug == slug))
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
