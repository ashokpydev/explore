from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_session
from app.models.domain import User
from app.schemas.domain import (
    AIReindexResponse,
    ChatRequest,
    ChatResponse,
    AIUsageSummaryResponse,
    ConversationRead,
    GenAIShowcaseResponse,
    ImageTaggingRequest,
    ImageTaggingResponse,
    IngestionRequest,
    IngestionResponse,
    IntentExtractionRequest,
    IntentExtractionResponse,
    ItineraryRequest,
    ItineraryResponse,
    KnowledgeSearchRequest,
    KnowledgeSearchResult,
    ModerationRequest,
    ModerationResponse,
    RAGEvalRequest,
    RAGEvalResponse,
    TripCritiqueRequest,
    TripCritiqueResponse,
)
from app.services.ai import ai_service
from app.services.rag import rag_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, session: AsyncSession = Depends(get_session)) -> dict:
    return await ai_service.answer(payload.message, payload.language, payload.model_dump(), session)


@router.post("/chat/stream")
async def chat_stream(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    return StreamingResponse(
        ai_service.stream_answer(payload.message, payload.language, payload.model_dump(), session),
        media_type="text/event-stream",
    )


@router.post("/itinerary", response_model=ItineraryResponse)
async def itinerary(
    payload: ItineraryRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    return await ai_service.itinerary(payload.model_dump(), session)


@router.post("/intent", response_model=IntentExtractionResponse)
async def extract_intent(
    payload: IntentExtractionRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    return await ai_service.extract_intent(payload.model_dump(), session)


@router.post("/moderate", response_model=ModerationResponse)
async def moderate(payload: ModerationRequest) -> dict:
    return await ai_service.moderate_text(payload.model_dump())


@router.post("/image-tags", response_model=ImageTaggingResponse)
async def image_tags(payload: ImageTaggingRequest) -> dict:
    return await ai_service.tag_image(payload.model_dump())


@router.post("/trip-critique", response_model=TripCritiqueResponse)
async def trip_critique(
    payload: TripCritiqueRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    return await ai_service.critique_trip(payload.model_dump(), session)


@router.get("/showcase", response_model=GenAIShowcaseResponse)
async def showcase() -> dict:
    return ai_service.showcase()


@router.get("/conversations/{conversation_id}", response_model=ConversationRead)
async def get_conversation(
    conversation_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    conversation = await ai_service.get_conversation(session, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/search", response_model=list[KnowledgeSearchResult])
async def search_knowledge(
    payload: KnowledgeSearchRequest,
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    results = await rag_service.retrieve(session, payload.query, payload.language, payload.limit)
    return [item.__dict__ for item in results]


@router.post("/ingest", response_model=IngestionResponse)
async def ingest_knowledge(
    payload: IngestionRequest,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> dict:
    return await rag_service.ingest(session, payload.model_dump())


@router.post("/eval", response_model=RAGEvalResponse)
async def evaluate_rag(
    payload: RAGEvalRequest,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> dict:
    return await rag_service.evaluate(session, payload.model_dump())


@router.get("/usage", response_model=AIUsageSummaryResponse)
async def usage_summary(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> dict:
    return await ai_service.usage_summary(session)


@router.post("/reindex", response_model=AIReindexResponse)
async def reindex_knowledge(
    include_embeddings: bool = True,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> dict:
    return await rag_service.reindex(session, include_embeddings=include_embeddings)
