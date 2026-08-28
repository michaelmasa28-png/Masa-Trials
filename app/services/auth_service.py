import time
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import Admin
from app.auth import authenticate_admin, create_access_token, hash_password

logger = logging.getLogger(__name__)

# ==========================================
# IN-MEMORY RATE LIMITING
# ==========================================
_login_attempts: dict[str, list[float]] = {}
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW = 60  # seconds


def _is_rate_limited(ip: str) -> bool:
    now = time.time()
    attempts = _login_attempts.get(ip, [])
    attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW]
    _login_attempts[ip] = attempts
    return len(attempts) >= RATE_LIMIT_MAX


def _record_attempt(ip: str):
    _login_attempts.setdefault(ip, []).append(time.time())


def _clear_attempts(ip: str):
    _login_attempts.pop(ip, None)


# ==========================================
# ACCOUNT LOCKOUT
# ==========================================
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def _check_lockout(admin: Admin) -> bool:
    """Returns True if account is currently locked."""
    if admin.locked_until and admin.locked_until > datetime.now(timezone.utc):
        return True
    if admin.locked_until and admin.locked_until <= datetime.now(timezone.utc):
        admin.failed_login_attempts = 0
        admin.locked_until = None
    return False


def _record_failed_attempt(admin: Admin, db: Session):
    admin.failed_login_attempts = (admin.failed_login_attempts or 0) + 1
    if admin.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
        admin.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
        logger.warning("Account locked: %s (too many failed attempts)", admin.username)
    db.commit()


def _reset_failed_attempts(admin: Admin, db: Session):
    admin.failed_login_attempts = 0
    admin.locked_until = None
    db.commit()


# ==========================================
# LOGIN
# ==========================================
def login_admin(
    username: str,
    password: str,
    ip: str,
    db: Session,
) -> dict:
    """
    Authenticate admin with rate limiting and lockout.
    Returns dict with keys: success, message, token (optional), admin_data (optional).
    """
    if _is_rate_limited(ip):
        return {"success": False, "message": "Too many login attempts. Please wait 60 seconds."}

    admin = authenticate_admin(db, username, password)

    if not admin:
        _record_attempt(ip)
        return {"success": False, "message": "Invalid username or password"}

    if _check_lockout(admin):
        return {"success": False, "message": "Account is temporarily locked. Try again later."}

    if not admin.is_active or admin.status != "Active":
        return {"success": False, "message": "Account is inactive"}

    _clear_attempts(ip)
    _reset_failed_attempts(admin, db)

    admin.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(admin.id)

    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "admin_data": {
            "id": admin.id,
            "full_name": admin.full_name,
            "username": admin.username,
            "role": admin.role,
            "email": admin.email,
        },
    }


# ==========================================
# ADMIN MANAGEMENT
# ==========================================
def create_admin(data, current_admin: Admin, db: Session) -> dict:
    """Create a new admin user."""
    existing = db.query(Admin).filter(Admin.username == data.username).first()
    if existing:
        return {"success": False, "message": "Username already exists"}

    from app.permissions import check_permission
    check_permission(db, current_admin.id, "manage_admins")

    new_admin = Admin(
        full_name=data.full_name,
        username=data.username,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
        created_by=current_admin.id,
    )

    if hasattr(data, "permissions") and data.permissions:
        from app.models import Permission
        permissions = db.query(Permission).filter(Permission.id.in_(data.permissions)).all()
        new_admin.permissions = permissions

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "success": True,
        "message": "Admin created successfully",
        "admin_id": new_admin.id,
        "role": new_admin.role,
    }
