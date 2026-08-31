"""Simple in-memory sliding-window rate limiter keyed by client IP."""

import time
import threading
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_lock = threading.Lock()
# window_key -> deque of timestamps. Key = (label, client_ip, window_seconds)
_buckets: dict = defaultdict(lambda: deque())


def _cleanup(labels: set) -> None:
    """Drop buckets that haven't been touched recently to bound memory."""
    now = time.time()
    for key in list(_buckets.keys()):
        label = key[0]
        window = key[2]
        recent = _buckets[key]
        # Keep the deque user-facing fresh: only retain timestamps
        # within the window. Then drop empty/large-window buckets.
        while recent and now - recent[0] > window:
            recent.popleft()

        if label in labels and not recent:
            _buckets.pop(key, None)


def rate_limit(max_requests: int, window_seconds: int, label: str = "limit"):
    """Dependency factory enforcing `max_requests` per IP per window.

    Returns a FastAPI dependency callable.
    """
    def dependency(request: Request) -> None:
        client = request.client.host if request.client else "unknown"
        key = (label, client, window_seconds)
        now = time.time()

        with _lock:
            bucket = _buckets[key]
            while bucket and bucket[0] <= now - window_seconds:
                bucket.popleft()

            if len(bucket) >= max_requests:
                _cleanup({label})
                retry_after = int(bucket[0] + window_seconds - now)
                raise HTTPException(
                    status_code=429,
                    detail=(
                        "Too many requests. Please wait a moment and try again."
                    ),
                    headers={"Retry-After": str(max(1, retry_after))},
                )

            bucket.append(now)
            if len(_buckets) > 10_000:
                _cleanup(set())

    return dependency
