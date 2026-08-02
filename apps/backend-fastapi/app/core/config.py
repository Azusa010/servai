from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Customer Service Platform API"
    api_prefix: str = "/api"

    database_url: str = "sqlite:///./data.db"

    access_token_secret: str = "access_token_secret"
    refresh_token_secret: str = "refresh_token_secret"
    jwt_algorithm: str = "HS256"

    cors_origins: list[str] = [
        "http://localhost:5777",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
