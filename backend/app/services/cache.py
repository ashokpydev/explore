import json
from redis.asyncio import Redis
from app.core.config import settings

redis = Redis.from_url(settings.redis_url, decode_responses=True)


async def get_json(key: str) -> dict | list | None:
    value = await redis.get(key)
    return json.loads(value) if value else None


async def set_json(key: str, value: dict | list, ttl_seconds: int = 300) -> None:
    await redis.set(key, json.dumps(value, default=str), ex=ttl_seconds)

