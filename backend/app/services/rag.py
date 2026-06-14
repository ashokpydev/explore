from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime

import httpx
import structlog
from openai import AsyncOpenAI
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.domain import AIIngestionRun, Event, Place, RAGEvaluationRun
from app.services.food_catalog import FOOD_CATALOG

logger = structlog.get_logger()


@dataclass(frozen=True)
class KnowledgeChunk:
    source_kind: str
    source_id: uuid.UUID | None
    title: str
    content: str
    citation: str
    trust_level: float
    source_metadata: dict
    language: str = "en"
    freshness_at: datetime | None = None


@dataclass(frozen=True)
class RetrievalResult:
    title: str
    content: str
    citation: str
    source_kind: str
    score: float


class RAGService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def reindex(self, session: AsyncSession, include_embeddings: bool = True) -> dict:
        chunks = await self._build_chunks(session)
        embedded = 0
        for chunk in chunks:
            embedding = None
            if include_embeddings and self.client:
                embedding = await self._embed(chunk.content)
                embedded += 1 if embedding else 0
            await self._upsert_chunk(session, chunk, embedding)
        await session.commit()
        return {"indexed": len(chunks), "embedded": embedded}

    async def ingest(
        self,
        session: AsyncSession,
        payload: dict,
    ) -> dict:
        documents = list(payload.get("documents", []))
        errors: list[str] = []
        for url in payload.get("source_urls", []):
            try:
                documents.append(await self._document_from_url(url, payload.get("source_kind", "url")))
            except Exception as exc:
                logger.warning("ingestion_url_failed", url=url, error=str(exc))
                errors.append(f"{url}: {exc}")

        chunks = self._chunk_documents(documents, payload.get("source_kind", "open_data"))
        embedded = 0
        for chunk in chunks:
            embedding = None
            if payload.get("include_embeddings", True) and self.client:
                embedding = await self._embed(chunk.content)
                embedded += 1 if embedding else 0
            await self._upsert_chunk(session, chunk, embedding)

        status = "completed" if not errors else "completed_with_errors"
        run = AIIngestionRun(
            source_kind=payload.get("source_kind", "open_data"),
            status=status,
            documents_seen=len(documents),
            chunks_indexed=len(chunks),
            embedded=embedded,
            errors=errors,
            run_metadata={
                "source_urls": payload.get("source_urls", []),
                "include_embeddings": payload.get("include_embeddings", True),
            },
        )
        session.add(run)
        await session.commit()
        return {
            "run_id": run.id,
            "status": status,
            "documents_seen": len(documents),
            "chunks_indexed": len(chunks),
            "embedded": embedded,
            "errors": errors,
        }

    async def evaluate(self, session: AsyncSession, payload: dict) -> dict:
        results = []
        for case in payload["cases"]:
            retrieved = await self.retrieve(
                session,
                case["query"],
                payload.get("language", "en"),
                limit=settings.ai_max_context_chunks,
            )
            retrieved_text = " ".join(
                f"{item.title} {item.content} {item.citation}" for item in retrieved
            ).lower()
            required_terms = [term.lower() for term in case.get("required_terms", [])]
            expected_citations = [
                citation.lower() for citation in case.get("expected_citations", [])
            ]
            term_hits = sum(1 for term in required_terms if term in retrieved_text)
            citation_hits = sum(
                1 for citation in expected_citations if citation in retrieved_text
            )
            term_score = term_hits / max(1, len(required_terms))
            citation_score = citation_hits / max(1, len(expected_citations))
            has_results_score = 1.0 if retrieved else 0.0
            score = round((term_score * 0.45 + citation_score * 0.35 + has_results_score * 0.2) * 100, 2)
            results.append(
                {
                    "query": case["query"],
                    "score": score,
                    "passed": score >= 70,
                    "term_hits": term_hits,
                    "citation_hits": citation_hits,
                    "top_sources": [item.__dict__ for item in retrieved[:3]],
                }
            )

        average_score = round(
            sum(item["score"] for item in results) / max(1, len(results)), 2
        )
        pass_rate = round(
            sum(1 for item in results if item["passed"]) / max(1, len(results)), 2
        )
        run = RAGEvaluationRun(
            name=payload["name"],
            total_cases=len(results),
            average_score=average_score,
            pass_rate=pass_rate,
            results=results,
            run_metadata={"language": payload.get("language", "en")},
        )
        session.add(run)
        await session.commit()
        return {
            "run_id": run.id,
            "name": payload["name"],
            "total_cases": len(results),
            "average_score": average_score,
            "pass_rate": pass_rate,
            "results": results,
        }

    async def retrieve(
        self,
        session: AsyncSession | None,
        query: str,
        language: str = "en",
        limit: int | None = None,
    ) -> list[RetrievalResult]:
        if session is None:
            return self.static_fallback(query)

        size = limit or settings.ai_max_context_chunks
        if self.client:
            embedding = await self._embed(query)
            if embedding:
                vector_results = await self._vector_search(session, embedding, language, size)
                if vector_results:
                    return vector_results

        lexical_results = await self._lexical_search(session, query, language, size)
        if lexical_results:
            return lexical_results
        return self.static_fallback(query)

    def static_fallback(self, query: str) -> list[RetrievalResult]:
        notes = [
            "Charminar is a 1591 monument in the Old City, surrounded by Laad Bazaar and heritage food streets.",
            "Golconda Fort is best visited near sunset; the sound and light show is a popular evening option.",
            "Hussain Sagar and Tank Bund connect Hyderabad and Secunderabad with lakeside walks and viewpoints.",
            "Ramzan night food walks around Charminar are crowded; plan transport and safety checkpoints early.",
            "Bathukamma and Bonalu are major Telangana festivals with processions, flowers, music, and community rituals.",
        ]
        lowered = query.lower()
        ranked = [item for item in notes if any(word in item.lower() for word in lowered.split())]
        return [
            RetrievalResult(
                title="Bundled Hyderabad knowledge",
                content=item,
                citation="Bundled Hyderabad demo knowledge",
                source_kind="fallback",
                score=0.3,
            )
            for item in (ranked[:4] or notes[:3])
        ]

    async def _build_chunks(self, session: AsyncSession) -> list[KnowledgeChunk]:
        chunks: list[KnowledgeChunk] = []

        places = await session.execute(select(Place).order_by(Place.rating.desc()))
        for place in places.scalars():
            chunks.append(
                KnowledgeChunk(
                    source_kind="place",
                    source_id=place.id,
                    title=place.name,
                    citation=f"Explore Hyderabad place profile: {place.name}",
                    trust_level=0.92 if place.is_featured else 0.84,
                    source_metadata={
                        "slug": place.slug,
                        "kind": place.kind.value,
                        "rating": place.rating,
                        "latitude": place.latitude,
                        "longitude": place.longitude,
                    },
                    content=(
                        f"{place.name} is a {place.kind.value.replace('_', ' ')} in {place.address}, "
                        f"{place.city}. {place.short_description} History: {place.history} "
                        f"Best time to visit: {place.best_time_to_visit}. Timings: {place.timings}. "
                        f"Entry fee: {place.entry_fee}. Accessibility: {place.accessibility}. "
                        f"Safety: {place.safety}. AI tips: {', '.join(place.ai_tips)}. "
                        f"Rating: {place.rating} from {place.review_count} reviews."
                    ),
                    freshness_at=place.updated_at,
                )
            )

        for restaurant in sorted(FOOD_CATALOG, key=lambda item: item.rating, reverse=True):
            chunks.append(
                KnowledgeChunk(
                    source_kind="restaurant",
                    source_id=restaurant.id,
                    title=restaurant.name,
                    citation=f"Explore Hyderabad food profile: {restaurant.name}",
                    trust_level=0.86,
                    source_metadata={
                        "cuisine": restaurant.cuisine,
                        "rating": restaurant.rating,
                        "latitude": restaurant.latitude,
                        "longitude": restaurant.longitude,
                        "distance_from_mgbs_km": restaurant.distance_from_mgbs_km,
                        "image_key": restaurant.image_key,
                    },
                    content=(
                        f"{restaurant.name} serves {', '.join(restaurant.cuisine)} around "
                        f"{restaurant.address}. Price band: {restaurant.price_band}; cost for two: "
                        f"INR {restaurant.cost_for_two}. Highlights: {', '.join(restaurant.highlights)}. "
                        f"Crowd level: {restaurant.crowd_level}. Open late: {restaurant.open_late}. "
                        f"Rating: {restaurant.rating}. Approx road distance from MGBS: "
                        f"{restaurant.distance_from_mgbs_km} km."
                    ),
                    freshness_at=datetime.now(UTC),
                )
            )

        events = await session.execute(select(Event).order_by(Event.starts_at.asc()))
        for event in events.scalars():
            chunks.append(
                KnowledgeChunk(
                    source_kind="event",
                    source_id=event.id,
                    title=event.title,
                    citation=f"Explore Hyderabad event listing: {event.title}",
                    trust_level=0.82,
                    source_metadata={
                        "event_type": event.event_type,
                        "venue": event.venue,
                        "starts_at": event.starts_at.isoformat(),
                    },
                    content=(
                        f"{event.title} is a {event.event_type} event at {event.venue}. "
                        f"{event.description} It starts at {event.starts_at} and ends at {event.ends_at}. "
                        f"Ticket price: {event.ticket_price or 'free or not listed'}."
                    ),
                    freshness_at=event.updated_at,
                )
            )

        return chunks

    async def _embed(self, text_value: str) -> list[float] | None:
        if not self.client:
            return None
        try:
            response = await self.client.embeddings.create(
                model=settings.openai_embedding_model,
                input=text_value[:8000],
            )
            return list(response.data[0].embedding)
        except Exception as exc:
            logger.warning("embedding_failed", error=str(exc))
            return None

    async def _upsert_chunk(
        self,
        session: AsyncSession,
        chunk: KnowledgeChunk,
        embedding: list[float] | None,
    ) -> None:
        await session.execute(
            text(
                """
                INSERT INTO ai_knowledge_sources (
                  id, source_kind, source_id, title, content, citation, language, trust_level,
                  freshness_at, source_metadata, embedding, created_at, updated_at
                )
                VALUES (
                  :id, :source_kind, :source_id, :title, :content, :citation, :language,
                  :trust_level, :freshness_at, CAST(:source_metadata AS json),
                  CASE
                    WHEN CAST(:embedding AS text) IS NULL THEN NULL
                    ELSE CAST(CAST(:embedding AS text) AS vector)
                  END,
                  now(), now()
                )
                ON CONFLICT (source_kind, source_id) DO UPDATE SET
                  title = EXCLUDED.title,
                  content = EXCLUDED.content,
                  citation = EXCLUDED.citation,
                  trust_level = EXCLUDED.trust_level,
                  freshness_at = EXCLUDED.freshness_at,
                  source_metadata = EXCLUDED.source_metadata,
                  embedding = COALESCE(EXCLUDED.embedding, ai_knowledge_sources.embedding),
                  updated_at = now()
                """
            ),
            {
                "id": uuid.uuid4(),
                "source_kind": chunk.source_kind,
                "source_id": chunk.source_id,
                "title": chunk.title,
                "content": chunk.content,
                "citation": chunk.citation,
                "language": chunk.language,
                "trust_level": chunk.trust_level,
                "freshness_at": chunk.freshness_at or datetime.now(UTC),
                "source_metadata": _json_dumps(chunk.source_metadata),
                "embedding": _vector_literal(embedding) if embedding else None,
            },
        )

    async def _vector_search(
        self,
        session: AsyncSession,
        embedding: list[float],
        language: str,
        limit: int,
    ) -> list[RetrievalResult]:
        try:
            result = await session.execute(
                text(
                    """
                    SELECT title, content, citation, source_kind,
                      1 - (embedding <=> CAST(:embedding AS vector)) AS score
                    FROM ai_knowledge_sources
                    WHERE embedding IS NOT NULL AND language = :language
                    ORDER BY embedding <=> CAST(:embedding AS vector), trust_level DESC
                    LIMIT :limit
                    """
                ),
                {"embedding": _vector_literal(embedding), "language": language, "limit": limit},
            )
            return [_row_to_result(row) for row in result.mappings().all()]
        except Exception as exc:
            logger.warning("vector_search_failed", error=str(exc))
            await session.rollback()
            return []

    async def _lexical_search(
        self,
        session: AsyncSession,
        query: str,
        language: str,
        limit: int,
    ) -> list[RetrievalResult]:
        try:
            result = await session.execute(
                text(
                    """
                    WITH terms AS (
                      SELECT term
                      FROM unnest(regexp_split_to_array(lower(:query), '[^a-z0-9]+')) AS term
                      WHERE length(term) > 2
                    ),
                    ranked AS (
                      SELECT title, content, citation, source_kind,
                        COALESCE(
                          ts_rank_cd(
                            to_tsvector('english', title || ' ' || content),
                            websearch_to_tsquery('english', :query)
                          ),
                          0
                        )
                        + (
                          SELECT count(*) * 0.2
                          FROM terms
                          WHERE lower(title || ' ' || content) LIKE '%' || term || '%'
                        )
                        + trust_level * 0.05 AS score
                      FROM ai_knowledge_sources
                      WHERE language = :language
                        AND (
                          to_tsvector('english', title || ' ' || content)
                            @@ websearch_to_tsquery('english', :query)
                          OR title ILIKE :like
                          OR content ILIKE :like
                          OR EXISTS (
                            SELECT 1
                            FROM terms
                            WHERE lower(title || ' ' || content) LIKE '%' || term || '%'
                          )
                        )
                    )
                    SELECT * FROM ranked
                    ORDER BY score DESC
                    LIMIT :limit
                    """
                ),
                {"query": query, "like": f"%{query}%", "language": language, "limit": limit},
            )
            return [_row_to_result(row) for row in result.mappings().all()]
        except Exception as exc:
            logger.warning("lexical_search_failed", error=str(exc))
            await session.rollback()
            return []

    async def _document_from_url(self, url: str, source_kind: str) -> dict:
        async with httpx.AsyncClient(timeout=12, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
        title = url.rstrip("/").split("/")[-1] or url
        text_value = _strip_markup(response.text)
        return {
            "title": title[:220],
            "content": text_value,
            "citation": url,
            "source_kind": source_kind,
            "trust_level": 0.72,
            "metadata": {"url": url, "content_type": response.headers.get("content-type")},
        }

    def _chunk_documents(self, documents: list[dict], default_source_kind: str) -> list[KnowledgeChunk]:
        chunks: list[KnowledgeChunk] = []
        for document in documents:
            content = " ".join(str(document.get("content", "")).split())
            if not content:
                continue
            title = str(document.get("title") or "Untitled knowledge source")
            citation = str(document.get("citation") or title)
            source_kind = str(document.get("source_kind") or default_source_kind)
            trust_level = float(document.get("trust_level") or 0.78)
            language = str(document.get("language") or "en")
            metadata = dict(document.get("metadata") or {})
            for index, chunk_text in enumerate(_windowed_chunks(content)):
                chunks.append(
                    KnowledgeChunk(
                        source_kind=source_kind,
                        source_id=None,
                        title=f"{title} #{index + 1}" if len(content) > len(chunk_text) else title,
                        content=chunk_text,
                        citation=citation,
                        trust_level=trust_level,
                        source_metadata={**metadata, "chunk_index": index},
                        language=language,
                        freshness_at=datetime.now(UTC),
                    )
                )
        return chunks


def _vector_literal(values: list[float] | None) -> str | None:
    if values is None:
        return None
    return "[" + ",".join(f"{value:.8f}" for value in values) + "]"


def _row_to_result(row: dict) -> RetrievalResult:
    return RetrievalResult(
        title=row["title"],
        content=row["content"],
        citation=row["citation"],
        source_kind=row["source_kind"],
        score=float(row["score"] or 0),
    )


def _json_dumps(value: dict) -> str:
    import json

    return json.dumps(value, default=str)


def _windowed_chunks(text_value: str, chunk_size: int = 1200, overlap: int = 160) -> list[str]:
    if len(text_value) <= chunk_size:
        return [text_value]
    chunks = []
    start = 0
    while start < len(text_value):
        end = min(len(text_value), start + chunk_size)
        chunks.append(text_value[start:end].strip())
        if end == len(text_value):
            break
        start = max(0, end - overlap)
    return chunks


def _strip_markup(value: str) -> str:
    value = re_sub(r"<script[\s\S]*?</script>", " ", value)
    value = re_sub(r"<style[\s\S]*?</style>", " ", value)
    value = re_sub(r"<[^>]+>", " ", value)
    return " ".join(value.split())


def re_sub(pattern: str, repl: str, value: str) -> str:
    import re

    return re.sub(pattern, repl, value, flags=re.IGNORECASE)


rag_service = RAGService()
