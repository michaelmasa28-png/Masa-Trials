from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM
from app.database import get_db
from app.models import Admin, Member


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        admin_id = payload.get("sub")
        role = payload.get("role", "admin")

        if admin_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    admin = (
        db.query(Admin)
        .filter(Admin.id == int(admin_id))
        .first()
    )

    if admin is None:
        raise credentials_exception

    return admin


# ==========================================
# MEMBER AUTH
# ==========================================

oauth2_member_scheme = OAuth2PasswordBearer(tokenUrl="/member/login", auto_error=False)

def get_current_member(
    token: str = Depends(oauth2_member_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate member credentials"
    )

    if token is None:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        member_id = payload.get("sub")
        role = payload.get("role", "member")

        if member_id is None or role != "member":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    member = (
        db.query(Member)
        .filter(Member.id == int(member_id))
        .first()
    )

    if member is None:
        raise credentials_exception

    return member
