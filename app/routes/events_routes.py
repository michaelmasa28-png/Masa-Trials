# ============================================
# EVENTS ROUTES
# Kingdom Ways Church CMS
# ============================================

import os
from datetime import date, time, datetime
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Form,
    File,
    UploadFile,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Event, Admin
from app.schema import (
    EventResponse,
    EventListResponse
)
from app.services import storage
from app.cache import make_ttl_cache

_cache = make_ttl_cache(ttl=30)

router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)


# ============================================
# ROUTER TEST
# ============================================

@router.get("/test")
def events_test():
    return {
        "success": True,
        "message": "Events route working"
    }


# ============================================
# GET ALL EVENTS
# ============================================

@router.get("/", response_model=EventListResponse)
def get_events(
    db: Session = Depends(get_db)
):

    cached = _cache.get("events:list")
    if cached is not None:
        return cached

    events = (
        db.query(Event)
        .order_by(Event.created_at.desc())
        .all()
    )

    result = {
        "success": True,
        "message": "Events retrieved successfully",
        "events": events
    }

    _cache.set("events:list", result)
    return result


# ============================================
# CREATE EVENT
# ============================================

@router.post("/", response_model=EventResponse)
def create_event(

    title: str = Form(...),
    subtitle: Optional[str] = Form(None),
    description: str = Form(...),
    category: Optional[str] = Form(None),
    speaker: Optional[str] = Form(None),
    host: Optional[str] = Form(None),
    bible_reading: Optional[str] = Form(None),

    start_date: str = Form(...),
    end_date: Optional[str] = Form(None),
    start_time: Optional[str] = Form(None),
    end_time: Optional[str] = Form(None),

    venue: str = Form(...),
    maps_link: Optional[str] = Form(None),

    capacity: Optional[int] = Form(None),
    registration_required: bool = Form(False),
    registration_deadline: Optional[str] = Form(None),

    featured: bool = Form(False),
    public_event: bool = Form(True),
    allow_comments: bool = Form(False),
    send_notification: bool = Form(False),

    status: str = Form("draft"),

    banner: UploadFile = File(None),
    attachment: UploadFile = File(None),

    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)

):

    upload_folder = "public/uploads/events"
    os.makedirs(upload_folder, exist_ok=True)

    banner_path = None
    attachment_path = None

    if banner:
        banner_path = storage.upload_file_object(
            banner,
            "uploads/events",
            optimize_images=True,
        ).lstrip("/")

    if attachment:
        attachment_path = storage.upload_file_object(
            attachment,
            "uploads/events",
        ).lstrip("/")

    new_event = Event(

        title=title,
        subtitle=subtitle,
        description=description,
        category=category,
        speaker=speaker,
        host=host,
        bible_reading=bible_reading,

        start_date=date.fromisoformat(start_date),

        end_date=(
            date.fromisoformat(end_date)
            if end_date else None
        ),

        start_time=(
            time.fromisoformat(start_time)
            if start_time else None
        ),

        end_time=(
            time.fromisoformat(end_time)
            if end_time else None
        ),

        venue=venue,
        maps_link=maps_link,

        capacity=capacity,
        registration_required=registration_required,

        registration_deadline=(
            datetime.fromisoformat(registration_deadline)
            if registration_deadline else None
        ),

        featured=featured,
        public_event=public_event,
        allow_comments=allow_comments,
        send_notification=send_notification,

        status=status,

        banner=banner_path,
        attachment=attachment_path,

        created_by=current_admin.id

    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    _cache.invalidate("events:list")

    return new_event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,

    title: str = Form(...),
    subtitle: str = Form(None),
    description: str = Form(...),
    category: str = Form(None),

    speaker: str = Form(None),
    host: str = Form(None),
    bible_reading: str = Form(None),

    start_date: str = Form(...),
    end_date: str = Form(None),

    start_time: str = Form(None),
    end_time: str = Form(None),

    venue: str = Form(...),
    maps_link: str = Form(None),

    capacity: int = Form(None),

    registration_required: bool = Form(False),
    registration_deadline: str = Form(None),

    featured: bool = Form(False),
    public_event: bool = Form(True),
    allow_comments: bool = Form(False),
    send_notification: bool = Form(False),

    status: str = Form("draft"),

    banner: UploadFile = File(None),
    attachment: UploadFile = File(None),

    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):


    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )


    if not event:

        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )


    event.title = title
    event.subtitle = subtitle
    event.description = description
    event.category = category

    event.speaker = speaker
    event.host = host
    event.bible_reading = bible_reading

    event.venue = venue
    event.maps_link = maps_link

    event.capacity = capacity

    event.registration_required = registration_required

    event.featured = featured
    event.public_event = public_event
    event.allow_comments = allow_comments
    event.send_notification = send_notification

    event.status = status


    if start_date:
        event.start_date = datetime.strptime(
            start_date,
            "%Y-%m-%d"
        ).date()


    if end_date:
        event.end_date = datetime.strptime(
            end_date,
            "%Y-%m-%d"
        ).date()


    if banner:
        upload_folder = "public/uploads/events"
        os.makedirs(upload_folder, exist_ok=True)
        event.banner = storage.upload_file_object(
            banner,
            "uploads/events",
            optimize_images=True,
        ).lstrip("/")


    if attachment:
        upload_folder = "public/uploads/events"
        os.makedirs(upload_folder, exist_ok=True)
        event.attachment = storage.upload_file_object(
            attachment,
            "uploads/events",
        ).lstrip("/")



    db.commit()
    db.refresh(event)

    _cache.invalidate("events:list")

    return event

@router.delete("/{event_id}")
def delete_event(
    event_id: int,

    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):


    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )


    if not event:

        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )


    # Remove stored media files
    if event.banner:
        storage.delete_upload(event.banner)
    if event.attachment:
        storage.delete_upload(event.attachment)


    db.delete(event)

    db.commit()

    _cache.invalidate("events:list")

    return {
        "success": True,
        "message": "Event deleted successfully"
    }

