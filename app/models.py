from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Table,
    Float,
    Date,
    Time
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base, DateTimeTZ

# ==========================================
# MANY TO MANY
# ==========================================

admin_permissions = Table(
    "admin_permissions",
    Base.metadata,

    Column(
        "admin_id",
        Integer,
        ForeignKey("admins.id"),
        primary_key=True
    ),

    Column(
        "permission_id",
        Integer,
        ForeignKey("permissions.id"),
        primary_key=True
    )
)


# ==========================================
# ADMIN
# ==========================================

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    email = Column(
        String(120),
        unique=True,
        nullable=False
    )

    phone = Column(
        String(20),
        unique=True,
        nullable=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False,
        default="admin"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    must_change_password = Column(
        Boolean,
        default=True
    )

    # NEW ACCOUNT STATUS
    status = Column(
        String(30),
        default="Active"
    )

    # SECURITY
    failed_login_attempts = Column(
        Integer,
        default=0
    )

    locked_until = Column(
        DateTimeTZ(),
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("admins.id"),
        nullable=True
    )

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )

    last_login = Column(
        DateTimeTZ(),
        nullable=True
    )

    permissions = relationship(
        "Permission",
        secondary=admin_permissions,
        back_populates="admins"
    )


# ==========================================
# PERMISSION
# ==========================================

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(
        String(255),
        nullable=True
    )

    admins = relationship(
        "Admin",
        secondary=admin_permissions,
        back_populates="permissions"
    )


# ==========================================
# AUDIT LOG
# ==========================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    admin_id = Column(
        Integer,
        ForeignKey("admins.id"),
        nullable=True
    )

    action = Column(
        String(255),
        nullable=False
    )

    target = Column(
        String(255),
        nullable=True
    )

    status = Column(
        String(50),
        default="Success"
    )

    ip_address = Column(
        String(50),
        nullable=True
    )

    details = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )

# ==========================================
# MEMBER
# ==========================================
class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)

    member_number = Column(String(30), unique=True, nullable=True)

    system_id = Column(
        String(30),
        unique=True,
        nullable=True
    )

    username = Column(
        String(100),
        unique=True,
        nullable=True
    )

    full_name = Column(String(150), nullable=False)

    phone = Column(String(20), unique=True, nullable=False)

    password_hash = Column(String(255), nullable=True)

    gender = Column(String(20), nullable=True)

    date_of_birth = Column(DateTime, nullable=True)

    # Member-uploaded profile picture (Cloudinary URL or local path)
    photo = Column(String(500), nullable=True)

    email = Column(String(120), unique=True, nullable=True)

    national_id = Column(String(30), nullable=True)

    occupation = Column(String(100), nullable=True)

    marital_status = Column(String(30), nullable=True)

    address = Column(String(255), nullable=True)

    emergency_contact = Column(String(100), nullable=True)

    emergency_phone = Column(String(20), nullable=True)

    ministry = Column(String(100), nullable=True)

    baptism_status = Column(Boolean, default=False)

    baptism_date = Column(DateTime, nullable=True)

    status = Column(
        String(30),
        default="Pending Approval"
    )

    is_active = Column(
        Boolean,
        default=False
    )

    profile_completed = Column(
        Boolean,
        default=False
    )

    approved_by = Column(
        Integer,
        ForeignKey("admins.id"),
        nullable=True
    )

    approved_at = Column(
        DateTimeTZ(),
        nullable=True
    )

    rejected_reason = Column(
        String(255),
        nullable=True
    )

    online = Column(
        Boolean,
        default=False
    )

    last_seen = Column(
        DateTimeTZ(),
        nullable=True
    )

    last_login = Column(
        DateTimeTZ(),
        nullable=True
    )

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )

    updated_at = Column(
        DateTimeTZ(),
        server_default=func.now(),
        onupdate=func.now()
    )

    givings = relationship(
        "Giving",
        back_populates="member",
        cascade="all, delete-orphan"
    )

# ==========================================
# GIVING MODEL
# ==========================================

class Giving(Base):
    __tablename__ = "givings"

    id = Column(Integer, primary_key=True, index=True)

    member_id = Column(
        Integer,
        ForeignKey("members.id"),
        nullable=False
    )

    receipt_number = Column(
        String(50),
        unique=True,
        nullable=True
    )

    transaction_id = Column(
        String(100),
        unique=True,
        nullable=True
    )

    checkout_request_id = Column(
        String(150),
        unique=True,
        nullable=True
    )

    merchant_request_id = Column(
        String(150),
        nullable=True
    )

    mpesa_receipt = Column(
        String(100),
        nullable=True
    )

    phone_number = Column(
        String(20),
        nullable=False
    )

    category = Column(
        String(50),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    status = Column(
        String(30),
        default="Pending"
    )

    payment_method = Column(
        String(30),
        default="M-Pesa"
    )

    transaction_date = Column(
        DateTimeTZ(),
        nullable=True
    )

    confirmed_at = Column(
        DateTimeTZ(),
        nullable=True
    )

    safaricom_name = Column(
        String(150),
        nullable=True
    )

    reference = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )

    member = relationship(
        "Member",
        back_populates="givings"
    )


# ==========================================
# GIVING ACCOUNTS
# Receiving accounts configured by admin.
# type = "paybill"  -> M-Pesa PayBill (STK push target)
# type = "phone"    -> M-Pesa number shown for manual giving (display)
# ==========================================

class GivingAccount(Base):
    __tablename__ = "giving_accounts"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)          # e.g. Tithe PayBill
    account_type = Column(String(20), nullable=False)   # "paybill" | "phone"
    number = Column(String(50), nullable=False)         # paybill no. or phone no.
    account_name = Column(String(150), nullable=True)   # name on the account
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )


# ==========================================
# SERMON
# ==========================================

class Sermon(Base):

    __tablename__ = "sermons"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    title = Column(
        String(200),
        nullable=False
    )


    preacher = Column(
        String(150),
        nullable=False
    )


    bible_reading = Column(
        String(200),
        nullable=True
    )


    description = Column(
        String,
        nullable=True
    )


    sermon_date = Column(
        Date,
        nullable=True
    )


    thumbnail = Column(
        String(500),
        nullable=True
    )


    video_file = Column(
        String(500),
        nullable=True
    )


    youtube_url = Column(
        String,
        nullable=True
    )


    notes_file = Column(
        String(500),
        nullable=True
    )


    featured = Column(
        Boolean,
        default=False
    )


    views = Column(
        Integer,
        default=0
    )


    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )


    updated_at = Column(
        DateTimeTZ(),
        server_default=func.now(),
        onupdate=func.now()
    )

# ==========================================
# ATTENDANCE
# ==========================================

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    member_id = Column(
        Integer,
        ForeignKey("members.id"),
        nullable=False
    )

    attendance_date = Column(
        Date,
        nullable=False
    )

    attendance_type = Column(
        String(50),
        default="Placed under kingdomwaysempowermentinfluence"
    )

    time_in = Column(
        DateTimeTZ(),
        nullable=False
    )

    time_out = Column(
        DateTimeTZ(),
        nullable=True
    )

    status = Column(
        String(20),
        default="Present"
    )

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )

    member = relationship("Member")

# =====================================================
# GALLERY
# =====================================================

class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category = Column(
        String,
        nullable=True
    )

    image = Column(
        String,
        nullable=False
    )

    event_date = Column(
        Date,
        nullable=True
    )

    created_at = Column(
        DateTimeTZ(),
        server_default=func.now()
    )


# ============================================
# EVENTS MODEL
# Kingdom Ways Church CMS
# ============================================



class Event(Base):

    __tablename__ = "events"


    # -----------------------------
    # Primary Key
    # -----------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # -----------------------------
    # Basic Information
    # -----------------------------

    title = Column(
        String(150),
        nullable=False
    )


    subtitle = Column(
        String(200),
        nullable=True
    )


    description = Column(
        Text,
        nullable=False
    )


    category = Column(
        String(100),
        nullable=True
    )


    speaker = Column(
        String(150),
        nullable=True
    )


    host = Column(
        String(150),
        nullable=True
    )


    bible_reading = Column(
        String(100),
        nullable=True
    )



    # -----------------------------
    # Date & Time
    # -----------------------------

    start_date = Column(
        Date,
        nullable=False
    )


    end_date = Column(
        Date,
        nullable=True
    )


    start_time = Column(
        Time,
        nullable=True
    )


    end_time = Column(
        Time,
        nullable=True
    )



    # -----------------------------
    # Location
    # -----------------------------

    venue = Column(
        String(200),
        nullable=False
    )


    maps_link = Column(
        String(500),
        nullable=True
    )



    # -----------------------------
    # Registration
    # -----------------------------

    capacity = Column(
        Integer,
        nullable=True
    )


    registration_required = Column(
        Boolean,
        default=False
    )


    registration_deadline = Column(
        DateTime,
        nullable=True
    )



    # -----------------------------
    # Event Settings
    # -----------------------------

    featured = Column(
        Boolean,
        default=False
    )


    public_event = Column(
        Boolean,
        default=True
    )


    allow_comments = Column(
        Boolean,
        default=False
    )


    send_notification = Column(
        Boolean,
        default=False
    )



    # -----------------------------
    # Status
    # -----------------------------

    status = Column(
        String(50),
        default="draft"
    )



    # -----------------------------
    # Media
    # -----------------------------

    banner = Column(
        String(500),
        nullable=True
    )


    attachment = Column(
        String(500),
        nullable=True
    )



    # -----------------------------
    # Ownership
    # -----------------------------

    created_by = Column(
        Integer,
        ForeignKey(
            "admins.id"
        ),
        nullable=True
    )



    # -----------------------------
    # Dates
    # -----------------------------

    created_at = Column(
        DateTime,
        server_default=func.now()
    )


    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    type = Column(String(20), default="private")
    created_by = Column(String, ForeignKey("members.member_number"))
    last_message = Column(Text, nullable=True)
    last_message_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ConversationMember(Base):
    __tablename__ = "conversation_members"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    member_number = Column(String, ForeignKey("members.member_number"))
    joined_at = Column(DateTime, server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    member_number = Column(String, ForeignKey("members.member_number"))
    sender_name = Column(String(100))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    edited = Column(Boolean, default=False)
    deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


# ==========================================================
# APPEND THIS BLOCK TO THE END OF app/models.py
# (uses Column/Integer/String/Boolean/DateTime/Text/ForeignKey/
#  Date and func, all already imported at the top of models.py)
# ==========================================================

# ==========================================================
# COMMUNICATION LOG
# One row per SMS broadcast or internal message sent
# ==========================================================

class CommunicationLog(Base):
    __tablename__ = "communication_logs"

    id = Column(Integer, primary_key=True, index=True)

    type = Column(String(20), nullable=False)          # "sms" or "internal"
    category = Column(String(50), nullable=True)        # SMS category / internal priority
    subject = Column(String(150), nullable=True)         # internal messages only
    message = Column(Text, nullable=False)

    recipient_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)

    status = Column(String(20), default="Pending")       # Pending / Delivered / Failed

    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)

    created_at = Column(DateTimeTZ(), server_default=func.now())

    admin = relationship("Admin")


# ==========================================================
# MEMBER NOTIFICATION
# One row per member per internal message - powers
# "Notify on Login" and unread badges on the member side
# ==========================================================

class MemberNotification(Base):
    __tablename__ = "member_notifications"

    id = Column(Integer, primary_key=True, index=True)

    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    communication_log_id = Column(Integer, ForeignKey("communication_logs.id"), nullable=True)

    subject = Column(String(150), nullable=True)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="normal")

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTimeTZ(), server_default=func.now())

    member = relationship("Member")


# ==========================================================
# CHURCH CONTACTS
# Single-row settings table for the Church Contacts panel
# ==========================================================

class ChurchContact(Base):
    __tablename__ = "church_contacts"

    id = Column(Integer, primary_key=True, index=True)

    phone = Column(String(30), nullable=True)
    whatsapp = Column(String(255), nullable=True)
    facebook = Column(String(255), nullable=True)
    instagram = Column(String(255), nullable=True)
    youtube = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    email = Column(String(120), nullable=True)
    maps_link = Column(String(255), nullable=True)
    office_hours = Column(String(150), nullable=True)

    updated_by = Column(Integer, ForeignKey("admins.id"), nullable=True)
    updated_at = Column(DateTimeTZ(), server_default=func.now(), onupdate=func.now())


# ==========================================================
# FINANCE TRANSACTIONS
# General ledger for the admin finance dashboard
# ==========================================================

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    tx_type = Column(String(20), nullable=False)  # income / expense
    category = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)
    account_key = Column(String(50), nullable=True)  # main / bank / cash / mpesa / petty
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="confirmed")

    created_by = Column(Integer, ForeignKey("admins.id"), nullable=True)
    created_at = Column(DateTimeTZ(), server_default=func.now())


# ==========================================================
# SCANNED CONTACT (BOOK OCR REVIEW QUEUE)
# One row per name/phone the OCR pass found on a scanned page.
# Nothing here touches the real members table until an admin
# approves it - protects you from OCR misreads becoming real
# member records.
# ==========================================================

class ScannedContact(Base):
    __tablename__ = "scanned_contacts"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True)
    ministry = Column(String(100), nullable=True)

    raw_line = Column(Text, nullable=True)        # exact OCR line, for reference when correcting
    source_file = Column(String(255), nullable=True)  # saved scan filename this came from
    confidence = Column(String(10), nullable=True)     # "high" / "low" - phone regex matched cleanly or not

    status = Column(String(20), default="Pending")     # Pending / Approved / Rejected / Duplicate

    reviewed_by = Column(Integer, ForeignKey("admins.id"), nullable=True)
    reviewed_at = Column(DateTimeTZ(), nullable=True)

    created_by = Column(Integer, ForeignKey("admins.id"), nullable=True)  # who uploaded the scan
    created_at = Column(DateTimeTZ(), server_default=func.now())


# ==========================================================
# CARD BACKGROUNDS
# Stores per-card background images for clientMode
# Each card has its own independently changeable photo
# ==========================================================

class CardBackground(Base):
    __tablename__ = "card_backgrounds"

    id = Column(Integer, primary_key=True, index=True)

    card_key = Column(String(50), unique=True, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)

    updated_by = Column(Integer, ForeignKey("admins.id"), nullable=True)
    updated_at = Column(DateTimeTZ(), server_default=func.now(), onupdate=func.now())


# ==========================================================
# AI ATTENDANCE SESSIONS
# Camera-based attendance (browser TensorFlow.js detection)
# Each session = one camera run; stores the unique-person
# counts as reported by the on-device person tracker.
# Face-recognition (member identity) can be layered on later.
# ==========================================================

class AIAttendanceSession(Base):
    __tablename__ = "ai_attendance_sessions"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)

    session_date = Column(Date, nullable=False)

    entered_count = Column(Integer, default=0)
    exited_count = Column(Integer, default=0)
    unique_count = Column(Integer, default=0)

    notes = Column(String(255), nullable=True)

    started_at = Column(DateTimeTZ(), nullable=True)
    ended_at = Column(DateTimeTZ(), nullable=True)

    created_at = Column(DateTimeTZ(), server_default=func.now())


# ==========================================================
# RATE LIMIT EVENTS
# Shared across every instance (load-balanced servers) via the
# database, so limits are consistently enforced no matter which
# instance handles a request. In-memory limits would be bypassed
# once traffic is split across multiple servers.
# ==========================================================

class RateLimitEvent(Base):
    __tablename__ = "rate_limit_events"

    id = Column(Integer, primary_key=True, index=True)

    label = Column(String(50), nullable=False, index=True)
    key = Column(String(255), nullable=False, index=True)

    created_at = Column(DateTimeTZ(), server_default=func.now(), index=True)
