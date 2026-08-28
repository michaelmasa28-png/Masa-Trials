from pydantic import BaseModel
from datetime import date, datetime, time
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


    model_config = {"from_attributes": True}


class MemberLogout(BaseModel):
    member_id: int

# =====================================================
# GALLERY SCHEMAS
# =====================================================


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



    model_config = {"from_attributes": True}




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

# =====================================================
# GIVING SCHEMAS
# Kingdom Ways Church CMS
# =====================================================

class GivingCreate(BaseModel):
    member_id: int
    phone_number: str
    category: str
    amount: float
    reference: Optional[str] = None


# =====================================================
# STK PUSH REQUEST
# =====================================================

class STKPushRequest(BaseModel):
    member_id: int
    phone_number: str
    category: str
    amount: float
    reference: Optional[str] = None
    account_type: Optional[str] = "paybill"
    account_number: Optional[str] = None


# =====================================================
# GIVING RESPONSE
# =====================================================

class GivingResponse(BaseModel):
    success: bool
    message: str
    receipt_number: Optional[str] = None
    checkout_request_id: Optional[str] = None


# =====================================================
# GIVING HISTORY
# =====================================================

class GivingHistory(BaseModel):
    id: int
    receipt_number: str
    category: str
    amount: float
    phone_number: str
    reference: Optional[str] = None
    status: str
    mpesa_receipt: Optional[str] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# =====================================================
# GIVING HISTORY LIST
# =====================================================

class GivingHistoryResponse(BaseModel):
    success: bool
    total: int
    history: list[GivingHistory]


# =====================================================
# M-PESA CALLBACK
# =====================================================

class MpesaCallbackResponse(BaseModel):
    success: bool
    message: str

# =====================================================
# STK PUSH RESPONSE
# =====================================================

class STKPushResponse(BaseModel):
    success: bool
    message: str
    checkout_request_id: str | None = None
    merchant_request_id: str | None = None
    customer_message: str | None = None


# =====================================================
# PAYMENT STATUS RESPONSE
# =====================================================

class PaymentStatusResponse(BaseModel):
    success: bool
    status: str
    result_code: str | None = None
    message: str
    receipt_number: str | None = None
    transaction_id: str | None = None
    mpesa_receipt: str | None = None
    safaricom_name: str | None = None
    phone: str | None = None
    amount: float | None = None
    category: str | None = None
    transaction_date: str | None = None


# =====================================================
# RECEIPT RESPONSE
# =====================================================

class ReceiptResponse(BaseModel):
    success: bool
    receipt_number: str
    transaction_id: str
    member_name: str
    member_number: str
    phone_number: str
    category: str
    amount: float
    mpesa_receipt: str | None = None
    status: str
    created_at: datetime
    confirmed_at: datetime | None = None


# ==========================================================
# APPEND THIS BLOCK TO THE END OF app/schema.py
# (uses BaseModel / Optional / datetime, already imported
#  at the top of schema.py)
# ==========================================================

# =====================================================
# COMMUNICATION SCHEMAS
# Kingdom Ways Church CMS
# =====================================================

class MemberSummary(BaseModel):
    id: int
    full_name: str
    member_number: Optional[str] = None
    phone: str
    photo: Optional[str] = None
    online: bool = False

    model_config = {"from_attributes": True}


class MemberListResponse(BaseModel):
    members: list[MemberSummary]


class SMSSendRequest(BaseModel):
    members: list[int] = []          # explicit member ids; ignored if send_to_all=True
    send_to_all: bool = False
    category: str
    message: str


class InternalSendRequest(BaseModel):
    members: list[int] = []          # explicit member ids; ignored if send_to_all=True
    send_to_all: bool = False
    subject: str
    message: str
    priority: str = "normal"


class CommunicationSendResponse(BaseModel):
    success: bool
    message: str
    recipient_count: int = 0
    sent: int = 0
    failed: int = 0


class CommunicationHistoryItem(BaseModel):
    id: int
    type: str
    category: Optional[str] = None
    subject: Optional[str] = None
    message: str
    recipient_count: int
    status: str
    administrator: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CommunicationHistoryResponse(BaseModel):
    history: list[CommunicationHistoryItem]


class CommunicationStatisticsResponse(BaseModel):
    total_members: int
    sms_today: int
    internal_messages: int
    pending_delivery: int


class ChurchContactUpdate(BaseModel):
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    maps_link: Optional[str] = None
    office_hours: Optional[str] = None


class ChurchContactResponse(ChurchContactUpdate):
    id: int
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# =====================================================
# BOOK SCAN / OCR REVIEW SCHEMAS
# =====================================================

class ScannedContactOut(BaseModel):
    id: int
    full_name: Optional[str] = None
    phone: Optional[str] = None
    ministry: Optional[str] = None
    raw_line: Optional[str] = None
    confidence: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}


class ScannedContactUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    ministry: Optional[str] = None


class ScanBookResponse(BaseModel):
    success: bool
    message: str
    extracted: list[ScannedContactOut] = []


# ==========================================================
# CARD BACKGROUND SCHEMAS
# ==========================================================

class CardBackgroundOut(BaseModel):
    card_key: str
    image_url: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}