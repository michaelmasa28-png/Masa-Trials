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
from app.models import Gallery
from app.schema import GalleryResponse

import os
import shutil
import uuid
from datetime import date


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
def upload_gallery_image(

    title: str = Form(...),

    description: str = Form(None),

    category: str = Form(None),

    event_date: date = Form(None),

    image: UploadFile = File(...),

    db: Session = Depends(get_db)

):

    # ======================================
    # DEBUG
    # ======================================

    print("===== GALLERY UPLOAD =====")
    print("TITLE:", title)
    print("IMAGE:", image.filename)

    extension = os.path.splitext(
        image.filename
    )[1]

    filename = (
        str(uuid.uuid4()) +
        extension
    )

    filepath = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(filepath, "wb") as buffer:

        shutil.copyfileobj(
            image.file,
            buffer
        )

    gallery = Gallery(

        title=title,

        description=description,

        category=category,

        event_date=event_date,

        image=f"/uploads/gallery/{filename}"

    )

    db.add(gallery)

    db.commit()

    db.refresh(gallery)

    print("IMAGE SAVED:", gallery.image)
    print("DATABASE ID:", gallery.id)
    print("==========================")

    return gallery

from fastapi import HTTPException
import os

@router.delete("/{id}")
def delete_gallery(id: int, db: Session = Depends(get_db)):
    image = db.query(Gallery).filter(Gallery.id == id).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Delete image file from disk
    if image.image:
        file_path = image.image.replace("/uploads/", "app/uploads/")
        if os.path.exists(file_path):
            os.remove(file_path)

    # Delete database record
    db.delete(image)
    db.commit()

    return {
        "success": True,
        "message": "Image deleted successfully."
    }


