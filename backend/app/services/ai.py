import json
import re
import uuid
from time import perf_counter

from openai import AsyncOpenAI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.domain import AIConversation, AIConversationMessage, AIRequestLog
from app.services.food_catalog import FOOD_CATALOG, FoodCatalogRestaurant
from app.services.rag import RetrievalResult, rag_service

SYSTEM_PROMPT = """
You are Explore Hyderabad, an expert local tourism assistant for Hyderabad and Telangana.
Give practical, safety-aware, culturally respectful recommendations. Prefer concise plans with
timings, budget cues, transport options, accessibility notes, and local-language hints.
"""

class AIService:
    def __init__(self) -> None:
        self.client = (
            AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        )

    async def answer(
        self,
        message: str,
        language: str = "en",
        context: dict | None = None,
        session: AsyncSession | None = None,
    ) -> dict:
        started = perf_counter()
        context = context or {}
        conversation = await self._load_or_create_conversation(
            session,
            context.get("conversation_id"),
            language,
            message,
        )
        history = await self._recent_history(session, conversation.id if conversation else None)
        retrieved = await rag_service.retrieve(session, message, language)
        citations = [item.citation for item in retrieved]
        context_notes = self._format_context(retrieved)
        prompt_context = (
            f"Conversation memory: {conversation.memory if conversation else {}}\n"
            f"Recent messages:\n{history}\n"
            f"Request context: {context}\n"
            f"Trusted retrieved notes:\n{context_notes}\n\n"
            f"User request: {message}"
        )
        if not self.client:
            answer = self._offline_answer(message, retrieved, language)
            usage = self._usage_metadata(message, answer, started, len(retrieved), "offline")
            await self._persist_exchange(session, conversation, message, answer, citations, usage)
            return {
                "answer": answer,
                "conversation_id": conversation.id if conversation else None,
                "citations": citations,
                "suggestions": [
                    "Build a 2-day itinerary",
                    "Find food near me",
                    "Show safe night spots",
                ],
                "context_sources": [item.__dict__ for item in retrieved],
                "usage": usage,
            }
        try:
            response = await self.client.responses.create(
                model=settings.openai_model,
                input=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Language: {language}\n{prompt_context}"},
                ],
            )
            answer = response.output_text
            usage = self._usage_metadata(
                message,
                answer,
                started,
                len(retrieved),
                "ok",
                response=response,
            )
        except Exception as exc:
            answer = self._offline_answer(message, retrieved, language)
            usage = self._usage_metadata(message, answer, started, len(retrieved), "fallback")
            usage["error"] = str(exc)
        await self._persist_exchange(session, conversation, message, answer, citations, usage)
        return {
            "answer": answer,
            "conversation_id": conversation.id if conversation else None,
            "citations": citations,
            "suggestions": ["Nearby options", "Budget version", "Family friendly version"],
            "context_sources": [item.__dict__ for item in retrieved],
            "usage": usage,
        }

    async def stream_answer(
        self,
        message: str,
        language: str = "en",
        context: dict | None = None,
        session: AsyncSession | None = None,
    ):
        response = await self.answer(message, language, context, session)
        yield f"event: metadata\ndata: {json.dumps(_json_safe(response['usage']))}\n\n"
        for chunk in _chunk_for_stream(response["answer"]):
            yield f"event: token\ndata: {json.dumps({'text': chunk})}\n\n"
        yield f"event: done\ndata: {json.dumps(_json_safe(response))}\n\n"

    async def itinerary(self, payload: dict, session: AsyncSession | None = None) -> dict:
        interests = ", ".join(payload.get("interests", []))
        prompt = (
            f"Create a {payload['days']}-day {payload['trip_type']} Hyderabad plan under "
            f"INR {payload['budget_inr']} focused on {interests}."
        )
        answer = await self.answer(prompt, payload.get("language", "en"), payload, session)
        return {
            "title": f"{payload['days']}-Day {payload['trip_type'].title()} Hyderabad Plan",
            "days": payload["days"],
            "budget_inr": payload["budget_inr"],
            "route": [
                {
                    "day": day,
                    "stops": ["Charminar", "Salar Jung Museum", "Hussain Sagar"]
                    if day == 1
                    else ["Golconda Fort", "Qutb Shahi Tombs", "Jubilee Hills cafe trail"],
                    "transport": "Metro, cab, and short walks",
                    "budget_note": "Reserve 25% for food and local shopping.",
                }
                for day in range(1, payload["days"] + 1)
            ],
            "ai_reasoning": answer["answer"],
        }

    async def extract_intent(self, payload: dict, session: AsyncSession | None = None) -> dict:
        message = payload["message"]
        language = payload.get("language", "en")
        retrieved = await rag_service.retrieve(session, message, language, limit=3)
        context_notes = self._format_context(retrieved)
        fallback = self._offline_intent(message, payload.get("user_profile", {}))
        if not self.client:
            return fallback

        prompt = (
            "Extract structured travel intent as compact JSON with keys intent, confidence, "
            "entities, follow_up_questions, recommended_tools. Recommended tools can include "
            "rag_search, itinerary_planner, geo_route, food_ranker, safety_moderation, "
            "map_search.\n"
            f"Language: {language}\nUser profile: {payload.get('user_profile', {})}\n"
            f"Retrieved context:\n{context_notes}\nUser message: {message}"
        )
        parsed = await self._json_response(prompt, fallback)
        return {
            "intent": str(parsed.get("intent", fallback["intent"])),
            "confidence": float(parsed.get("confidence", fallback["confidence"])),
            "entities": dict(parsed.get("entities", fallback["entities"])),
            "follow_up_questions": list(
                parsed.get("follow_up_questions", fallback["follow_up_questions"])
            )[:4],
            "recommended_tools": list(
                parsed.get("recommended_tools", fallback["recommended_tools"])
            )[:6],
        }

    async def moderate_text(self, payload: dict) -> dict:
        text = payload["text"]
        fallback = self._offline_moderation(text)
        if not self.client:
            return fallback

        prompt = (
            "Moderate this tourism community content as JSON with keys decision, categories, "
            "severity, rewritten_text, rationale. decision must be approve, needs_review, "
            "or reject. "
            "Rewrite only if it can be made safe without changing the user's meaning.\n"
            f"Content type: {payload.get('content_type', 'review')}\nText: {text}"
        )
        parsed = await self._json_response(prompt, fallback)
        return {
            "decision": str(parsed.get("decision", fallback["decision"])),
            "categories": list(parsed.get("categories", fallback["categories"]))[:6],
            "severity": float(parsed.get("severity", fallback["severity"])),
            "rewritten_text": parsed.get("rewritten_text") or fallback["rewritten_text"],
            "rationale": str(parsed.get("rationale", fallback["rationale"])),
        }

    async def tag_image(self, payload: dict) -> dict:
        fallback = self._offline_image_tags(
            payload.get("caption") or "", payload.get("place_hint") or "Hyderabad"
        )
        if not self.client or not payload.get("image_url"):
            return fallback

        prompt = (
            "Analyze this travel image metadata as JSON with keys alt_text, tags, safety_flags, "
            "suggested_caption, confidence. Keep tags short and useful for search.\n"
            f"Place hint: {payload.get('place_hint')}\nCaption: {payload.get('caption')}"
        )
        parsed = await self._json_response(prompt, fallback, image_url=payload.get("image_url"))
        return {
            "alt_text": str(parsed.get("alt_text", fallback["alt_text"])),
            "tags": list(parsed.get("tags", fallback["tags"]))[:12],
            "safety_flags": list(parsed.get("safety_flags", fallback["safety_flags"]))[:6],
            "suggested_caption": str(
                parsed.get("suggested_caption", fallback["suggested_caption"])
            ),
            "confidence": float(parsed.get("confidence", fallback["confidence"])),
        }

    async def critique_trip(
        self, payload: dict, session: AsyncSession | None = None
    ) -> dict:
        itinerary_text = json.dumps(payload["itinerary"], default=str)
        retrieved = await rag_service.retrieve(
            session, itinerary_text, payload.get("language", "en"), limit=4
        )
        fallback = self._offline_trip_critique(payload, retrieved)
        if not self.client:
            return fallback

        prompt = (
            "Review this Hyderabad itinerary as JSON with keys score, risks, optimizations, "
            "budget_notes, safety_notes. Score is 0-100. Be practical about route clustering, "
            "crowds, timings, transport, weather, and traveler type.\n"
            f"Traveler type: {payload.get('traveler_type')}\n"
            f"Budget INR: {payload.get('budget_inr')}\n"
            f"Trusted context:\n{self._format_context(retrieved)}\nItinerary: {itinerary_text}"
        )
        parsed = await self._json_response(prompt, fallback)
        return {
            "score": float(parsed.get("score", fallback["score"])),
            "risks": list(parsed.get("risks", fallback["risks"]))[:6],
            "optimizations": list(parsed.get("optimizations", fallback["optimizations"]))[:6],
            "budget_notes": list(parsed.get("budget_notes", fallback["budget_notes"]))[:5],
            "safety_notes": list(parsed.get("safety_notes", fallback["safety_notes"]))[:5],
        }

    async def food_recommendations(self, payload: dict, session: AsyncSession) -> dict:
        started = perf_counter()
        query = payload["query"]
        language = payload.get("language", "en")
        retrieved = await rag_service.retrieve(session, query, language, limit=5)
        restaurants = FOOD_CATALOG
        ranked = sorted(
            (
                (restaurant, _food_match_score(restaurant, payload, query))
                for restaurant in restaurants
            ),
            key=lambda item: item[1],
            reverse=True,
        )[: payload.get("limit", 5)]
        grounded_restaurants = _restaurant_context_results(ranked)
        context_sources = _merge_retrieval_results(grounded_restaurants, retrieved)
        fallback = self._offline_food_plan(payload, ranked, context_sources)
        answer = fallback["answer"]
        if self.client:
            parsed = await self._json_response(
                (
                    "Create a grounded Hyderabad food recommendation response as JSON with keys "
                    "answer, budget_strategy, dietary_notes, and per_restaurant_reasoning. "
                    "Use only the listed restaurants and retrieved context.\n"
                    f"User request: {payload}\n"
                    f"Restaurants: {json.dumps([_restaurant_dict(item[0], item[1], payload) for item in ranked], default=str)}\n"
                    f"Retrieved context:\n{self._format_context(context_sources)}"
                ),
                fallback,
            )
            answer = str(parsed.get("answer", fallback["answer"]))
            fallback["budget_strategy"] = list(
                parsed.get("budget_strategy", fallback["budget_strategy"])
            )[:5]
            fallback["dietary_notes"] = list(
                parsed.get("dietary_notes", fallback["dietary_notes"])
            )[:5]
            reasoning = dict(parsed.get("per_restaurant_reasoning", {}))
            for recommendation in fallback["recommendations"]:
                recommendation["reasoning"] = str(
                    reasoning.get(recommendation["name"], recommendation["reasoning"])
                )
        usage = self._usage_metadata(
            query,
            answer,
            started,
            len(context_sources),
            "ok" if self.client else "offline",
        )
        session.add(
            AIRequestLog(
                operation="food_recommendation",
                model=usage["model"],
                status=usage["status"],
                prompt_tokens=usage["prompt_tokens"],
                completion_tokens=usage["completion_tokens"],
                total_tokens=usage["total_tokens"],
                latency_ms=usage["latency_ms"],
                estimated_cost_usd=usage["estimated_cost_usd"],
                retrieved_count=usage["retrieved_count"],
                request_metadata={"query": query, "budget_inr": payload.get("budget_inr")},
            )
        )
        await session.commit()
        return {
            **fallback,
            "answer": answer,
            "usage": usage,
        }

    def showcase(self) -> dict:
        return {
            "capabilities": [
                {
                    "name": "RAG city assistant",
                    "evidence": (
                        "pgvector embeddings, lexical fallback, source citations, "
                        "trust and freshness metadata"
                    ),
                },
                {
                    "name": "Structured itinerary generation",
                    "evidence": "budget, trip type, interests, context retrieval, route reasoning",
                },
                {
                    "name": "Intent extraction and tool routing",
                    "evidence": "entities, confidence, follow-up questions, tool recommendations",
                },
                {
                    "name": "AI moderation and sentiment-ready reviews",
                    "evidence": "approval decision, category flags, severity, safe rewrite",
                },
                {
                    "name": "Vision metadata pipeline",
                    "evidence": "alt text, tags, captions, safety flags for uploaded travel media",
                },
                {
                    "name": "Async AI operations",
                    "evidence": (
                        "Celery tasks for knowledge reindexing, predictions, "
                        "and batch AI jobs"
                    ),
                },
                {
                    "name": "Conversation memory and observability",
                    "evidence": (
                        "persistent sessions, recent-message grounding, token estimates, "
                        "latency logs, usage summaries, and RAG eval runs"
                    ),
                },
                {
                    "name": "GenAI food discovery",
                    "evidence": (
                        "RAG-grounded restaurant ranking, budget fit, dietary notes, "
                        "late-night safety, citations, and usage logging"
                    ),
                },
            ],
            "architecture": [
                "Next.js App Router frontend with interactive assistant and planner surfaces",
                "FastAPI service layer with typed Pydantic contracts",
                "PostgreSQL, PostGIS, pgvector, trigram and full-text indexes",
                "Redis cache seam and Celery worker queue",
                "OpenAI-compatible model provider with deterministic offline demo mode",
                "Persistent AI memory, observability logs, ingestion runs, and eval runs",
                "Docker Compose, Alembic migrations, Nginx and AWS ECS deployment notes",
            ],
            "open_stack": [
                "FastAPI",
                "PostgreSQL",
                "PostGIS",
                "pgvector",
                "Redis",
                "Celery",
                "Next.js",
                "Tailwind CSS",
                "OpenStreetMap-compatible map embeds",
            ],
            "cv_bullets": [
                (
                    "Built an AI-powered Hyderabad travel platform using FastAPI, Next.js, "
                    "PostGIS, pgvector, Redis, and Celery."
                ),
                (
                    "Implemented RAG with embedding search, lexical fallback, source "
                    "citations, trust scoring, and freshness metadata."
                ),
                (
                    "Developed GenAI services for itinerary generation, intent extraction, "
                    "moderation, image tagging, and trip critique."
                ),
                (
                    "Added conversation memory, streaming responses, ingestion pipelines, "
                    "RAG evaluation, and AI observability/token tracking."
                ),
                (
                    "Designed production-ready APIs, Dockerized deployment, Alembic "
                    "migrations, and local offline AI fallbacks for demos."
                ),
            ],
        }

    def _format_context(self, retrieved: list[RetrievalResult]) -> str:
        return "\n".join(
            f"- {item.title} ({item.source_kind}, score {item.score:.2f}): "
            f"{item.content}\n  Citation: {item.citation}"
            for item in retrieved
        )

    async def usage_summary(self, session: AsyncSession, limit: int = 10) -> dict:
        total_result = await session.execute(
            select(
                func.count(AIRequestLog.id),
                func.coalesce(func.sum(AIRequestLog.total_tokens), 0),
                func.coalesce(func.sum(AIRequestLog.estimated_cost_usd), 0),
                func.coalesce(func.avg(AIRequestLog.latency_ms), 0),
            )
        )
        total_requests, total_tokens, estimated_cost, average_latency = total_result.one()
        operation_result = await session.execute(
            select(
                AIRequestLog.operation,
                func.count(AIRequestLog.id).label("requests"),
                func.coalesce(func.sum(AIRequestLog.total_tokens), 0).label("tokens"),
                func.coalesce(func.avg(AIRequestLog.latency_ms), 0).label("latency"),
            )
            .group_by(AIRequestLog.operation)
            .order_by(func.count(AIRequestLog.id).desc())
        )
        recent_result = await session.execute(
            select(AIRequestLog).order_by(AIRequestLog.created_at.desc()).limit(limit)
        )
        return {
            "total_requests": int(total_requests or 0),
            "total_tokens": int(total_tokens or 0),
            "estimated_cost_usd": round(float(estimated_cost or 0), 6),
            "average_latency_ms": round(float(average_latency or 0), 2),
            "by_operation": [
                {
                    "operation": row.operation,
                    "requests": int(row.requests),
                    "tokens": int(row.tokens),
                    "average_latency_ms": round(float(row.latency or 0), 2),
                }
                for row in operation_result
            ],
            "recent_requests": [
                {
                    "id": str(log.id),
                    "operation": log.operation,
                    "model": log.model,
                    "status": log.status,
                    "total_tokens": log.total_tokens,
                    "latency_ms": log.latency_ms,
                    "estimated_cost_usd": log.estimated_cost_usd,
                    "created_at": log.created_at.isoformat(),
                }
                for log in recent_result.scalars()
            ],
        }

    async def get_conversation(self, session: AsyncSession, conversation_id: uuid.UUID) -> dict | None:
        result = await session.execute(
            select(AIConversation).where(AIConversation.id == conversation_id)
        )
        conversation = result.scalar_one_or_none()
        if conversation is None:
            return None
        messages_result = await session.execute(
            select(AIConversationMessage)
            .where(AIConversationMessage.conversation_id == conversation_id)
            .order_by(AIConversationMessage.created_at.asc())
        )
        return {
            "id": conversation.id,
            "title": conversation.title,
            "language": conversation.language,
            "summary": conversation.summary,
            "memory": conversation.memory,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "messages": [
                {
                    "id": message.id,
                    "role": message.role,
                    "content": message.content,
                    "citations": message.citations,
                    "message_metadata": message.message_metadata,
                    "created_at": message.created_at,
                }
                for message in messages_result.scalars()
            ],
        }

    async def _load_or_create_conversation(
        self,
        session: AsyncSession | None,
        conversation_id: uuid.UUID | str | None,
        language: str,
        message: str,
    ) -> AIConversation | None:
        if session is None:
            return None
        conversation = None
        if conversation_id:
            try:
                parsed_id = uuid.UUID(str(conversation_id))
                result = await session.execute(
                    select(AIConversation).where(AIConversation.id == parsed_id)
                )
                conversation = result.scalar_one_or_none()
            except ValueError:
                conversation = None
        if conversation is None:
            conversation = AIConversation(
                title=_conversation_title(message),
                language=language,
                memory=self._memory_from_text(message),
            )
            session.add(conversation)
            await session.flush()
        else:
            conversation.memory = {
                **(conversation.memory or {}),
                **self._memory_from_text(message),
            }
        return conversation

    async def _recent_history(
        self, session: AsyncSession | None, conversation_id: uuid.UUID | None
    ) -> str:
        if session is None or conversation_id is None:
            return ""
        result = await session.execute(
            select(AIConversationMessage)
            .where(AIConversationMessage.conversation_id == conversation_id)
            .order_by(AIConversationMessage.created_at.desc())
            .limit(settings.ai_memory_messages)
        )
        messages = list(reversed(result.scalars().all()))
        return "\n".join(f"{message.role}: {message.content}" for message in messages)

    async def _persist_exchange(
        self,
        session: AsyncSession | None,
        conversation: AIConversation | None,
        user_message: str,
        answer: str,
        citations: list[str],
        usage: dict,
    ) -> None:
        if session is None:
            return
        conversation_id = conversation.id if conversation else None
        if conversation:
            conversation.summary = _rolling_summary(conversation.summary, user_message, answer)
            session.add(
                AIConversationMessage(
                    conversation_id=conversation.id,
                    role="user",
                    content=user_message,
                    message_metadata={"source": "chat"},
                )
            )
            session.add(
                AIConversationMessage(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=answer,
                    citations=citations,
                    message_metadata={"usage": usage},
                )
            )
        session.add(
            AIRequestLog(
                conversation_id=conversation_id,
                operation="chat",
                model=usage.get("model", settings.openai_model),
                status=usage.get("status", "ok"),
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0),
                latency_ms=usage.get("latency_ms", 0),
                estimated_cost_usd=usage.get("estimated_cost_usd", 0),
                retrieved_count=usage.get("retrieved_count", 0),
                request_metadata={
                    key: value
                    for key, value in usage.items()
                    if key not in {"prompt_tokens", "completion_tokens", "total_tokens"}
                },
            )
        )
        await session.commit()

    def _usage_metadata(
        self,
        prompt: str,
        answer: str,
        started: float,
        retrieved_count: int,
        status: str,
        response: object | None = None,
    ) -> dict:
        prompt_tokens = _estimate_tokens(prompt)
        completion_tokens = _estimate_tokens(answer)
        usage = getattr(response, "usage", None)
        if usage:
            prompt_tokens = int(getattr(usage, "input_tokens", prompt_tokens) or prompt_tokens)
            completion_tokens = int(
                getattr(usage, "output_tokens", completion_tokens) or completion_tokens
            )
        total_tokens = prompt_tokens + completion_tokens
        return {
            "model": settings.openai_model if self.client else "offline-fallback",
            "status": status,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "latency_ms": int((perf_counter() - started) * 1000),
            "estimated_cost_usd": _estimate_cost(total_tokens),
            "retrieved_count": retrieved_count,
        }

    def _memory_from_text(self, message: str) -> dict:
        lowered = message.lower()
        memory: dict[str, object] = {}
        interests = [
            item
            for item in ["biryani", "heritage", "shopping", "metro", "family", "nightlife"]
            if item in lowered
        ]
        if interests:
            memory["interests"] = interests
        if "budget" in lowered or "cheap" in lowered:
            memory["budget_sensitive"] = True
        if "safe" in lowered or "women" in lowered:
            memory["safety_sensitive"] = True
        return memory

    def _offline_answer(self, message: str, retrieved: list[RetrievalResult], language: str) -> str:
        top = (
            retrieved[0].content
            if retrieved
            else "Start with Charminar, Golconda Fort, and Hussain Sagar."
        )
        return (
            "OpenAI is not configured, so this response uses the app's indexed Hyderabad "
            "knowledge. "
            f"For '{message}', start with {top} Add traffic buffer, check weather, "
            "and keep late-night plans around well-lit, high-footfall areas."
        )

    async def _json_response(
        self, prompt: str, fallback: dict, image_url: str | None = None
    ) -> dict:
        if not self.client:
            return fallback
        try:
            content: str | list[dict[str, str]] = prompt
            if image_url:
                content = [
                    {"type": "input_text", "text": prompt},
                    {"type": "input_image", "image_url": image_url},
                ]
            response = await self.client.responses.create(
                model=settings.openai_model,
                input=[
                    {"role": "system", "content": "Return only valid JSON. No markdown."},
                    {"role": "user", "content": content},
                ],
            )
            return _parse_json_object(response.output_text) or fallback
        except Exception:
            return fallback

    def _offline_intent(self, message: str, user_profile: dict) -> dict:
        text = message.lower()
        entities: dict[str, object] = {"raw_query": message}
        if match := re.search(r"(\d+)\s*[- ]?day", text):
            entities["days"] = int(match.group(1))
        if match := re.search(r"(?:inr|rs\.?|budget)\s*([0-9,]+)", text):
            entities["budget_inr"] = int(match.group(1).replace(",", ""))
        interests = [
            item
            for item in [
                "biryani",
                "monuments",
                "metro",
                "shopping",
                "family",
                "nightlife",
                "temple",
            ]
            if item in text
        ]
        if interests:
            entities["interests"] = interests
        intent = "itinerary_planning"
        tools = ["rag_search", "itinerary_planner", "geo_route"]
        if any(word in text for word in ["food", "biryani", "cafe", "restaurant"]):
            intent = "food_discovery"
            tools = ["rag_search", "food_ranker", "map_search"]
        if any(word in text for word in ["safe", "women", "night"]):
            tools.append("safety_moderation")
        if user_profile:
            entities["user_profile"] = user_profile
        return {
            "intent": intent,
            "confidence": 0.78 if interests else 0.62,
            "entities": entities,
            "follow_up_questions": [
                "What is your start point?",
                "How many travelers are going?",
                "Do you prefer metro, cab, or walking?",
            ],
            "recommended_tools": tools,
        }

    def _offline_moderation(self, text: str) -> dict:
        lowered = text.lower()
        flagged = {
            "harassment": ["idiot", "stupid", "hate"],
            "unsafe": ["drugs", "weapon", "fight"],
            "spam": ["buy now", "click here", "discount code"],
        }
        categories = [
            category
            for category, words in flagged.items()
            if any(word in lowered for word in words)
        ]
        severity = min(1.0, 0.25 + len(categories) * 0.25) if categories else 0.05
        decision = "approve" if not categories else "needs_review" if severity < 0.75 else "reject"
        rewritten = None
        if categories and decision != "reject":
            rewritten = re.sub(r"\b(idiot|stupid|hate)\b", "[removed]", text, flags=re.IGNORECASE)
        return {
            "decision": decision,
            "categories": categories,
            "severity": severity,
            "rewritten_text": rewritten,
            "rationale": (
                "Rule-based local moderation fallback used because model moderation "
                "is not configured."
            ),
        }

    def _offline_image_tags(self, caption: str, place_hint: str) -> dict:
        text = f"{caption} {place_hint}".lower()
        tags = ["hyderabad", "travel"]
        for tag in [
            "heritage",
            "food",
            "lake",
            "market",
            "temple",
            "night",
            "family",
            "architecture",
        ]:
            if tag in text:
                tags.append(tag)
        if "charminar" in text:
            tags.extend(["charminar", "old-city", "monument"])
        if "biryani" in text:
            tags.extend(["biryani", "local-food"])
        return {
            "alt_text": f"Travel photo related to {place_hint or 'Hyderabad'}",
            "tags": sorted(set(tags))[:12],
            "safety_flags": ["manual_review_required"] if not caption and not place_hint else [],
            "suggested_caption": caption or f"Exploring {place_hint or 'Hyderabad'}",
            "confidence": 0.58,
        }

    def _offline_trip_critique(
        self, payload: dict, retrieved: list[RetrievalResult]
    ) -> dict:
        itinerary = payload.get("itinerary", [])
        stops = sum(len(day.get("stops", [])) for day in itinerary if isinstance(day, dict))
        budget = payload.get("budget_inr", 0)
        risks = []
        if stops > max(4, len(itinerary) * 3):
            risks.append(
                "The plan has too many stops for Hyderabad traffic; cluster fewer places per day."
            )
        if budget < 2500:
            risks.append("Budget is tight after transport, food, entry fees, and buffers.")
        if not risks:
            risks.append(
                "Main risk is peak-hour traffic between Old City, west Hyderabad, "
                "and lakefront areas."
            )
        context_titles = [item.title for item in retrieved[:3]]
        return {
            "score": max(52, min(91, 84 - max(0, stops - 6) * 4 + min(8, budget / 3000))),
            "risks": risks,
            "optimizations": [
                (
                    "Group Old City heritage and food together instead of mixing with "
                    "HITEC City on the same day."
                ),
                (
                    "Keep lakefront or cafe stops for evening when heat and commute "
                    "friction are lower."
                ),
                (
                    "Use retrieved context from: "
                    f"{', '.join(context_titles) or 'bundled city knowledge'}."
                ),
            ],
            "budget_notes": [
                "Reserve 20-25% of the budget for food, autos/cabs, and unplanned waiting time.",
                "Use metro for long east-west hops and cabs for final short transfers.",
            ],
            "safety_notes": [
                "Prefer high-footfall pickup points after dark.",
                "Carry water for forts, outdoor markets, and summer afternoon plans.",
            ],
        }

    def _offline_food_plan(
        self,
        payload: dict,
        ranked: list[tuple[FoodCatalogRestaurant, float]],
        retrieved: list[RetrievalResult],
    ) -> dict:
        recommendations = [
            _restaurant_dict(restaurant, score, payload) for restaurant, score in ranked
        ]
        top = recommendations[0]["name"] if recommendations else "the highest-rated match"
        dietary = payload.get("dietary_preference") or "flexible"
        return {
            "answer": (
                f"For '{payload['query']}', start with {top}. I ranked restaurants by "
                "cuisine match, budget fit, open-late need, crowd level, rating, and RAG "
                "context from the Hyderabad food knowledge base."
            ),
            "recommendations": recommendations,
            "citations": [item.citation for item in retrieved],
            "context_sources": [item.__dict__ for item in retrieved],
            "budget_strategy": [
                "Use cost-for-two as the base and add about 12% for service or taxes.",
                "Pick budget or mid-range places when the group estimate exceeds the meal cap.",
                "For Old City food walks, reserve extra cash for snacks, tea, and short autos.",
            ],
            "dietary_notes": [
                f"Dietary preference detected: {dietary}.",
                "Verify ingredients and kitchen separation directly with the restaurant.",
                "Vegetarian users should favor South Indian, bakery, cafe, and tiffin spots.",
            ],
        }


def _parse_json_object(value: str) -> dict | None:
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", value, flags=re.DOTALL)
        if not match:
            return None
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None


def _estimate_tokens(value: str) -> int:
    return max(1, round(len(value.split()) * 1.35))


def _estimate_cost(total_tokens: int) -> float:
    return round((total_tokens / 1000) * settings.ai_estimated_cost_per_1k_tokens, 6)


def _conversation_title(message: str) -> str:
    words = message.strip().split()
    return " ".join(words[:8])[:180] or "Hyderabad trip chat"


def _rolling_summary(summary: str | None, user_message: str, answer: str) -> str:
    next_line = f"User asked: {user_message[:140]} | Assistant answered: {answer[:180]}"
    combined = f"{summary}\n{next_line}" if summary else next_line
    return combined[-1800:]


def _chunk_for_stream(value: str, words_per_chunk: int = 10) -> list[str]:
    words = value.split()
    if not words:
        return [""]
    return [
        " ".join(words[index : index + words_per_chunk])
        for index in range(0, len(words), words_per_chunk)
    ]


def _json_safe(value: dict) -> dict:
    return json.loads(json.dumps(value, default=str))


FOOD_INTENT_TERMS: dict[str, tuple[str, ...]] = {
    "biryani": ("biryani", "dum", "basmati"),
    "haleem": ("haleem",),
    "mandi": ("mandi", "khabsa", "arabian"),
    "kebab": ("kebab", "grill", "tandoori", "pathar"),
    "shawarma": ("shawarma", "roll"),
    "chai": ("chai", "irani", "tea", "osmania"),
    "coffee": ("coffee", "cafe"),
    "dosa": ("dosa", "tiffin"),
    "idli": ("idli", "tiffin"),
    "thali": ("thali", "meals"),
    "dessert": ("dessert", "sweet", "cake", "bakery", "pastry", "falooda"),
    "buffet": ("buffet", "barbecue", "barbeque"),
    "rooftop": ("rooftop", "lounge"),
}


def _food_match_score(restaurant: FoodCatalogRestaurant, payload: dict, query: str) -> float:
    text = " ".join(
        [restaurant.name, restaurant.address, *restaurant.cuisine, *restaurant.highlights]
    ).lower()
    query_terms = [term for term in re.findall(r"[a-zA-Z]+", query.lower()) if len(term) > 2]
    requested_intents = [
        intent
        for intent, aliases in FOOD_INTENT_TERMS.items()
        if intent in query.lower() or any(alias in query.lower() for alias in aliases)
    ]
    score = float(restaurant.rating) * 12
    score += sum(5 for term in query_terms if term in text)
    for intent in requested_intents:
        aliases = FOOD_INTENT_TERMS[intent]
        has_intent = any(alias in text for alias in aliases)
        if has_intent:
            score += 24
        elif intent in {"biryani", "haleem", "mandi", "kebab", "shawarma", "dosa", "idli"}:
            score -= 20
        else:
            score -= 6
    if len(requested_intents) > 1:
        matched_count = sum(
            1
            for intent in requested_intents
            if any(alias in text for alias in FOOD_INTENT_TERMS[intent])
        )
        score += matched_count * 6
    budget = int(payload.get("budget_inr") or 0)
    members = max(1, int(payload.get("members") or 1))
    estimated_total = _restaurant_total(restaurant.cost_for_two, members)
    if budget and estimated_total <= budget:
        score += 18
    elif budget:
        score -= min(22, (estimated_total - budget) / max(100, budget) * 20)
    if payload.get("open_late") is True:
        score += 14 if restaurant.open_late else -14
    dietary = str(payload.get("dietary_preference") or "").lower()
    if dietary:
        if dietary in text:
            score += 16
        if dietary in {"veg", "vegetarian"} and "vegetarian" not in text:
            score -= 10
    area_hint = str(payload.get("area_hint") or "").lower()
    if area_hint and area_hint in restaurant.address.lower():
        score += 12
    if restaurant.crowd_level == "very_high":
        score -= 4
    elif restaurant.crowd_level == "moderate":
        score += 4
    return round(max(0, min(100, score)), 2)


def _restaurant_context_results(
    ranked: list[tuple[FoodCatalogRestaurant, float]]
) -> list[RetrievalResult]:
    return [
        RetrievalResult(
            title=restaurant.name,
            content=(
                f"{restaurant.name} in {restaurant.address}. Cuisine: "
                f"{', '.join(restaurant.cuisine)}. Highlights: "
                f"{', '.join(restaurant.highlights)}. Cost for two INR "
                f"{restaurant.cost_for_two}. Rating {restaurant.rating}. "
                f"Open late: {'yes' if restaurant.open_late else 'no'}. "
                f"Crowd level: {restaurant.crowd_level}. Approx distance from MGBS: "
                f"{restaurant.distance_from_mgbs_km} km."
            ),
            citation=f"Explore Hyderabad restaurant profile: {restaurant.name}",
            source_kind="restaurant_catalog",
            score=score,
        )
        for restaurant, score in ranked
    ]


def _merge_retrieval_results(
    primary: list[RetrievalResult],
    secondary: list[RetrievalResult],
) -> list[RetrievalResult]:
    merged: list[RetrievalResult] = []
    seen: set[str] = set()
    for item in [*primary, *secondary]:
        key = f"{item.source_kind}:{item.citation}:{item.title}".lower()
        if key not in seen:
            merged.append(item)
            seen.add(key)
    return merged[:8]


def _restaurant_total(cost_for_two: int, members: int) -> int:
    subtotal = round((cost_for_two / 2) * members)
    return round(subtotal * 1.12)


def _restaurant_dict(restaurant: FoodCatalogRestaurant, score: float, payload: dict) -> dict:
    members = max(1, int(payload.get("members") or 1))
    estimated_total = _restaurant_total(restaurant.cost_for_two, members)
    over_budget = estimated_total > int(payload.get("budget_inr") or estimated_total)
    return {
        "name": restaurant.name,
        "area": restaurant.address,
        "cuisine": restaurant.cuisine,
        "highlights": restaurant.highlights,
        "rating": restaurant.rating,
        "cost_for_two": restaurant.cost_for_two,
        "estimated_total": estimated_total,
        "open_late": restaurant.open_late,
        "crowd_level": restaurant.crowd_level,
        "distance_from_mgbs_km": restaurant.distance_from_mgbs_km,
        "image_key": restaurant.image_key,
        "match_score": score,
        "reasoning": (
            "Strong cuisine and rating match"
            if not over_budget
            else "Good match, but the group estimate may exceed the selected budget"
        ),
        "safety_note": (
            "Use main pickup points and avoid isolated lanes after dark."
            if restaurant.open_late
            else "Verify current opening hours before travel."
        ),
    }


ai_service = AIService()
