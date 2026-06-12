# Explore Hyderabad

Explore Hyderabad is a production-ready full-stack GenAI application for tourism and city exploration across Hyderabad and Telangana.

It includes a premium Next.js frontend, a modular FastAPI backend, PostgreSQL/PostGIS schema, pgvector retrieval, Redis caching, Celery workers, JWT auth, RAG assistant APIs, structured itinerary generation, intent extraction, moderation, travel image metadata, trip critique, WebSocket support, Docker Compose, Nginx, CI, sample data, and AWS deployment guidance.

## Features

- Tourist places, historical monuments, lakes, temples, mosques, resorts, trekking spots, weekend getaways, hidden gems, and local experiences.
- Food discovery for biryani, street food, cafes, fine dining, rooftops, and midnight food spots.
- Shopping and markets including Laad Bazaar, Begum Bazaar, IKEA, malls, parking, popular items, and negotiation tips.
- AI travel assistant with RAG knowledge retrieval, pgvector semantic search, full-text fallback, multilingual response support, voice UI affordances, and explainable citations.
- GenAI studio APIs for prompt intent extraction, entity detection, tool routing, review moderation, safe rewrite, image alt text/tag generation, route critique, ingestion, RAG evaluation, and usage observability.
- Persistent AI conversation memory with conversation IDs, recent-message grounding, summaries, user preference extraction, and server-sent event streaming.
- Smart itinerary planner optimized for budget, distance, timings, traffic, weather, crowd predictions, and trip type.
- Geo features for nearby discovery, route estimates, cab fares, metro hints, and Google Maps integration.
- Social features model support for reviews, favorites, travel stories, photo uploads, likes/comments extension.
- Admin panel route and protected analytics endpoint.
- PWA manifest, dark/light mode, responsive UI, skeleton-ready architecture, lazy image loading through Next Image.
- Interactive product flows: searchable/filterable places, selectable city map markers, live trip cockpit, food budget filters, late-night safety filters, AI itinerary controls, expense breakdown, emergency call shortcuts, admin moderation actions, and deployable production containers.

## Folder Architecture

```text
backend/
  app/
    api/routes/       FastAPI routers
    core/             settings and security
    db/               async SQLAlchemy session
    models/           normalized SQLAlchemy models with PostGIS fields
    schemas/          Pydantic validation schemas
    services/         AI, cache, geo, recommendation seams
    workers/          Celery app and background jobs
  alembic/            migrations
frontend/
  app/                Next.js App Router pages
  components/         reusable UI and assistant panels
  lib/                data, API client, utilities
infrastructure/
  nginx/              reverse proxy
  aws/                deployment guide
scripts/seed/         PostGIS init and sample data
docs/                 API and database documentation
```

## Quick Start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add real secrets in `.env`, especially `JWT_SECRET`, `OPENAI_API_KEY`, and `GOOGLE_MAPS_API_KEY`.

3. Start the platform:

```bash
docker compose up --build
```

4. Open:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install ".[dev]"
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Production frontend:

```bash
cd frontend
npm ci
npm run build
npm run start -- -p 3001
```

Standalone container runtime:

```bash
cd frontend
npm run build
npm run start:standalone
```

## GenAI Architecture

The backend uses `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_EMBEDDING_MODEL`. Without a key, all GenAI APIs fall back to deterministic local behavior so portfolio demos still work offline.

Implemented GenAI concepts:

- RAG ingestion from places, restaurants, and events into `ai_knowledge_sources`.
- pgvector embeddings with cosine search, plus PostgreSQL full-text lexical fallback.
- Grounded chat responses with citations, context source scores, trust levels, and freshness metadata.
- Persistent conversation memory through `ai_conversations` and `ai_conversation_messages`, including summaries, extracted preferences, and recent-message grounding.
- Server-sent event streaming endpoint for progressive assistant responses.
- Structured itinerary generation for days, budget, interests, trip type, and language.
- Intent extraction that returns entities, confidence, follow-up questions, and recommended internal tools.
- AI moderation that returns approve/review/reject decisions, categories, severity, and safe rewrites.
- Vision metadata endpoint for travel media alt text, tags, captions, and safety flags.
- Trip critique endpoint that audits route density, budget pressure, timing, and safety risks.
- Protected ingestion endpoint for manual documents and source URLs, with chunking, trust metadata, embedding, and ingestion run tracking.
- RAG evaluation endpoint for golden-query smoke tests covering required terms, citation hits, scores, and pass rates.
- AI observability through `ai_request_logs`: model, operation, status, token estimates, latency, estimated cost, retrieved context count, and recent request summaries.
- Celery background jobs for RAG reindexing, knowledge ingestion, RAG evaluation, content moderation, media tagging, and crowd prediction refreshes.
- WebSocket assistant endpoint for conversational UX.

Recommended RAG flow:

1. Ingest verified Hyderabad/Telangana tourism content.
2. Chunk by place, event, cuisine, route, festival, safety note, and language.
3. Store embeddings with source URLs, freshness, and trust level.
4. Retrieve by intent, location, language, and season.
5. Generate grounded responses with citations and safety disclaimers.

Open-source and open-data-friendly services used by the stack:

- FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, PostGIS, pgvector, Redis, Celery, Next.js, Tailwind CSS, and OpenStreetMap-compatible map embeds.
- Optional model provider through the OpenAI-compatible SDK; the app is structured so another compatible LLM provider can be swapped at the service boundary.

Useful CV framing:

- Built a GenAI travel platform with RAG, vector search, structured output APIs, moderation, image metadata generation, and itinerary optimization.
- Designed a production-ready FastAPI + Next.js architecture using PostgreSQL/PostGIS, pgvector, Redis, Celery, Docker, and Alembic.
- Implemented retrieval explainability through citations, source kinds, similarity scores, trust levels, and freshness-aware knowledge chunks.
- Added persistent conversation memory, SSE streaming, admin ingestion, RAG evaluation, token/latency logging, and usage analytics.
- Added offline deterministic AI fallbacks so demos remain reliable without paid API keys.

## Security and Production Notes

- Replace default secrets and enable HTTPS.
- Use short-lived JWT access tokens and add refresh-token rotation for consumer release.
- Restrict CORS to production domains.
- Add object storage scanning for photo uploads.
- Add moderation workflows for reviews, stories, and guide listings.
- Alembic migrations are included and the backend Docker image runs `alembic upgrade head` before serving.
- Use RDS backups, Redis persistence, CloudWatch alarms, and WAF rate rules.
- `npm audit --omit=dev --audit-level=high` currently has no high-severity runtime failure. NPM still reports a moderate PostCSS advisory inside the current Next package metadata; upgrade Next again when the framework publishes a patched stable release.

## Deployment

Use `docker-compose.yml` for local and staging-style runs. For AWS, follow [infrastructure/aws/deploy-ecs.md](infrastructure/aws/deploy-ecs.md).
For the production checklist and smoke checks, see [docs/deploy-readiness.md](docs/deploy-readiness.md).
