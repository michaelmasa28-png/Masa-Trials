import logging
import os
from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Gallery, Admin
from app.utils import validate_upload, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES
from app.schema import GalleryResponse
from app.services import storage

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/gallery",
    tags=["Gallery"]
)


UPLOAD_DIR = "public/uploads/gallery"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ==========================================
# GET ALL GALLERY IMAGES
# ==========================================

@router.get(
    "/",
    response_model=list[GalleryResponse]
)
def get_gallery(
    db: Session = Depends(get_db)
):

    return (
        db.query(Gallery)
        .order_by(Gallery.created_at.desc())
        .all()
    )


# ==========================================
# UPLOAD IMAGE
# ==========================================

@router.post(
    "/",
    response_model=GalleryResponse
)
async def upload_gallery_image(

    title: str = Form(...),

    description: str = Form(None),

    category: str = Form(None),

    event_date: date = Form(None),

    image: UploadFile = File(...),

    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)

):

    logger.info("Gallery upload: title=%s, image=%s", title, image.filename)

    await validate_upload(image, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, "Image")

    image_url = storage.upload_file_object(
        image,
        "uploads/gallery",
        optimize_images=True,
    )

    gallery = Gallery(

        title=title,

        description=description,

        category=category,

        event_date=event_date,

        image=image_url

    )

    db.add(gallery)

    db.commit()

    db.refresh(gallery)

    logger.info("Gallery saved: id=%s, path=%s", gallery.id, gallery.image)

    return gallery



@router.delete("/{id}")
def delete_gallery(id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    image = db.query(Gallery).filter(Gallery.id == id).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Delete image file from storage (local and/or R2)
    if image.image:
        storage.delete_upload(image.image)

    # Delete database record
    db.delete(image)
    db.commit()

    return {
        "success": True,
        "message": "Image deleted successfully."
    }


