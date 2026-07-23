
from fastapi import FastAPI
from app.routes.member_routes import router as member_router
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.routes.attendance_routes import router as attendance_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes import gallery_routes

# Import models so SQLAlchemy knows about them
from app.models import Admin
from app.routes import sermon_routes
from app.routes.auth_routes import router as auth_router
from app.routes.admin import router as admin_router
# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kingdom Ways Church CMS",
    version="1.0.0"
)

app.include_router(dashboard_router)
app.include_router(gallery_routes.router)
app.include_router(attendance_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(member_router)
app.include_router(sermon_routes.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

app.mount(
    "/",
    StaticFiles(directory="public", html=True),
    name="public"
)
