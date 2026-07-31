from typing import Any, Generic, TypeVar

from fastapi.responses import JSONResponse
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int
    data: T | None
    error: Any | None
    message: str


class PageData(BaseModel, Generic[T]):
    items: list[T]
    total: int


def success_response(
    data: T,
    message: str = "ok",
) -> ApiResponse[T]:
    return ApiResponse(
        code=0,
        data=data,
        error=None,
        message=message,
    )


def page_response(
    items: list[T],
    total: int,
) -> ApiResponse[PageData[T]]:
    return success_response(PageData(items=items, total=total))


def error_response(
    message: str,
    status_code: int = 400,
    error: Any | None = None,
) -> JSONResponse:
    response = ApiResponse[Any](
        code=-1,
        data=None,
        error=error if error is not None else message,
        message=message,
    )

    return JSONResponse(
        content=response.model_dump(),
        status_code=status_code,
    )
