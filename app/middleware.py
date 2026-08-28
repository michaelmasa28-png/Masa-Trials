import logging
import time
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("churchweb.middleware")


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catch unhandled exceptions and return structured JSON errors."""

    async def dispatch(self, request: Request, call_next):
        start = time.time()
        try:
            response = await call_next(request)
            elapsed = time.time() - start
            if elapsed > 5.0:
                logger.warning("Slow request: %s %s (%.1fs)", request.method, request.url.path, elapsed)
            return response
        except Exception as e:
            logger.exception("Unhandled error: %s %s -> %s", request.method, request.url.path, e)
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "Internal server error. Please try again later.",
                },
            )
