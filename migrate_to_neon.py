# ==========================================================
# migrate_to_neon.py
# PART 1 OF 3
# ==========================================================

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.models import (
    Admin,
    Permission,
    Member,
    Attendance,
    Sermon,
    Gallery,
    AuditLog
)

# ==========================================================
# DATABASE CONNECTIONS
# ==========================================================

# ---------- LOCAL POSTGRES ----------
LOCAL_DATABASE_URL = (
    "postgresql://postgres:MichaelMasa123@localhost:5432/church_cms"
)

# ---------- NEON ----------
NEON_DATABASE_URL = (
    "postgresql://neondb_owner:npg_rAp7nYJuKLm3@"
    "ep-soft-scene-az2jjvmi-pooler.c-3.ap-southeast-1.aws.neon.tech/"
    "neondb?sslmode=require&channel_binding=require"
)

# ==========================================================
# CREATE ENGINES
# ==========================================================

local_engine = create_engine(LOCAL_DATABASE_URL)
neon_engine = create_engine(NEON_DATABASE_URL)

LocalSession = sessionmaker(bind=local_engine)
NeonSession = sessionmaker(bind=neon_engine)

local_db = LocalSession()
neon_db = NeonSession()

print("=" * 60)
print("KINGDOM WAYS CMS")
print("LOCAL  --->  NEON MIGRATION")
print("=" * 60)


# ==========================================================
# COPY TABLE
# ==========================================================

def copy_table(model, table_name):

    print(f"\nMigrating {table_name}...")

    rows = local_db.query(model).all()

    print(f"Found {len(rows)} record(s).")

    copied = 0
    skipped = 0

    for row in rows:

        data = {}

        for column in model.__table__.columns:
            data[column.name] = getattr(row, column.name)

        exists = neon_db.get(model, row.id)

        if exists:
            skipped += 1
            continue

        neon_db.add(model(**data))
        copied += 1

    try:
        neon_db.commit()

    except IntegrityError as e:

        neon_db.rollback()

        print("ERROR")
        print(e)

        return

    print(f"Copied : {copied}")
    print(f"Skipped: {skipped}")
# ==========================================================
# PART 2 OF 3
# ==========================================================

# ==========================================================
# COPY MANY-TO-MANY TABLE
# admin_permissions
# ==========================================================

def copy_admin_permissions():

    print("\nMigrating admin_permissions...")

    rows = local_db.execute(
        text("SELECT admin_id, permission_id FROM admin_permissions")
    ).fetchall()

    copied = 0
    skipped = 0

    for row in rows:

        exists = neon_db.execute(
            text("""
                SELECT 1
                FROM admin_permissions
                WHERE admin_id=:a
                AND permission_id=:p
            """),
            {
                "a": row.admin_id,
                "p": row.permission_id
            }
        ).fetchone()

        if exists:
            skipped += 1
            continue

        neon_db.execute(
            text("""
                INSERT INTO admin_permissions
                (admin_id, permission_id)
                VALUES
                (:a, :p)
            """),
            {
                "a": row.admin_id,
                "p": row.permission_id
            }
        )

        copied += 1

    neon_db.commit()

    print(f"Copied : {copied}")
    print(f"Skipped: {skipped}")


# ==========================================================
# MIGRATION ORDER
# ==========================================================

print("\nStarting migration...\n")

# These must come first because other tables depend on them
copy_table(Permission, "permissions")
copy_table(Admin, "admins")

# Many-to-many relationship
copy_admin_permissions()

# Main application data
copy_table(Member, "members")
copy_table(Sermon, "sermons")
copy_table(Gallery, "gallery")
copy_table(Attendance, "attendance")
copy_table(AuditLog, "audit_logs")

# ==========================================================
# PART 3 OF 3
# ==========================================================

print("\n" + "=" * 60)
print("VERIFYING NEON DATABASE")
print("=" * 60)

tables = [
    ("permissions", Permission),
    ("admins", Admin),
    ("members", Member),
    ("sermons", Sermon),
    ("gallery", Gallery),
    ("attendance", Attendance),
    ("audit_logs", AuditLog),
]

for table_name, model in tables:
    count = neon_db.query(model).count()
    print(f"{table_name:<20}: {count}")

admin_permissions_count = neon_db.execute(
    text("SELECT COUNT(*) FROM admin_permissions")
).scalar()

print(f"{'admin_permissions':<20}: {admin_permissions_count}")

print("\n" + "=" * 60)
print("MIGRATION COMPLETED SUCCESSFULLY")
print("=" * 60)

local_db.close()
neon_db.close()

print("\nLocal database connection closed.")
print("Neon database connection closed.")
print("\nYou can now start your FastAPI server using Neon.")