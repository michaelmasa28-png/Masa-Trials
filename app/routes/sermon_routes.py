from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from app.database import get_db
from app.models import Sermon
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

    db: Session = Depends(get_db)

):

    thumbnail_path = None
    video_path = None
    notes_path = None


    # -------------------------
    # Thumbnail
    # -------------------------

    if thumbnail:

        filename = f"{uuid.uuid4()}_{thumbnail.filename}"

        filepath = f"public/uploads/sermons/images/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)

        thumbnail_path = f"/uploads/sermons/images/{filename}"
    # -------------------------
    # Video
    # -------------------------

    if video_file:

        allowed_extensions = (
            ".mp4",
            ".webm",
            ".ogg",
            ".mov",
            ".m4v"
        )

        filename = video_file.filename.lower()

        if not filename.endswith(allowed_extensions):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported video format. "
                    "Allowed: MP4, WEBM, OGG, MOV, M4V."
                )
            )

        filename = f"{uuid.uuid4()}_{video_file.filename}"

        filepath = f"public/uploads/sermons/videos/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)

        video_path = f"/uploads/sermons/videos/{filename}"

    # -------------------------
    # Notes PDF
    # -------------------------

    if notes:

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

        sermon_date=sermon_date,

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
def update_sermon(
    sermon_id: int,
    sermon_data: SermonCreate,
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


    sermon.title = sermon_data.title
    sermon.preacher = sermon_data.preacher
    sermon.bible_reading = sermon_data.bible_reading
    sermon.description = sermon_data.description
    sermon.sermon_date = sermon_data.sermon_date
    sermon.thumbnail = sermon_data.thumbnail
    sermon.video_file = sermon_data.video_file
    sermon.youtube_url = sermon_data.youtube_url
    sermon.notes_file = sermon_data.notes_file
    sermon.featured = sermon_data.featured


    db.commit()

    db.refresh(sermon)


    return sermon



# ==========================================
# DELETE SERMON
# ==========================================

@router.delete("/{sermon_id}")
def delete_sermon(
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


    db.delete(sermon)

    db.commit()


    return {
        "success": True,
        "message": "Sermon deleted"
    }

