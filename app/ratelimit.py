"""Database-backed sliding-window rate limiter keyed by client IP.

The counts live in the database so limits stay correct even when the
app is load-balanced across multiple instances/workers (each instance
would otherwise keep its own private counter and the limits could be
bypassed by routing traffic to several servers).

Every event is a row; old rows outside the window are pruned lazily
so the table stays small.
"""

import time
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request

from app.database import get_db
from app.models import RateLimitEvent


def _now_utc():
    return datetime.now(timezone.utc)


def db_rate_limit(db, label: str, key: str, max_requests: int, window_seconds: int) -> None:
    """Enforce `max_requests` events for (label, key) per window. Raises 429."""
    cutoff = _now_utc() - timedelta(seconds=window_seconds)

    # Prune that label's expired rows (bounded work per request).
    db.query(RateLimitEvent).filter(
        RateLimitEvent.label == label,
        RateLimitEvent.created_at < cutoff,
    ).delete(synchronize_session=False)

    recent = (
        db.query(RateLimitEvent)
        .filter(
            RateLimitEvent.label == label,
            RateLimitEvent.key == key,
            RateLimitEvent.created_at >= cutoff,
        )
        .count()
    )

    if recent >= max_requests:
        db.rollback()
        raise HTTPException(
            status_code=429,
            detail=(
                "Too many requests. Please wait a moment and try again."
            ),
            headers={"Retry-After": str(max(1, window_seconds))},
        )

    db.add(RateLimitEvent(label=label, key=key, created_at=_now_utc()))
    db.commit()


def rate_limit(max_requests: int, window_seconds: int, label: str = "limit"):
    """Dependency factory enforcing `max_requests` per IP per window.

    Returns a FastAPI dependency callable.
    """
    def dependency(request: Request, db=Depends(get_db)) -> None:
        client = request.client.host if request.client else "unknown"
        db_rate_limit(db, label, f"{client}:{request.url.path}", max_requests, window_seconds)

    return dependency


# Drop-in helper used by the login route (which keeps its own lockout logic
# in the database for admin accounts).
def check_login_rate(db, ip: str, max_requests: int = 5, window_seconds: int = 60) -> bool:
    """Record a login attempt for an IP. Returns True if within the limit."""
    try:
        db_rate_limit(db, "login", ip, max_requests, window_seconds)
        return True
    except HTTPException:
        return False


def clear_login_rate(db, ip: str, label: str = "login") -> None:
    """Forget previous attempts for an IP after a successful login."""
    db.query(RateLimitEvent).filter(
        RateLimitEvent.label == label,
        RateLimitEvent.key == ip,
    ).delete(synchronize_session=False)
    db.commit()