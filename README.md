# Explore Hyderabad

Explore Hyderabad is a production-ready full-stack application for an AI-powered tourism and city exploration platform for Hyderabad and Telangana.

It includes a premium Next.js frontend, a modular FastAPI backend, PostgreSQL/PostGIS schema, Redis caching, Celery workers, JWT auth, AI assistant seams, itinerary generation, WebSocket support, Docker Compose, Nginx, CI, sample data, and AWS deployment guidance.

## Features

- Tourist places, historical monuments, lakes, temples, mosques, resorts, trekking spots, weekend getaways, hidden gems, and local experiences.
- Food discovery for biryani, street food, cafes, fine dining, rooftops, and midnight food spots.
- Shopping and markets including Laad Bazaar, Begum Bazaar, IKEA, malls, parking, popular items, and negotiation tips.
- AI travel assistant with RAG-ready knowledge retrieval, semantic-search seam, multilingual response support, and voice/OCR/image-tagging extension points.
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

## AI Integration

The backend uses `OPENAI_API_KEY` and `OPENAI_MODEL`. Without a key, the assistant falls back to bundled Hyderabad knowledge so local demos still work. For production RAG, connect `AIService._retrieve` to pgvector, OpenSearch, Pinecone, Weaviate, or another vector store.

Recommended RAG flow:

1. Ingest verified Hyderabad/Telangana tourism content.
2. Chunk by place, event, cuisine, route, festival, safety note, and language.
3. Store embeddings with source URLs, freshness, and trust level.
4. Retrieve by intent, location, language, and season.
5. Generate grounded responses with citations and safety disclaimers.

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
