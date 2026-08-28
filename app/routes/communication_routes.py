import os
import shutil
import uuid
from datetime import datetime, date, timezone

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import (
    Admin, Member, CommunicationLog, MemberNotification,
    ChurchContact, ScannedContact,
)
from app.schema import (
    SMSSendRequest,
    InternalSendRequest,
    ChurchContactUpdate,
    ScannedContactUpdate,
)
from app.sms_provider import send_sms_bulk
from app.ocr_utils import process_scanned_image
from app.utils import generate_username

SCAN_UPLOAD_DIR = "uploads/book_scans"
os.makedirs(SCAN_UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/communication", tags=["Communication"])

# ==========================================================
# GET MEMBERS
# ==========================================================

@router.get("/members")
def get_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    members = db.query(Member).order_by(Member.full_name).all()

    return {
        "members": [
            {
                "id": m.id,
                "full_name": m.full_name,
                "member_number": m.member_number,
                "phone": m.phone,
                "photo": None,
                "online": bool(m.online),
            }
            for m in members
        ]
    }


# ==========================================================
# SMS BROADCAST
# Sends one message to explicit member ids, OR to every
# phone number in the members table when send_to_all=True
# ==========================================================

@router.post("/sms/send")
def send_sms(
    data: SMSSendRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if data.send_to_all:
        target_members = db.query(Member).all()
    else:
        target_members = (
            db.query(Member)
            .filter(Member.id.in_(data.members))
            .all()
        )

    phone_numbers = [m.phone for m in target_members if m.phone]

    if not phone_numbers:
        return {
            "success": False,
            "message": "No valid phone numbers found for the selected recipients."
        }

    result = send_sms_bulk(phone_numbers, data.message)

    log = CommunicationLog(
        type="sms",
        category=data.category,
        message=data.message,
        recipient_count=len(phone_numbers),
        sent_count=result.get("sent", 0),
        failed_count=result.get("failed", 0),
        status="Delivered" if result.get("success") else "Failed",
        admin_id=current_admin.id
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "success": result.get("success", False),
        "message": f"SMS sent to {result.get('sent', 0)} of {len(phone_numbers)} numbers.",
        "recipient_count": len(phone_numbers),
        "sent": result.get("sent", 0),
        "failed": result.get("failed", 0)
    }


# ==========================================================
# INTERNAL / NOTIFICATION BROADCAST
# Writes one MemberNotification row per recipient so it can
# show up in-app for the member ("Notify on Login")
# ==========================================================

@router.post("/internal/send")
def send_internal_message(
    data: InternalSendRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if data.send_to_all:
        target_members = db.query(Member).all()
    else:
        target_members = (
            db.query(Member)
            .filter(Member.id.in_(data.members))
            .all()
        )

    if not target_members:
        return {
            "success": False,
            "message": "No recipients found for this message."
        }

    log = CommunicationLog(
        type="internal",
        category=data.priority,
        subject=data.subject,
        message=data.message,
        recipient_count=len(target_members),
        sent_count=len(target_members),
        failed_count=0,
        status="Delivered",
        admin_id=current_admin.id
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    for member in target_members:
        db.add(
            MemberNotification(
                member_id=member.id,
                communication_log_id=log.id,
                subject=data.subject,
                message=data.message,
                priority=data.priority
            )
        )
    db.commit()

    return {
        "success": True,
        "message": f"Message sent to {len(target_members)} members.",
        "recipient_count": len(target_members),
        "sent": len(target_members),
        "failed": 0
    }


# ==========================================================
# HISTORY
# ==========================================================

@router.get("/history")
def get_history(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = (
        db.query(CommunicationLog)
        .order_by(CommunicationLog.created_at.desc())
        .limit(200)
        .all()
    )

    return {
        "history": [
            {
                "id": log.id,
                "type": log.type,
                "category": log.category,
                "subject": log.subject,
                "message": log.message,
                "recipient_count": log.recipient_count,
                "status": log.status,
                "administrator": log.admin.full_name if log.admin else "System",
                "created_at": log.created_at
            }
            for log in logs
        ]
    }


@router.get("/history/export")
def export_history(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    import csv
    import io
    from fastapi.responses import StreamingResponse

    logs = (
        db.query(CommunicationLog)
        .order_by(CommunicationLog.created_at.desc())
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Date", "Type", "Recipients", "Category", "Status", "Administrator"])

    for log in logs:
        writer.writerow([
            log.created_at,
            log.type,
            log.recipient_count,
            log.category or "",
            log.status,
            log.admin.full_name if log.admin else "System"
        ])

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=communication_history.csv"}
    )


# ==========================================================
# STATISTICS
# ==========================================================

@router.get("/statistics")
def get_statistics(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_members = db.query(Member).count()

    today = date.today()
    sms_today = (
        db.query(CommunicationLog)
        .filter(
            CommunicationLog.type == "sms",
            CommunicationLog.created_at >= datetime(today.year, today.month, today.day)
        )
        .count()
    )

    internal_messages = (
        db.query(CommunicationLog)
        .filter(CommunicationLog.type == "internal")
        .count()
    )

    pending_delivery = (
        db.query(CommunicationLog)
        .filter(CommunicationLog.status == "Pending")
        .count()
    )

    return {
        "total_members": total_members,
        "sms_today": sms_today,
        "internal_messages": internal_messages,
        "pending_delivery": pending_delivery
    }


# ==========================================================
# DELIVERY STATUS (polling)
# ==========================================================

@router.get("/delivery-status")
def delivery_status(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Everything currently sends synchronously via the stub,
    # so there's nothing async to report yet. Once a real
    # gateway with delivery callbacks is wired in, flip this
    # to check for logs that changed status since last poll.
    return {"updated": False}


# ==========================================================
# NOTIFICATIONS (admin bell icon)
# ==========================================================

@router.get("/notifications")
def get_notifications(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return {"unread": []}


# ==========================================================
# CHURCH CONTACTS
# ==========================================================

@router.get("/contacts")
def get_contacts(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    contact = db.query(ChurchContact).first()

    if not contact:
        return {
            "phone": None, "whatsapp": None, "facebook": None,
            "instagram": None, "youtube": None, "website": None,
            "email": None, "maps_link": None, "office_hours": None,
            "updated_at": None
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
        "updated_at": contact.updated_at
    }


@router.post("/contacts")
def update_contacts(
    data: ChurchContactUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    contact = db.query(ChurchContact).first()

    if not contact:
        contact = ChurchContact()
        db.add(contact)

    for field, value in data.dict(exclude_unset=True).items():
        setattr(contact, field, value)

    contact.updated_by = current_admin.id

    db.commit()
    db.refresh(contact)

    return {
        "success": True,
        "message": "Church contacts updated successfully."
    }


# ==========================================================
# BOOK SCAN - upload photos, OCR them, queue candidates for review
# Nothing is written to the members table here - see
# /scan-review/{id}/approve for that step.
# ==========================================================

@router.post("/scan-book")
async def scan_book(
    files: list[UploadFile] = File(...),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    extracted_entries = []
    skipped_existing = 0

    for upload in files:
        ext = os.path.splitext(upload.filename or "")[1] or ".jpg"
        saved_name = f"{uuid.uuid4().hex}{ext}"
        saved_path = os.path.join(SCAN_UPLOAD_DIR, saved_name)

        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)

        try:
            candidates = process_scanned_image(saved_path, source_file=saved_name)
        except Exception as e:
            return {
                "success": False,
                "message": f"OCR failed on {upload.filename}: {e}. "
                            f"Check that Tesseract is installed (see ocr_utils.py header)."
            }

        for candidate in candidates:
            # Skip anything that matches an existing member's phone -
            # no point queuing a duplicate for review
            if candidate["phone"]:
                existing = (
                    db.query(Member)
                    .filter(Member.phone == candidate["phone"])
                    .first()
                )
                if existing:
                    skipped_existing += 1
                    continue

            entry = ScannedContact(
                full_name=candidate["full_name"],
                phone=candidate["phone"],
                ministry=candidate["ministry"],
                raw_line=candidate["raw_line"],
                source_file=candidate["source_file"],
                confidence=candidate["confidence"],
                status="Pending",
                created_by=current_admin.id
            )
            db.add(entry)
            extracted_entries.append(entry)

    db.commit()
    for entry in extracted_entries:
        db.refresh(entry)

    message = f"Extracted {len(extracted_entries)} candidate contact(s) for review."
    if skipped_existing:
        message += f" Skipped {skipped_existing} already in the members table."

    return {
        "success": True,
        "message": message,
        "extracted": [
            {
                "id": e.id,
                "full_name": e.full_name,
                "phone": e.phone,
                "ministry": e.ministry,
                "raw_line": e.raw_line,
                "confidence": e.confidence,
                "status": e.status,
            }
            for e in extracted_entries
        ]
    }


# ==========================================================
# SCAN REVIEW QUEUE
# ==========================================================

@router.get("/scan-review")
def list_scan_review(
    status: str = "Pending",
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    rows = (
        db.query(ScannedContact)
        .filter(ScannedContact.status == status)
        .order_by(ScannedContact.created_at.desc())
        .all()
    )
    return {
        "contacts": [
            {
                "id": r.id,
                "full_name": r.full_name,
                "phone": r.phone,
                "ministry": r.ministry,
                "raw_line": r.raw_line,
                "confidence": r.confidence,
                "status": r.status,
            }
            for r in rows
        ]
    }


@router.patch("/scan-review/{contact_id}")
def edit_scan_review(
    contact_id: int,
    data: ScannedContactUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    entry = db.query(ScannedContact).filter(ScannedContact.id == contact_id).first()
    if not entry:
        return {"success": False, "message": "Entry not found."}

    for field, value in data.dict(exclude_unset=True).items():
        setattr(entry, field, value)

    db.commit()
    return {"success": True}


@router.post("/scan-review/{contact_id}/approve")
def approve_scan_review(
    contact_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    entry = db.query(ScannedContact).filter(ScannedContact.id == contact_id).first()
    if not entry:
        return {"success": False, "message": "Entry not found."}

    if not entry.full_name or not entry.phone:
        return {
            "success": False,
            "message": "Name and phone are both required - edit the entry before approving."
        }

    existing = db.query(Member).filter(Member.phone == entry.phone).first()
    if existing:
        entry.status = "Duplicate"
        db.commit()
        return {"success": False, "message": "A member with this phone number already exists."}

    new_member = Member(
        full_name=entry.full_name,
        username=generate_username(entry.full_name, db),
        phone=entry.phone,
        ministry=entry.ministry,
        status="Approved",
        is_active=True,
        profile_completed=False,
        approved_by=current_admin.id,
        approved_at=datetime.now(timezone.utc)
    )
    db.add(new_member)

    entry.status = "Approved"
    entry.reviewed_by = current_admin.id
    entry.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(new_member)

    return {
        "success": True,
        "message": f"{new_member.full_name} added to members.",
        "member_id": new_member.id
    }


@router.post("/scan-review/{contact_id}/reject")
def reject_scan_review(
    contact_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    entry = db.query(ScannedContact).filter(ScannedContact.id == contact_id).first()
    if not entry:
        return {"success": False, "message": "Entry not found."}

    entry.status = "Rejected"
    entry.reviewed_by = current_admin.id
    entry.reviewed_at = datetime.now(timezone.utc)
    db.commit()

    return {"success": True}