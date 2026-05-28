from fastapi import APIRouter, Depends, Query
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.domain import Place
from app.schemas.domain import PlaceRead

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
    result = await session.execute(select(Place).where(Place.slug == slug))
    return result.scalar_one()

