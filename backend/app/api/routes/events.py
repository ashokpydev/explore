from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.domain import Event
from app.schemas.domain import EventRead

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventRead])
async def list_events(session: AsyncSession = Depends(get_session)) -> list[Event]:
    result = await session.execute(select(Event).order_by(Event.starts_at.asc()).limit(50))
    return list(result.scalars().all())

