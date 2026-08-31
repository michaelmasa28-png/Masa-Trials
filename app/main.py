import logging
import os
import threading
from contextlib import asynccontextmanager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Silence per-request noise from third-party libraries (httpx, httpcore,
# uvicorn.access, sqlalchemy) so a single operation doesn't produce
# many lines.  Individual app loggers inherit from root (INFO).
for _noisy in (
    "httpx", "httpcore", "uvicorn.access",
    "sqlalchemy.engine", "multipart",
):
    logging.getLogger(_noisy).setLevel(logging.WARNING)

logger = logging.getLogger("churchweb")

from app.routes.giving_routes import router as giving_router
from fastapi import FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware
from app.routes.chat_routes import router as chat_router
from app.routes.websocket_routes import router as websocket_router

from app.routes.member_routes import router as member_router
from app.database import Base, engine, SessionLocal

from fastapi.middleware.cors import CORSMiddleware
from app.middleware import ErrorHandlerMiddleware

from app.routes.attendance_routes import router as attendance_router
from app.routes.ai_attendance_routes import router as ai_attendance_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes import gallery_routes

from app.routes.events_routes import router as events_router

# Import ALL models so SQLAlchemy knows about them
from app.models import (
    Admin, Member, Giving, Event, Sermon, Attendance, Gallery,
    CardBackground, Transaction, Conversation, ConversationMember,
    Message, CommunicationLog, MemberNotification, ChurchContact,
    ScannedContact, AuditLog, GivingAccount, AIAttendanceSession
)

from app.routes import sermon_routes
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_routes_router
from app.routes.card_background_routes import router as card_bg_router
from app.routes.communication_routes import router as communication_router
from app.routes.settings_routes import router as settings_router
from app.config import CORS_ORIGINS, SECRET_KEY, DATABASE_TYPE


# Create database tables
Base.metadata.create_all(bind=engine)


def _auto_migrate_postgres():
    """Idempotently add columns missing from existing tables (PostgreSQL only)."""
    if engine.dialect.name != "postgresql":
        return
    from sqlalchemy import text

    migration_sql = {
        "givings": [
            ("safaricom_name", "varchar(150)"),
            ("reference", "varchar(255)"),
        ],
    }

    with engine.begin() as conn:
        for table, columns in migration_sql.items():
            try:
                existing = {
                    row[0] for row in conn.execute(text(
                        "SELECT column_name FROM information_schema.columns "
                        "WHERE table_name = :t"
                    ), {"t": table})
                }
            except Exception:
                continue
            for col, ddl in columns:
                if col not in existing:
                    try:
                        conn.execute(text(
                            f'ALTER TABLE "{table}" ADD COLUMN "{col}" {ddl}'
                        ))
                        logging.getLogger("churchweb").info(
                            "Auto-migrate: added %s.%s", table, col
                        )
                    except Exception as e:
                        logging.getLogger("churchweb").warning(
                            "Auto-migrate failed on %s.%s: %s", table, col, e
                        )


_auto_migrate_postgres()



def _seed_default_admin():
    """Create a default Super Admin only if SEED_ADMIN=true and no admins exist."""
    if os.getenv("SEED_ADMIN", "false").lower() != "true":
        logger.info("SEED_ADMIN is not enabled — skipping default admin seed.")
        return

    db = SessionLocal()
    try:
        from app.auth import hash_password
        existing = db.query(Admin).count()
        if existing == 0:
            admin = Admin(
                full_name="Super Admin",
                username="admin",
                email="admin@church.local",
                phone="0700000000",
                password_hash=hash_password("admin123"),
                role="super_admin",
                is_active=True,
                must_change_password=True,
                status="Active"
            )
            db.add(admin)
            db.commit()
            logger.info("Default admin created: admin / admin123 (CHANGE THIS PASSWORD!)")
    except Exception as e:
        logger.info("Seed admin skipped: %s", e)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if SECRET_KEY == "change_this_to_a_long_random_secret_key":
        if DATABASE_TYPE == "postgresql":
            raise RuntimeError(
                "Refusing to start: SECRET_KEY is still the default placeholder. "
                "Set a strong random SECRET_KEY in your environment before going live."
            )
        logger.warning("CRITICAL: SECRET_KEY is still the default placeholder! Change it in .env immediately.")
    _seed_default_admin()

    # Keep Neon DB connection alive (ping every 4 min)
    if os.getenv("DATABASE_URL", "").startswith("postgresql"):
        def _keep_alive():
            from sqlalchemy import text
            import time
            while True:
                time.sleep(240)
                db = SessionLocal()
                try:
                    db.execute(text("SELECT 1"))
                except Exception:
                    pass
                finally:
                    db.close()
        t = threading.Thread(target=_keep_alive, daemon=True)
        t.start()
        logger.info("DB keep-alive started (pings every 4 min)")

    yield
    # Shutdown (nothing to clean up)


app = FastAPI(
    title="Kingdom Ways Church CMS",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZIP Compression (reduces payload size ~70%)
app.add_middleware(GZipMiddleware, minimum_size=500)

# Centralized error handling
app.add_middleware(ErrorHandlerMiddleware)


# Routers (must be added BEFORE static mount)
app.include_router(chat_router)
app.include_router(websocket_router)
app.include_router(dashboard_router)

app.include_router(gallery_routes.router)
app.include_router(giving_router)
app.include_router(attendance_router)
app.include_router(ai_attendance_router)

app.include_router(auth_router)
app.include_router(admin_routes_router)

app.include_router(member_router)

app.include_router(events_router)

app.include_router(sermon_routes.router)

app.include_router(card_bg_router)

app.include_router(communication_router)

app.include_router(settings_router)


@app.get("/health")
def health_check():
    """Health check: verifies app is running and DB is reachable."""
    from sqlalchemy import text
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    finally:
        db.close()

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "version": "1.0.0",
    }


@app.get("/memberlogin.html")
def memberlogin_redirect():
    from starlette.responses import RedirectResponse
    return RedirectResponse(url="/btn.html", status_code=302)


# Frontend with cache headers

from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware

# ===========================================
# CLEAN URL MIDDLEWARE
# /offerings -> serves public/offerings.html
# /login -> serves public/login.html
# etc.
# ===========================================

class CleanURLMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        path = request.url.path
        # Only fix 404s for paths without extensions and not under /api/
        if response.status_code == 404 and not path.startswith("/api/") and "." not in path.split("/")[-1]:
            html_file = os.path.join("public", path.strip("/") + ".html")
            if os.path.isfile(html_file):
                return FileResponse(html_file)
        return response

app.add_middleware(CleanURLMiddleware)


CACHE_EXTENSIONS = {
    ".jpg": 604800, ".jpeg": 604800, ".png": 604800,
    ".gif": 604800, ".svg": 259200, ".webp": 604800,
    ".ico": 259200, ".woff2": 31536000, ".woff": 31536000,
    ".ttf": 31536000, ".css": 3600, ".js": 0,
}

class CachedStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if isinstance(response, FileResponse):
            ext = os.path.splitext(path)[1].lower()
            max_age = CACHE_EXTENSIONS.get(ext, 3600)
            response.headers["Cache-Control"] = f"public, max-age={max_age}"
            response.headers["Vary"] = "Accept-Encoding"
        return response


app.mount(
    "/",
    CachedStaticFiles(
        directory="public",
        html=True
    ),
    name="public"
)