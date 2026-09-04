import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.auth import authenticate_admin, create_access_token
from app.ratelimit import check_login_rate, clear_login_rate
from app.schema import AdminLogin
from app.models import Admin

logger = logging.getLogger(__name__)

router = APIRouter()

# ==========================================
# LOGIN RATE LIMITING (database-backed)
# Limits are shared across all instances so a
# load-balanced setup can't be bypassed by
# routing login attempts to different servers.
# ==========================================

RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW = 60  # seconds
LOCKOUT_MINUTES = 15


# ==========================================
# ADMIN LOGIN
# ==========================================

@router.post("/admin/login")
def admin_login(
    request: Request,
    data: AdminLogin,
    db: Session = Depends(get_db)
):
    ip = request.client.host if request.client else "unknown"

    if not check_login_rate(db, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW):
        logger.warning("Rate limited login attempt from %s", ip)
        return {
            "success": False,
            "message": "Too many login attempts. Please wait a minute."
        }

    admin = authenticate_admin(db, data.username, data.password)

    if not admin:
        logger.warning("Failed login for username=%s from IP=%s", data.username, ip)

        existing = db.query(Admin).filter(Admin.username == data.username).first()
        if existing:
            existing.failed_login_attempts = (existing.failed_login_attempts or 0) + 1
            if existing.failed_login_attempts >= 5:
                existing.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
                logger.warning("Admin account locked: %s", data.username)
            db.commit()

        return {
            "success": False,
            "message": "Invalid username or password"
        }

    # Check if account is locked
    now = datetime.now(timezone.utc)
    if admin.locked_until:
        locked_until = admin.locked_until if admin.locked_until.tzinfo else admin.locked_until.replace(tzinfo=timezone.utc)
        if locked_until > now:
            remaining = (locked_until - now).seconds // 60 + 1
            return {
                "success": False,
                "message": f"Account is locked. Try again in {remaining} minute(s)."
            }
        else:
            admin.locked_until = None
            admin.failed_login_attempts = 0
            db.commit()

    if not admin.is_active or admin.status != "Active":
        return {
            "success": False,
            "message": "This admin account is not active"
        }

    clear_login_rate(db, ip)
    admin.failed_login_attempts = 0
    admin.locked_until = None
    admin.last_login = now
    db.commit()

    token = create_access_token(admin.id)

    return {
        "success": True,
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "full_name": admin.full_name,
            "role": admin.role
        }
    }
