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
    tokenUrl="/api/admin-login"
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
        "exp": expire
    }


    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )



def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    print("TOKEN RECEIVED:", token)


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )


        print(
            "JWT PAYLOAD:",
            payload
        )


        admin_id = payload.get("sub")


        if not admin_id:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )


    except Exception as e:

        print(
            "JWT ERROR:",
            e
        )


        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )



    admin = (
        db.query(Admin)
        .filter(Admin.id == int(admin_id))
        .first()
    )



    if not admin:

        raise HTTPException(
            status_code=401,
            detail="Admin not found"
        )


    return admin