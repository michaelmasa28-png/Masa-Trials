from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Date
from app.database import Base
from sqlalchemy import Text
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date

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
        DateTime(timezone=True),
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("admins.id"),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    last_login = Column(
        DateTime(timezone=True),
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
        DateTime(timezone=True),
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
        DateTime(timezone=True),
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
        DateTime(timezone=True),
        nullable=True
    )

    last_login = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
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
        DateTime(timezone=True),
        server_default=func.now()
    )


    updated_at = Column(
        DateTime(timezone=True),
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
        DateTime(timezone=True),
        nullable=False
    )

    time_out = Column(
        DateTime(timezone=True),
        nullable=True
    )

    status = Column(
        String(20),
        default="Present"
    )

    created_at = Column(
        DateTime(timezone=True),
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
        DateTime(timezone=True),
        server_default=func.now()
    )


# ============================================
# EVENTS MODEL
# Kingdom Ways Church CMS
# ============================================

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Date,
    Time,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func

from app.database import Base



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