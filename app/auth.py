from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from app.models import Admin


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/admin/login"
)



def hash_password(password: str):
    return pwd_context.hash(password)



def verify_password(
    password: str,
    hashed_password: str
):

    return pwd_context.verify(
        password,
        hashed_password
    )



def authenticate_admin(
    db: Session,
    username: str,
    password: str
):

    admin = (
        db.query(Admin)
        .filter(Admin.username == username)
        .first()
    )


    if not admin:
        return None


    if not verify_password(
        password,
        admin.password_hash
    ):
        return None


    return admin



def create_access_token(
    admin_id: int
):

    expire = (
        datetime.now(timezone.utc)
        +
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )


    payload = {
        "sub": str(admin_id),
        "role": "admin",
        "exp": expire
    }


    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# MEMBER TOKEN
# ==========================================

def create_member_token(
    member_id: int
):

    expire = (
        datetime.now(timezone.utc)
        +
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(member_id),
        "role": "member",
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# Re-export the canonical get_current_admin from dependencies
from app.dependencies import get_current_admin