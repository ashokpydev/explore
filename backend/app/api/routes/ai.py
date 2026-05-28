from fastapi import APIRouter
from app.schemas.domain import ChatRequest, ChatResponse, ItineraryRequest, ItineraryResponse
from app.services.ai import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> dict:
    return await ai_service.answer(payload.message, payload.language, payload.model_dump())


@router.post("/itinerary", response_model=ItineraryResponse)
async def itinerary(payload: ItineraryRequest) -> dict:
    return await ai_service.itinerary(payload.model_dump())

