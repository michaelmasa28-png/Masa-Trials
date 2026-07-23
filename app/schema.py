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

