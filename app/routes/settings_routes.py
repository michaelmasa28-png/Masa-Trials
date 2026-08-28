from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Admin, Member, ChurchContact, GivingAccount
from app.config import SECRET_KEY

router = APIRouter(prefix="/api", tags=["Settings"])


class PortalLoginRequest(BaseModel):
    secure_key: str


class ThemeUpdate(BaseModel):
    theme: str


class VisionUpdate(BaseModel):
    vision: str


class ContactUpdate(BaseModel):
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    maps_link: Optional[str] = None
    office_hours: Optional[str] = None


class GivingAccountCreate(BaseModel):
    name: str
    account_type: str          # "paybill" | "phone"
    number: str
    account_name: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class GivingAccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    number: Optional[str] = None
    account_name: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


# ==========================================
# In-memory store for theme/vision
# (persist to DB if you add a ChurchSettings model)
# ==========================================
_theme_text = "Kingdom Ways Church — A place of worship, fellowship, and spiritual growth."
_vision_text = "To be a Christ-centered community that transforms lives through worship, discipleship, and service."


@router.get("/current-user")
def get_current_user(
    current_admin: Admin = Depends(get_current_admin),
):
    return {
        "name": current_admin.full_name,
        "role": current_admin.role,
    }


@router.get("/settings/profile")
def get_settings_profile(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return {
        "organization_name": "Kingdom Ways Church",
        "currency_symbol": "KES",
    }


@router.get("/settings/notifications")
def get_settings_notifications(
    current_admin: Admin = Depends(get_current_admin),
):
    return {
        "email_registrations": True,
        "email_offerings": True,
        "sms_urgent": False,
    }


@router.get("/settings/users")
def get_settings_users(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    admins = db.query(Admin).all()
    return [
        {
            "id": a.id,
            "full_name": a.full_name,
            "username": a.username,
            "role": a.role,
            "status": a.status,
        }
        for a in admins
    ]


@router.get("/theme")
def get_theme():
    return {"theme": _theme_text}


@router.put("/theme")
def update_theme(
    data: ThemeUpdate,
    current_admin: Admin = Depends(get_current_admin),
):
    global _theme_text
    _theme_text = data.theme
    return {"success": True, "message": "Theme updated.", "theme": _theme_text}


@router.get("/vision")
def get_vision():
    return {"vision": _vision_text}


@router.put("/vision")
def update_vision(
    data: VisionUpdate,
    current_admin: Admin = Depends(get_current_admin),
):
    global _vision_text
    _vision_text = data.vision
    return {"success": True, "message": "Vision updated.", "vision": _vision_text}


@router.get("/members/{member_number}/presence")
def get_member_presence(member_number: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.member_number == member_number).first()
    if not member:
        return {"success": False, "online": False, "last_seen": None}
    return {
        "success": True,
        "online": member.is_active,
        "last_seen": member.last_seen.isoformat() if member.last_seen else None,
    }


@router.post("/login")
def portal_login(data: PortalLoginRequest):
    """Simple portal key authentication — checks against SECRET_KEY."""
    if data.secure_key and data.secure_key == SECRET_KEY:
        return {"authenticated": True, "redirect": "dashboard.html"}

    return {"authenticated": False}


@router.get("/church/contact")
def get_church_contact(db: Session = Depends(get_db)):
    """Public church contact info — no auth required."""
    contact = db.query(ChurchContact).first()
    if not contact:
        return {
            "phone": None, "whatsapp": None, "facebook": None,
            "instagram": None, "youtube": None, "website": None,
            "email": None, "maps_link": None, "office_hours": None,
        }
    return {
        "phone": contact.phone,
        "whatsapp": contact.whatsapp,
        "facebook": contact.facebook,
        "instagram": contact.instagram,
        "youtube": contact.youtube,
        "website": contact.website,
        "email": contact.email,
        "maps_link": contact.maps_link,
        "office_hours": contact.office_hours,
    }


@router.put("/church/contact")
def update_church_contact(
    data: ContactUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update church contact info — admin only."""
    contact = db.query(ChurchContact).first()
    if not contact:
        contact = ChurchContact()
        db.add(contact)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)

    db.commit()
    return {"success": True, "message": "Contact details updated."}


# ==========================================
# GIVING ACCOUNTS  (admin management)
# ==========================================

def _giving_account_dict(a: GivingAccount) -> dict:
    return {
        "id": a.id,
        "name": a.name,
        "account_type": a.account_type,
        "number": a.number,
        "account_name": a.account_name,
        "is_active": a.is_active,
        "sort_order": a.sort_order,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/settings/giving-accounts")
def list_giving_accounts(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    accounts = (
        db.query(GivingAccount)
        .order_by(GivingAccount.sort_order.asc(), GivingAccount.id.asc())
        .all()
    )
    return {
        "success": True,
        "accounts": [_giving_account_dict(a) for a in accounts],
    }


@router.post("/settings/giving-accounts")
def create_giving_account(
    data: GivingAccountCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    data.account_type = (data.account_type or "").strip().lower()
    if data.account_type not in ("paybill", "phone"):
        raise HTTPException(status_code=400, detail="account_type must be 'paybill' or 'phone'.")

    if not data.name.strip() or not data.number.strip():
        raise HTTPException(status_code=400, detail="Name and number are required.")

    account = GivingAccount(
        name=data.name.strip(),
        account_type=data.account_type,
        number=data.number.strip(),
        account_name=(data.account_name or "").strip() or None,
        is_active=data.is_active,
        sort_order=data.sort_order,
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    return {"success": True, "account": _giving_account_dict(account)}


@router.put("/settings/giving-accounts/{account_id}")
def update_giving_account(
    account_id: int,
    data: GivingAccountUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    account = db.query(GivingAccount).filter(GivingAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Giving account not found.")

    payload = data.model_dump(exclude_unset=True)

    if "account_type" in payload and payload["account_type"] is not None:
        at = payload["account_type"].strip().lower()
        if at not in ("paybill", "phone"):
            raise HTTPException(status_code=400, detail="account_type must be 'paybill' or 'phone'.")
        payload["account_type"] = at

    for field, value in payload.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)

    return {"success": True, "account": _giving_account_dict(account)}


@router.delete("/settings/giving-accounts/{account_id}")
def delete_giving_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    account = db.query(GivingAccount).filter(GivingAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Giving account not found.")

    db.delete(account)
    db.commit()

    return {"success": True, "message": "Giving account deleted."}


# ==========================================
# GIVING ACCOUNTS  (public — used by the giving page)
# ==========================================

@router.get("/giving-accounts")
def public_giving_accounts(db: Session = Depends(get_db)):
    accounts = (
        db.query(GivingAccount)
        .filter(GivingAccount.is_active == True)  # noqa: E712
        .order_by(GivingAccount.sort_order.asc(), GivingAccount.id.asc())
        .all()
    )
    return {
        "success": True,
        "accounts": [_giving_account_dict(a) for a in accounts],
    }
