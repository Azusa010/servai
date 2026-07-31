from fastapi import FastAPI

from app.core.config import get_settings
from app.schemas.response import success_response


settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")


@app.get(f"{settings.api_prefix}/status")
def get_status():
    return success_response({"status": "ok"})
