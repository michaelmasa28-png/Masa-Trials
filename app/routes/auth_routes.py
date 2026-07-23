from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.auth import authenticate_admin, create_access_token


router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



@router.post("/admin/login")
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    admin = authenticate_admin(
        db,
        form_data.username,
        form_data.password
    )


    if not admin:
        return {
            "success": False,
            "message": "Invalid username or password"
        }


    token = create_access_token(admin.id)


    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "role": admin.role
        }
    }
