from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_current_admin
from app.permissions import check_permission
from app.database import get_db
from app.models import Admin, Permission
from app.schema import AdminCreate
from app.auth import hash_password

router = APIRouter()


class RoleUpdate(BaseModel):
    role: str


@router.post("/admin/create")
def create_admin(
    data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Check if the logged-in admin has permission to create other admins
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

    # Create new admin with whichever role was requested
    new_admin = Admin(
        full_name=data.full_name,
        username=data.username,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
        created_by=current_admin.id
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
        "role": new_admin.role,
        "permissions": [
            p.name for p in permissions
        ]
    }


# ==========================================
# DELETE ADMIN (super_admin only)
# ==========================================

@router.delete("/admin/{admin_id}")
def delete_admin(
    admin_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if current_admin.role != "super_admin":
        return {
            "success": False,
            "message": "Only super admin can delete admins."
        }

    if admin_id == current_admin.id:
        return {
            "success": False,
            "message": "You cannot delete your own account."
        }

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        return {
            "success": False,
            "message": "Admin not found."
        }

    db.delete(admin)
    db.commit()

    return {
        "success": True,
        "message": f"Admin '{admin.username}' deleted."
    }


# ==========================================
# CHANGE ADMIN ROLE (super_admin only)
# ==========================================

@router.put("/admin/{admin_id}/role")
def change_admin_role(
    admin_id: int,
    data: RoleUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if current_admin.role != "super_admin":
        return {
            "success": False,
            "message": "Only super admin can change roles."
        }

    if admin_id == current_admin.id:
        return {
            "success": False,
            "message": "You cannot change your own role."
        }

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        return {
            "success": False,
            "message": "Admin not found."
        }

    valid_roles = ["super_admin", "admin", "secretary", "treasurer", "pastor"]
    if data.role not in valid_roles:
        return {
            "success": False,
            "message": f"Invalid role. Valid: {', '.join(valid_roles)}"
        }

    admin.role = data.role
    db.commit()

    return {
        "success": True,
        "message": f"Role changed to '{data.role}' for '{admin.username}'.",
        "role": data.role
    }