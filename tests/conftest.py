"""Shared pytest fixtures for the Kingdom Ways Church giving tests.

Uses a fresh SQLite file database per test so the giving flow can be
exercised end-to-end without touching the real database.
"""

import os

# Point at SQLite BEFORE importing app modules so config.py uses it.
os.environ["DATABASE_URL"] = "sqlite:///./test_church_cms.db"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine, SessionLocal
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
