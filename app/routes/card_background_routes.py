import os
import shutil
import uuid
import time

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import CardBackground, Admin

router = APIRouter(
    prefix="/api/card-backgrounds",
    tags=["Card Backgrounds"]
)

UPLOAD_DIR = "public/uploads/cards"

VALID_CARD_KEYS = [
    "sermons",
    "notice",
    "connect",
    "sunday-live",
    "offerings",
    "contact",
]

# In-memory cache (refreshes every 60s)
_bg_cache = {"data": None, "ts": 0}
_BG_CACHE_TTL = 60


# ==========================================================
# GET ALL CARD BACKGROUNDS (public - no auth required)
# ==========================================================

@router.get("")
def get_card_backgrounds(db: Session = Depends(get_db)):

    now = time.time()
    if _bg_cache["data"] is not None and now - _bg_cache["ts"] < _BG_CACHE_TTL:
        return _bg_cache["data"]

    rows = db.query(CardBackground).all()

    backgrounds = []

    for row in rows:
        backgrounds.append({
            "card_key": row.card_key,
            "image_url": row.image_url,
            "updated_at": row.updated_at,
        })

    result = {"backgrounds": backgrounds}
    _bg_cache["data"] = result
    _bg_cache["ts"] = now
    return result


# ==========================================================
# UPLOAD / UPDATE CARD BACKGROUND (admin only)
# ==========================================================

@router.post("/{card_key}")
async def upload_card_background(
    card_key: str,
    image: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    if card_key not in VALID_CARD_KEYS:
        return {
            "success": False,
            "message": f"Invalid card key. Valid keys: {', '.join(VALID_CARD_KEYS)}"
        }

    # Save new image
    ext = os.path.splitext(image.filename or "")[1] or ".jpg"
    filename = f"{card_key}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_url = f"/uploads/cards/{filename}"

    # Delete old image if exists
    existing = db.query(CardBackground).filter(
        CardBackground.card_key == card_key
    ).first()

    if existing:
        # Remove old file from disk
        if existing.image_url:
            old_path = os.path.join("public", existing.image_url.lstrip("/"))
            if os.path.exists(old_path):
                os.remove(old_path)
        existing.image_url = image_url
        existing.updated_by = current_admin.id
    else:
        new_bg = CardBackground(
            card_key=card_key,
            image_url=image_url,
            updated_by=current_admin.id,
        )
        db.add(new_bg)

    db.commit()
    _bg_cache["data"] = None  # invalidate cache

    return {
        "success": True,
        "message": f"Background for '{card_key}' updated.",
        "card_key": card_key,
        "image_url": image_url,
    }


# ==========================================================
# DELETE CARD BACKGROUND (admin only)
# ==========================================================

@router.delete("/{card_key}")
def delete_card_background(
    card_key: str,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    existing = db.query(CardBackground).filter(
        CardBackground.card_key == card_key
    ).first()

    if not existing:
        return {
            "success": False,
            "message": "No background found for this card."
        }

    # Remove file from disk
    if existing.image_url:
        old_path = os.path.join("public", existing.image_url.lstrip("/"))
        if os.path.exists(old_path):
            os.remove(old_path)

    db.delete(existing)
    db.commit()
    _bg_cache["data"] = None  # invalidate cache

    return {
        "success": True,
        "message": f"Background for '{card_key}' removed."
    }
