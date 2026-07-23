from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_admin
from app.permissions import check_permission
from app.database import SessionLocal
from app.models import Admin, Permission
from app.schema import AdminCreate
from app.auth import hash_password
from app.models import Sermon
from app.schema import SermonCreate

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/admin/create")
def create_admin(
    data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Check if the logged-in admin has permission
    check_permission(
        db,
        current_admin.id,
        "manage_admins"
    )

    # Check if username already exists
    existing = (
        db.query(Admin)
        .filter(Admin.username == data.username)
        .first()
    )

    if existing:
        return {
            "success": False,
            "message": "Username already exists"
        }

    # Create new admin
    new_admin = Admin(
        full_name=data.full_name,
        username=data.username,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role
    )

    # Attach selected permissions
    permissions = (
        db.query(Permission)
        .filter(
            Permission.id.in_(data.permissions)
        )
        .all()
    )

    new_admin.permissions = permissions

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "success": True,
        "message": "Admin created successfully",
        "admin_id": new_admin.id,
        "permissions": [
            p.name for p in permissions
        ]
    }

@router.post("/admin/sermons")
def create_sermon(
    data: SermonCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    sermon = Sermon(
        title=data.title,
        preacher=data.preacher,
        scripture=data.scripture,
        description=data.description,
        video_url=data.video_url,
        audio_url=data.audio_url
    )

    db.add(sermon)
    db.commit()
    db.refresh(sermon)

    return {
        "success": True,
        "message": "Sermon saved successfully.",
        "sermon_id": sermon.id
    }
