import logging

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, timezone

from app.dependencies import get_current_admin, get_current_member
from app.services import storage

logger = logging.getLogger(__name__)
from app.auth import hash_password
from app.models import Admin
from app.database import get_db
from app.models import Member, Attendance
from app.utils import generate_username
from app.auth import create_member_token
from app.schema import (
    MemberRegister,
    MemberActivate,
    MemberLogin,
    MemberLogout,
    MemberProfileUpdate
)

router = APIRouter(tags=["Members"])

# ==========================================
# SERIALIZE MEMBER
# Converts a Member ORM object into a plain
# dict so FastAPI can return it as JSON
# ==========================================

def serialize_member(member: Member):
    return {
        "id": member.id,
        "member_number": member.member_number,
        "system_id": member.system_id,
        "username": member.username,
        "full_name": member.full_name,
        "phone": member.phone,
        "gender": member.gender,
        "date_of_birth": (
            member.date_of_birth.isoformat()
            if member.date_of_birth else None
        ),
        "photo": member.photo or None,
        "email": member.email,
        "national_id": member.national_id,
        "occupation": member.occupation,
        "marital_status": member.marital_status,
        "address": member.address,
        "emergency_contact": member.emergency_contact,
        "emergency_phone": member.emergency_phone,
        "ministry": member.ministry,
        "baptism_status": member.baptism_status,
        "baptism_date": (
            member.baptism_date.isoformat()
            if member.baptism_date else None
        ),
        "status": member.status,
        "is_active": member.is_active,
        "profile_completed": member.profile_completed,
        "approved_by": member.approved_by,
        "approved_at": (
            member.approved_at.isoformat()
            if member.approved_at else None
        ),
        "rejected_reason": member.rejected_reason,
        "online": member.online,
        "last_seen": (
            member.last_seen.isoformat()
            if member.last_seen else None
        ),
        "last_login": (
            member.last_login.isoformat()
            if member.last_login else None
        ),
        "created_at": (
            member.created_at.isoformat()
            if member.created_at else None
        )
    }


# ==========================================
# REGISTER MEMBER
# ==========================================

@router.post("/member/register")
def register_member(
    data: MemberRegister,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Member)
        .filter(Member.phone == data.phone)
        .first()
    )

    if existing:
        return {
            "success": False,
            "message": "Phone number already registered."
        }

    member = Member(
        full_name=data.full_name,
        phone=data.phone
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return {
        "success": True,
        "message": "Registration submitted successfully. Please wait for church approval."
    }


# ==========================================
# GET ALL MEMBERS (paginated for speed)
# ==========================================

@router.get("/members")
def get_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: str = "",
    status: str = "",
):

    query = db.query(Member)

    if search:
        query = query.filter(
            Member.full_name.ilike(f"%{search}%") |
            Member.phone.ilike(f"%{search}%") |
            Member.member_number.ilike(f"%{search}%")
        )

    if status:
        query = query.filter(Member.status == status)

    total = query.count()
    members = query.order_by(Member.id.desc()).offset(skip).limit(limit).all()

    return {
        "success": True,
        "total": total,
        "members": [serialize_member(m) for m in members]
    }


# ==========================================
# EXPORT ALL MEMBERS (CSV backup)
# One-click downloadable spreadsheet of the
# full congregation for offline backup/spreadsheets.
# ==========================================

@router.get("/members/export")
def export_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    import csv
    import io

    members = db.query(Member).order_by(Member.id.asc()).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow([
        "Member Number", "Full Name", "Phone", "Email", "Gender",
        "Date of Birth", "Ministry", "Marital Status", "Occupation",
        "National ID", "Status", "Registered On",
    ])

    for m in members:
        writer.writerow([
            m.member_number or "",
            m.full_name,
            m.phone or "",
            m.email or "",
            m.gender or "",
            m.date_of_birth.strftime("%Y-%m-%d") if m.date_of_birth else "",
            m.ministry or "",
            m.marital_status or "",
            m.occupation or "",
            m.national_id or "",
            m.status or "",
            m.created_at.strftime("%Y-%m-%d") if m.created_at else "",
        ])

    filename = f"members-{date.today().isoformat()}.csv"

    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
# ==========================================
@router.post("/member/login")
def member_login(
    data: MemberLogin,
    db: Session = Depends(get_db)
):
    logger.debug("Login attempt for: %s", data.full_name)

    member = (
        db.query(Member)
        .filter(
            Member.full_name == data.full_name,
            Member.phone == data.phone
        )
        .first()
    )

    if not member:
        return {
            "success": False,
            "message": "Invalid login details."
        }

    if member.status != "Approved":
        return {
            "success": False,
            "message": "Your account has not been approved."
        }
    # ==========================================
    # CREATE TODAY ATTENDANCE
    # ==========================================

    today = date.today()

    already_checked = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == member.id,
            Attendance.attendance_date == today
        )
        .first()
    )

    if not already_checked:

        attendance = Attendance(
            member_id=member.id,
            attendance_date=today,
            attendance_type="Client Login",
            time_in=datetime.now(timezone.utc)
        )

        db.add(attendance)
        db.commit()

    token = create_member_token(member.id)

    return {
        "success": True,
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "member_id": member.id,
        "member_number": member.member_number,
        "username": member.username,
        "full_name": member.full_name,
        "phone": member.phone,
        "gender": member.gender,
        "photo": member.photo or None,
        "is_active": member.is_active,
        "profile_completed": member.profile_completed
    }

# ==========================================
# UPLOAD OWN PROFILE PICTURE (member side)
# Every member can set their own photo; it is
# used everywhere (admin table, chat, giving).
# ==========================================

@router.put("/member/profile/photo")
async def upload_member_photo(
    image: UploadFile = File(...),
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    try:
        photo_url = storage.upload_file_object(
            image,
            "profile_photos",
            optimize_images=True,
        )
    except Exception as e:
        logger.error("Profile photo upload failed: %s", e)
        raise HTTPException(status_code=500, detail="Could not save the photo.")

    current_member.photo = photo_url
    db.commit()

    return {"success": True, "photo": photo_url}


@router.get("/member/{member_id}")
def get_member(
    member_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        return {
            "success": False,
            "message": "Member not found."
        }

    return {
        "success": True,
        "member": serialize_member(member)
    }


# ==========================================
# GET PENDING MEMBERS
# ==========================================

@router.get("/members/pending")
def pending_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    members = (
        db.query(Member)
        .filter(Member.status == "Pending Approval")
        .all()
    )

    return {
        "success": True,
        "total": len(members),
        "members": [serialize_member(m) for m in members]
    }


# ==========================================
# GET APPROVED MEMBERS
# ==========================================

@router.get("/members/approved")
def approved_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    members = (
        db.query(Member)
        .filter(Member.status == "Approved")
        .all()
    )

    return {
        "success": True,
        "total": len(members),
        "members": [serialize_member(m) for m in members]
    }


@router.get("/members/approved/count")
def approved_members_count(
    db: Session = Depends(get_db)
):
    count = db.query(Member).filter(Member.status == "Approved").count()
    return {"count": count}

@router.post("/member/activate")
def activate_member(
    data: MemberActivate,
    db: Session = Depends(get_db)
):

    member = (
        db.query(Member)
        .filter(
            Member.member_number == data.member_number
        )
        .first()
    )

    if not member:
        return {
            "success": False,
            "message": "Member not found."
        }

    if member.status != "Approved":
        return {
            "success": False,
            "message": "Member has not been approved."
        }

    if data.password != data.confirm_password:
        return {
            "success": False,
            "message": "Passwords do not match."
        }

    member.password_hash = hash_password(
        data.password
    )

    member.profile_completed = False

    member.is_active = True

    db.commit()

    return {
        "success": True,
        "message": "Account activated successfully."
    }
# ==========================================
# GET ACTIVE MEMBERS
# ==========================================

@router.get("/members/active")
def active_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    members = (
        db.query(Member)
        .filter(Member.is_active == True)
        .all()
    )

    return {
        "success": True,
        "total": len(members),
        "members": [serialize_member(m) for m in members]
    }

@router.put("/member/{member_id}/approve")
def approve_member(
    member_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        return {
            "success": False,
            "message": "Member not found."
        }

    if member.status == "Approved":
        return {
            "success": False,
            "message": "Member already approved."
        }
    year = datetime.now().year

    # Generate username
    member.username = generate_username(member.full_name, db)

    # Generate member number
    member.member_number = f"KWC-{year}-{member.id:06d}"

    # Approve member
    member.status = "Approved"
    member.approved_by = current_admin.id
    member.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(member)

    return {
        "success": True,
        "message": "Member approved successfully.",
        "username": member.username,
        "member_number": member.member_number
    }
@router.delete("/member/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):

    if current_admin.role != "super_admin":
        return {
            "success": False,
            "message": "Only Super Admin can delete members."
        }


    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )


    if not member:
        return {
            "success": False,
            "message": "Member not found"
        }


    attendance_exists = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == member_id
        )
        .first()
    )


    # HAS ATTENDANCE → remove access only
    if attendance_exists:

        member.status = "Not Approved"
        member.is_active = False

        db.commit()

        return {
            "success": True,
            "message": "Member disabled because attendance history exists."
        }


    # NO ATTENDANCE → permanent delete

    db.delete(member)

    db.commit()


    return {
        "success": True,
        "message": "Member deleted permanently."
    }

@router.put("/member/profile/{member_id}")
def complete_profile(
    member_id: int,
    data: MemberProfileUpdate,
    db: Session = Depends(get_db)
):

    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        return {
            "success": False,
            "message": "Member not found."
        }


    if not member.is_active:
        return {
            "success": False,
            "message": "Account is not active."
        }


    member.gender = data.gender
    member.date_of_birth = data.date_of_birth
    member.email = data.email
    member.national_id = data.national_id
    member.occupation = data.occupation
    member.marital_status = data.marital_status
    member.address = data.address
    member.emergency_contact = data.emergency_contact
    member.emergency_phone = data.emergency_phone
    member.ministry = data.ministry
    member.baptism_status = data.baptism_status
    member.baptism_date = data.baptism_date


    member.profile_completed = True


    db.commit()
    db.refresh(member)


    return {
        "success": True,
        "message": "Profile completed successfully."
    }

# ==========================================
# MEMBER LOGOUT
# ==========================================

@router.post("/member/logout")
def member_logout(
    data: MemberLogout,
    db: Session = Depends(get_db)
):
    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == data.member_id,
            Attendance.attendance_date == date.today(),
            Attendance.time_out.is_(None)
        )
        .first()
    )

    if attendance:
        attendance.time_out = datetime.now(timezone.utc)

    member = (
        db.query(Member)
        .filter(Member.id == data.member_id)
        .first()
    )

    if member:
        member.last_seen = datetime.now(timezone.utc)

    db.commit()

    return {
        "success": True,
        "message": "Member logged out successfully."
    }