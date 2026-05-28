from __future__ import annotations

import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    ".env.example",
    ".env.production.example",
    "docker-compose.yml",
    "backend/Dockerfile",
    "frontend/Dockerfile",
    "infrastructure/nginx/default.conf",
    "backend/alembic/versions/0001_initial_schema.py",
]
REQUIRED_ENV_KEYS = [
    "ENVIRONMENT",
    "DATABASE_URL",
    "REDIS_URL",
    "JWT_SECRET",
    "OPENAI_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "ALLOWED_ORIGINS",
    "NEXT_PUBLIC_API_URL",
]


def read_env_keys(path: Path) -> set[str]:
    keys: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        keys.add(line.split("=", 1)[0].strip())
    return keys


def main() -> int:
    missing_files = [item for item in REQUIRED_FILES if not (ROOT / item).exists()]
    if missing_files:
        print(f"Missing deploy files: {', '.join(missing_files)}")
        return 1

    missing_env = sorted(set(REQUIRED_ENV_KEYS) - read_env_keys(ROOT / ".env.production.example"))
    if missing_env:
        print(f"Missing production env keys: {', '.join(missing_env)}")
        return 1

    compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")
    for service in ("postgres:", "redis:", "backend:", "worker:", "frontend:", "nginx:"):
        if service not in compose:
            print(f"docker-compose.yml missing service {service}")
            return 1

    nginx = (ROOT / "infrastructure/nginx/default.conf").read_text(encoding="utf-8")
    if "proxy_set_header Upgrade" not in nginx or "/api/v1/ws/" not in nginx:
        print("Nginx WebSocket proxy is not deploy-ready")
        return 1

    if os.getenv("ENVIRONMENT") == "production":
        env_path = ROOT / ".env"
        if not env_path.exists():
            print("Production verification requires a real .env file")
            return 1
        keys = read_env_keys(env_path)
        missing_real_env = sorted(set(REQUIRED_ENV_KEYS) - keys)
        if missing_real_env:
            print(f"Real .env is missing: {', '.join(missing_real_env)}")
            return 1

    print("Deploy readiness file checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
