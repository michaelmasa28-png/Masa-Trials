from app.database import SessionLocal
from app.models import Admin
from app.auth import hash_password


db = SessionLocal()


super_admin = Admin(
    full_name="Main Administrator",
    username="superadmin",
    email="admin@kingdomways.com",
    phone="0000000000",
    password_hash=hash_password("Admin123"),
    role="super_admin",
    is_active=True,
    must_change_password=True
)


db.add(super_admin)
db.commit()
db.refresh(super_admin)

print("Super Admin created successfully")
print("ID:", super_admin.id)

db.close()
