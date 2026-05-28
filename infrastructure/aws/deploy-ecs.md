# AWS Deployment Guide

1. Create ECR repositories for `explore-hyderabad-frontend` and `explore-hyderabad-backend`.
2. Provision RDS PostgreSQL with PostGIS enabled, ElastiCache Redis, and an ECS Fargate cluster.
3. Store secrets in AWS Secrets Manager: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`.
4. Create ECS task definitions for backend, worker, frontend, and Nginx or use an Application Load Balancer with path routing.
5. Terminate HTTPS at AWS ACM + ALB. Route `/api/*` and `/ws/*` to backend, all other paths to frontend.
6. Run Alembic migrations from a one-off ECS task before promoting new backend releases.
7. Enable CloudWatch logs, ALB access logs, RDS backups, Redis snapshots, and alarms for 5xx, latency, CPU, memory, and queue depth.

