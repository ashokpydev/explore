# Deploy Readiness

The application is structured for container deployment with a Next.js frontend, FastAPI backend, Celery worker, PostgreSQL/PostGIS, Redis, and Nginx.

## Required before production

1. Copy `.env.production.example` into the secret store for your host.
2. Replace every placeholder secret and key.
3. Set `SEED_DEMO_DATA=false` for a real production database.
4. Restrict `ALLOWED_ORIGINS` to the final HTTPS domain.
5. Run `python scripts/verify_deploy.py` during CI.
6. Run `alembic upgrade head` before serving the backend.
7. Confirm `/health`, `/ready`, `/api/v1/places`, `/api/v1/food/restaurants`, and `/api/v1/ai/chat`.

## Local container launch

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Readiness: `http://localhost:8000/ready`

The backend container runs migrations and seeds demo data before starting. The admin demo user comes from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Production notes

- Use managed PostgreSQL with PostGIS enabled.
- Use managed Redis for cache and Celery broker.
- Terminate TLS at the load balancer or reverse proxy.
- Send backend, worker, and Nginx logs to centralized logging.
- Enable database backups, Redis snapshots, 5xx alarms, latency alarms, and worker queue-depth alarms.
