from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.dependencies import get_current_admin
from app.models import Admin
from app.database import SessionLocal
from app.models import Member, Attendance
from app.utils import generate_username
from app.schema import (
    MemberRegister,
    MemberActivate,
    MemberLogin,
    MemberLogout,
    MemberProfileUpdate
)

router = APIRouter(tags=["Members"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
# GET ALL MEMBERS
# ==========================================

@router.get("/members")
def get_members(
    db: Session = Depends(get_db)
):

    members = db.query(Member).all()

    return {
        "success": True,
        "total": len(members),
        "members": members
    }


# ==========================================
# GET ONE MEMBER
# ==========================================
@router.post("/member/login")
def member_login(
    data: MemberLogin,
    db: Session = Depends(get_db)
):
    print("LOGIN REQUEST")
    print(data.model_dump())

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
            time_in=datetime.utcnow()
        )

        db.add(attendance)
        db.commit()

    return {
        "success": True,
        "message": "Login successful.",
        "member_id": member.id,
        "member_number": member.member_number,
        "username": member.username,
        "full_name": member.full_name,
        "is_active": member.is_active,
        "profile_completed": member.profile_completed
    }

@router.get("/member/{member_id}")
def get_member(
    member_id: int,
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
        "member": member
    }


# ==========================================
# GET PENDING MEMBERS
# ==========================================

@router.get("/members/pending")
def pending_members(
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
        "members": members
    }


# ==========================================
# GET APPROVED MEMBERS
# ==========================================

@router.get("/members/approved")
def approved_members(
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
        "members": members
    }

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
        "members": members
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
    member.approved_at = datetime.utcnow()

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
    from datetime import datetime, date
    from app.models import Attendance

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.member_id == data.member_id,
            Attendance.attendance_date == date.today(),
            Attendance.time_out == None
        )
        .first()
    )

    if attendance:
        attendance.time_out = datetime.utcnow()

    member = (
        db.query(Member)
        .filter(Member.id == data.member_id)
        .first()
    )

    if member:
        member.last_seen = datetime.utcnow()

    db.commit()

    return {
        "success": True,
        "message": "Member logged out successfully."
    }
