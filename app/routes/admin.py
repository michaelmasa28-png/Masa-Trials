from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.auth import authenticate_admin, create_access_token


router = APIRouter()



class LoginRequest(BaseModel):

    username: str
    password: str




@router.post("/api/admin-login")
def admin_login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):


    admin = authenticate_admin(
        db,
        data.username,
        data.password
    )


    if not admin:

        return {

            "success": False,

            "message": "Invalid username or password"

        }



    if admin.role != "super_admin":

        return {

            "success": False,

            "message": "Super Admin access only"

        }



    token = create_access_token(
        admin.id
    )



    return {

        "success": True,

        "message": "Login successful",

        "token": token,

        "admin": {

            "id": admin.id,

            "username": admin.username,

            "role": admin.role

        }

    }
