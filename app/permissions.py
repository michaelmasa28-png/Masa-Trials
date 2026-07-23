from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Admin


def check_permission(
    db: Session,
    admin_id: int,
    permission_name: str
):

    admin = (
        db.query(Admin)
        .filter(Admin.id == admin_id)
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin not found"
        )


    # Super admin bypasses permissions

    if admin.role == "super_admin":
        return True


    allowed = any(
        permission.name == permission_name
        for permission in admin.permissions
    )


    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )


    return True
