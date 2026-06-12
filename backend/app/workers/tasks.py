import asyncio

from app.db.session import AsyncSessionLocal
from app.services.ai import ai_service
from app.services.rag import rag_service
from app.workers.celery_app import celery_app


@celery_app.task(name="refresh_crowd_predictions")
def refresh_crowd_predictions() -> dict:
    zones = {
        "old_city": {"crowd_level": "very_high", "confidence": 0.82},
        "hitec_city": {"crowd_level": "high", "confidence": 0.78},
        "tank_bund": {"crowd_level": "moderate", "confidence": 0.74},
        "golconda": {"crowd_level": "moderate", "confidence": 0.71},
    }
    return {"status": "refreshed", "zones": zones}


@celery_app.task(name="reindex_ai_knowledge")
def reindex_ai_knowledge(include_embeddings: bool = True) -> dict:
    async def _run() -> dict:
        async with AsyncSessionLocal() as session:
            return await rag_service.reindex(session, include_embeddings=include_embeddings)

    result = asyncio.run(_run())
    return {"status": "reindexed", **result}


@celery_app.task(name="moderate_travel_content")
def moderate_travel_content(text: str, content_type: str = "review") -> dict:
    async def _run() -> dict:
        return await ai_service.moderate_text({"text": text, "content_type": content_type})

    result = asyncio.run(_run())
    return {"status": "moderated", **result}


@celery_app.task(name="tag_travel_media")
def tag_travel_media(
    image_url: str | None = None,
    caption: str | None = None,
    place_hint: str | None = None,
) -> dict:
    async def _run() -> dict:
        return await ai_service.tag_image(
            {"image_url": image_url, "caption": caption, "place_hint": place_hint}
        )

    result = asyncio.run(_run())
    return {"status": "tagged", **result}


@celery_app.task(name="ingest_ai_knowledge")
def ingest_ai_knowledge(payload: dict) -> dict:
    async def _run() -> dict:
        async with AsyncSessionLocal() as session:
            return await rag_service.ingest(session, payload)

    result = asyncio.run(_run())
    return {"status": "ingested", **result}


@celery_app.task(name="evaluate_rag_quality")
def evaluate_rag_quality(payload: dict) -> dict:
    async def _run() -> dict:
        async with AsyncSessionLocal() as session:
            return await rag_service.evaluate(session, payload)

    result = asyncio.run(_run())
    return {"status": "evaluated", **result}
