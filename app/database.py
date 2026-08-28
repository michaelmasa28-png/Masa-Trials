from sqlalchemy import create_engine, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL, DATABASE_TYPE

# ===========================================
# ENGINE CONFIGURATION
# Different settings for PostgreSQL vs SQLite
# ===========================================

if DATABASE_TYPE == "postgresql":
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=3,
        max_overflow=10,
    )
else:
    # SQLite: no connection pooling, WAL mode for concurrency
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all models
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===========================================
# HELPER: DateTime column compatible with
# both PostgreSQL (timezone) and SQLite (no tz)
# ===========================================

def DateTimeTZ(**kwargs):
    """DateTime with timezone support for PostgreSQL, plain DateTime for SQLite."""
    if DATABASE_TYPE == "postgresql":
        return DateTime(timezone=True, **kwargs)
    return DateTime(**kwargs)