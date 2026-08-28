import logging
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import Member, Attendance
from app.auth import hash_password
from app.utils import generate_username

logger = logging.getLogger(__name__)


def serialize_member(member: Member) -> dict:
    """Convert a Member ORM object to a JSON-serializable dict."""
    return {
        "id": member.id,
        "full_name": member.full_name,
        "phone": member.phone,
        "member_number": member.member_number,
        "photo": member.photo,
        "gender": member.gender,
        "date_of_birth": member.date_of_birth.isoformat() if member.date_of_birth else None,
        "email": member.email,
        "national_id": member.national_id,
        "occupation": member.occupation,
        "marital_status": member.marital_status,
        "address": member.address,
        "emergency_contact": member.emergency_contact,
        "emergency_phone": member.emergency_phone,
        "ministry": member.ministry,
        "baptism_status": member.baptism_status,
        "baptism_date": member.baptism_date.isoformat() if member.baptism_date else None,
        "status": member.status,
        "is_active": member.is_active,
        "profile_completed": member.profile_completed,
        "role": getattr(member, "role", "member"),
        "created_at": member.created_at.isoformat() if member.created_at else None,
        "approved_at": member.approved_at.isoformat() if member.approved_at else None,
        "last_seen": member.last_seen.isoformat() if member.last_seen else None,
    }


# ==========================================
# REGISTRATION
# ==========================================
def register_member(full_name: str, phone: str, db: Session) -> dict:
    """Register a new member (pending approval)."""
    existing = db.query(Member).filter(Member.phone == phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    new_member = Member(
        full_name=full_name,
        phone=phone,
        status="Pending Approval",
        is_active=False,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {"success": True, "message": "Registration submitted. Pending admin approval."}


# ==========================================
# LOGIN
# ==========================================
def login_member(full_name: str, phone: str, db: Session) -> dict:
    """Authenticate a member and return JWT token."""
    member = (
        db.query(Member)
        .filter(Member.full_name == full_name, Member.phone == phone)
        .first()
    )
    if not member:
        raise HTTPException(status_code=401, detail="Invalid name or phone number")

    if member.status != "Approved":
        raise HTTPException(status_code=403, detail="Account not yet approved")

    today = date.today()
    existing_attendance = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == member.id,
            Attendance.date == today,
        )
        .first()
    )
    if not existing_attendance:
        db.add(Attendance(member_id=member.id, date=today, time_in=datetime.now(timezone.utc)))
        db.commit()

    from app.auth import create_member_token
    token = create_member_token(member.id)

    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "member": serialize_member(member),
    }


# ==========================================
# APPROVAL
# ==========================================
def approve_member(member_id: int, db: Session, approved_by: int = None) -> dict:
    """Approve a pending member, generating their username and member number."""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    username = generate_username(member.full_name, db)
    member.username = username
    member.status = "Approved"
    member.approved_by = approved_by
    member.approved_at = datetime.now(timezone.utc)

    year = datetime.now().year
    member.member_number = f"KWC-{year}-{member.id:06d}"

    db.commit()
    db.refresh(member)

    return {
        "success": True,
        "message": f"Member approved. Member number: {member.member_number}, Username: {username}",
        "member": serialize_member(member),
    }


# ==========================================
# ACTIVATION
# ==========================================
def activate_member(member_number: str, password: str, confirm_password: str, db: Session) -> dict:
    """Activate a member account with a password."""
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    member = db.query(Member).filter(Member.member_number == member_number).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.password_hash = hash_password(password)
    member.is_active = True
    member.profile_completed = False
    db.commit()

    return {"success": True, "message": "Account activated successfully"}


# ==========================================
# PROFILE
# ==========================================
def complete_profile(member_id: int, data, db: Session) -> dict:
    """Update member profile fields."""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if not member.is_active:
        raise HTTPException(status_code=400, detail="Account not activated yet")

    fields = [
        "gender", "date_of_birth", "email", "national_id", "occupation",
        "marital_status", "address", "emergency_contact", "emergency_phone",
        "ministry", "baptism_status", "baptism_date",
    ]
    for field in fields:
        value = getattr(data, field, None)
        if value is not None:
            setattr(member, field, value)

    member.profile_completed = True
    db.commit()

    return {"success": True, "message": "Profile updated successfully"}


# ==========================================
# DELETION
# ==========================================
def delete_member(member_id: int, current_admin, db: Session) -> dict:
    """Delete or soft-disable a member (requires super_admin role)."""
    if current_admin.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin access required")

    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    attendance_count = db.query(Attendance).filter(Attendance.member_id == member.id).count()
    if attendance_count > 0:
        member.status = "Not Approved"
        member.is_active = False
        db.commit()
        return {"success": True, "message": "Member disabled (has attendance records)"}

    db.delete(member)
    db.commit()
    return {"success": True, "message": "Member permanently deleted"}


# ==========================================
# LOGOUT
# ==========================================
def logout_member(member_id: int, db: Session) -> dict:
    """Record member logout (time_out on today's attendance)."""
    today = date.today()
    attendance = (
        db.query(Attendance)
        .filter(Attendance.member_id == member_id, Attendance.date == today)
        .first()
    )
    if attendance:
        attendance.time_out = datetime.now(timezone.utc)

    member = db.query(Member).filter(Member.id == member_id).first()
    if member:
        member.last_seen = datetime.now(timezone.utc)

    db.commit()
    return {"success": True, "message": "Logged out"}
