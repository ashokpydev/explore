from functools import lru_cache
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Explore Hyderabad"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+asyncpg://explore:explore@postgres:5432/explore_hyderabad"
    )
    redis_url: str = "redis://redis:6379/0"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 14
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    google_maps_api_key: str | None = None
    seed_demo_data: bool = True
    seed_admin_email: str = "admin@explorehyderabad.local"
    seed_admin_password: str = "ChangeMe123!"
    allowed_origins: list[AnyHttpUrl] | list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    rate_limit: str = "120/minute"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
