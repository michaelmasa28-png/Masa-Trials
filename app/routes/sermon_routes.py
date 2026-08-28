import os
import shutil
import uuid
from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Sermon, Admin
from app.utils import (
    validate_upload,
    MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, MAX_PDF_SIZE,
    ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_PDF_TYPES,
)
from app.schema import SermonCreate, SermonResponse


router = APIRouter(
    prefix="/api/sermons",
    tags=["Sermons"]
)



# ==========================================
# GET ALL SERMONS
# ==========================================

@router.get("/", response_model=list[SermonResponse])
def get_sermons(
    db: Session = Depends(get_db)
):

    sermons = db.query(Sermon)\
        .order_by(
            Sermon.created_at.desc()
        )\
        .all()

    return sermons



# ==========================================
# GET SINGLE SERMON
# ==========================================

@router.get("/{sermon_id}", response_model=SermonResponse)
def get_sermon(
    sermon_id: int,
    db: Session = Depends(get_db)
):

    sermon = db.query(Sermon).filter(
        Sermon.id == sermon_id
    ).first()


    if not sermon:

        raise HTTPException(
            status_code=404,
            detail="Sermon not found"
        )


    return sermon

# ==========================================
# CREATE SERMON
# ==========================================

@router.post("/", response_model=SermonResponse)
async def create_sermon(

    title: str = Form(...),

    preacher: str = Form(...),

    bible_reading: str = Form(None),

    description: str = Form(None),

    sermon_date: str = Form(None),

    youtube_url: str = Form(None),

    featured: bool = Form(False),

    thumbnail: UploadFile = File(None),

    video_file: UploadFile = File(None),

    notes: UploadFile = File(None),

    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)

):

    thumbnail_path = None
    video_path = None
    notes_path = None

    sermon_date_parsed = None
    if sermon_date:
        sermon_date_parsed = date.fromisoformat(sermon_date)

    if thumbnail:
        await validate_upload(thumbnail, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, "Thumbnail")

        filename = f"{uuid.uuid4()}_{thumbnail.filename}"

        filepath = f"public/uploads/sermons/images/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)

        thumbnail_path = f"/uploads/sermons/images/{filename}"
    # -------------------------
    # Video
    # -------------------------

    if video_file:
        await validate_upload(video_file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES, "Video")

        filename = f"{uuid.uuid4()}_{video_file.filename}"

        filepath = f"public/uploads/sermons/videos/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)

        video_path = f"/uploads/sermons/videos/{filename}"

    # -------------------------
    # Notes PDF
    # -------------------------

    if notes:
        await validate_upload(notes, MAX_PDF_SIZE, ALLOWED_PDF_TYPES, "Notes")

        filename = f"{uuid.uuid4()}_{notes.filename}"

        filepath = f"public/uploads/sermons/notes/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(notes.file, buffer)

        notes_path = f"/uploads/sermons/notes/{filename}"


    new_sermon = Sermon(

        title=title,

        preacher=preacher,

        bible_reading=bible_reading,

        description=description,

        sermon_date=sermon_date_parsed,

        thumbnail=thumbnail_path,

        video_file=video_path,

        youtube_url=youtube_url,

        notes_file=notes_path,

        featured=featured

    )


    db.add(new_sermon)

    db.commit()

    db.refresh(new_sermon)


    return new_sermon
# ==========================================
# UPDATE SERMON
# ==========================================

@router.put("/{sermon_id}", response_model=SermonResponse)
async def update_sermon(
    sermon_id: int,
    title: str = Form(...),
    preacher: str = Form(...),
    bible_reading: str = Form(None),
    description: str = Form(None),
    sermon_date: str = Form(None),
    youtube_url: str = Form(None),
    featured: bool = Form(False),
    thumbnail: UploadFile = File(None),
    video_file: UploadFile = File(None),
    notes: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):

    sermon = db.query(Sermon).filter(
        Sermon.id == sermon_id
    ).first()


    if not sermon:

        raise HTTPException(
            status_code=404,
            detail="Sermon not found"
        )

    sermon.title = title
    sermon.preacher = preacher
    sermon.bible_reading = bible_reading
    sermon.description = description
    sermon.youtube_url = youtube_url
    sermon.featured = featured

    if sermon_date:
        sermon.sermon_date = date.fromisoformat(sermon_date)

    # -------------------------
    # Thumbnail
    # -------------------------
    if thumbnail and thumbnail.filename:
        await validate_upload(thumbnail, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, "Thumbnail")
        filename = f"{uuid.uuid4()}_{thumbnail.filename}"
        filepath = f"public/uploads/sermons/images/{filename}"
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)
        sermon.thumbnail = f"/uploads/sermons/images/{filename}"

    # -------------------------
    # Video
    # -------------------------
    if video_file and video_file.filename:
        await validate_upload(video_file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES, "Video")
        filename = f"{uuid.uuid4()}_{video_file.filename}"
        filepath = f"public/uploads/sermons/videos/{filename}"
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        sermon.video_file = f"/uploads/sermons/videos/{filename}"

    # -------------------------
    # Notes PDF
    # -------------------------
    if notes and notes.filename:
        await validate_upload(notes, MAX_PDF_SIZE, ALLOWED_PDF_TYPES, "Notes")
        filename = f"{uuid.uuid4()}_{notes.filename}"
        filepath = f"public/uploads/sermons/notes/{filename}"
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(notes.file, buffer)
        sermon.notes_file = f"/uploads/sermons/notes/{filename}"


    db.commit()

    db.refresh(sermon)


    return sermon



# ==========================================
# DELETE SERMON
# ==========================================

@router.delete("/{sermon_id}")
def delete_sermon(
    sermon_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):

    sermon = db.query(Sermon).filter(
        Sermon.id == sermon_id
    ).first()


    if not sermon:

        raise HTTPException(
            status_code=404,
            detail="Sermon not found"
        )


    db.delete(sermon)

    db.commit()


    return {
        "success": True,
        "message": "Sermon deleted"
    }

