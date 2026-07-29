from pydantic import BaseModel
from datetime import datetime
from typing import Optional
class AdminLogin(BaseModel):
    username: str
    password: str
class AdminCreate(BaseModel):

    full_name: str

    username: str

    email: str

    phone: str | None = None

    password: str

    role: str = "admin"

    permissions: list[int] = []

class MemberRegister(BaseModel):
    full_name: str
    phone: str

from pydantic import BaseModel
from datetime import datetime
class MemberActivate(BaseModel):
    member_number: str
    password: str
    confirm_password: str

class MemberLogin(BaseModel):
    full_name: str
    phone: str

class MemberProfileUpdate(BaseModel):
    gender: str | None = None
    date_of_birth: datetime | None = None
    email: str | None = None
    national_id: str | None = None
    occupation: str | None = None
    marital_status: str | None = None
    address: str | None = None
    emergency_contact: str | None = None
    emergency_phone: str | None = None
    ministry: str | None = None
    baptism_status: bool | None = False
    baptism_date: datetime | None = None

# ==========================================
# SERMON SCHEMAS
# ==========================================

from datetime import date, datetime
from typing import Optional


class SermonCreate(BaseModel):

    title: str

    preacher: str

    bible_reading: Optional[str] = None

    description: Optional[str] = None

    sermon_date: Optional[date] = None

    thumbnail: Optional[str] = None

    video_file: Optional[str] = None

    youtube_url: Optional[str] = None

    notes_file: Optional[str] = None

    featured: bool = False



class SermonResponse(SermonCreate):

    id: int

    views: int

    created_at: datetime


    class Config:

        from_attributes = True

class MemberLogout(BaseModel):
    member_id: int

# =====================================================
# GALLERY SCHEMAS
# =====================================================

from datetime import date, datetime
from typing import Optional


class GalleryCreate(BaseModel):

    title: str

    description: Optional[str] = None

    category: Optional[str] = None

    event_date: Optional[date] = None


class GalleryResponse(BaseModel):

    id: int

    title: str

    description: Optional[str] = None

    category: Optional[str] = None

    image: str

    event_date: Optional[date] = None

    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# ============================================
# EVENTS SCHEMAS
# Kingdom Ways Church CMS
# ============================================

from pydantic import BaseModel

from typing import Optional

from datetime import date, time, datetime



# ============================================
# BASE EVENT SCHEMA
# ============================================


class EventBase(BaseModel):

    title: str

    subtitle: Optional[str] = None

    description: str

    category: Optional[str] = None

    speaker: Optional[str] = None

    host: Optional[str] = None

    bible_reading: Optional[str] = None



    # Date & Time

    start_date: date

    end_date: Optional[date] = None

    start_time: Optional[time] = None

    end_time: Optional[time] = None



    # Location

    venue: str

    maps_link: Optional[str] = None



    # Registration

    capacity: Optional[int] = None

    registration_required: bool = False

    registration_deadline: Optional[datetime] = None



    # Settings

    featured: bool = False

    public_event: bool = True

    allow_comments: bool = False

    send_notification: bool = False



    # Status

    status: str = "draft"




# ============================================
# CREATE EVENT
# ============================================


class EventCreate(EventBase):

    pass




# ============================================
# UPDATE EVENT
# ============================================


class EventUpdate(BaseModel):


    title: Optional[str] = None

    subtitle: Optional[str] = None

    description: Optional[str] = None

    category: Optional[str] = None

    speaker: Optional[str] = None

    host: Optional[str] = None

    bible_reading: Optional[str] = None



    start_date: Optional[date] = None

    end_date: Optional[date] = None

    start_time: Optional[time] = None

    end_time: Optional[time] = None



    venue: Optional[str] = None

    maps_link: Optional[str] = None



    capacity: Optional[int] = None

    registration_required: Optional[bool] = None

    registration_deadline: Optional[datetime] = None



    featured: Optional[bool] = None

    public_event: Optional[bool] = None

    allow_comments: Optional[bool] = None

    send_notification: Optional[bool] = None



    status: Optional[str] = None




# ============================================
# EVENT RESPONSE
# ============================================


class EventResponse(EventBase):

    id: int


    banner: Optional[str] = None

    attachment: Optional[str] = None


    created_by: Optional[int] = None


    created_at: datetime

    updated_at: Optional[datetime] = None



    class Config:

        from_attributes = True




# ============================================
# EVENT LIST RESPONSE
# ============================================


class EventListResponse(BaseModel):

    success: bool

    message: Optional[str] = None

    events: list[EventResponse]



# ============================================
# EVENT REGISTRATION SCHEMA
# (Prepared for Part 7)
# ============================================


class EventRegistrationCreate(BaseModel):

    event_id: int

    member_id: int