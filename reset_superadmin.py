from app.database import SessionLocal
from app.models import Admin
from app.auth import hash_password

db = SessionLocal()

admin = (
    db.query(Admin)
    .filter(Admin.username == "superadmin")
    .first()
)

if admin:
    admin.password_hash = hash_password("MichaelMasa123")
    db.commit()
    print("✅ Superadmin password reset successfully.")
else:
    print("❌ Superadmin not found.")

db.close()
