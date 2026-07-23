from app.database import SessionLocal
from app.models import Permission


db = SessionLocal()


permissions = [
    {
        "name": "manage_members",
        "description": "Create, approve, edit and remove members"
    },

    {
        "name": "manage_events",
        "description": "Create and manage church events"
    },

    {
        "name": "manage_sermons",
        "description": "Upload and manage sermons"
    },

    {
        "name": "manage_attendance",
        "description": "Manage attendance records"
    },

    {
        "name": "manage_donations",
        "description": "Manage church donations and finances"
    },

    {
        "name": "manage_gallery",
        "description": "Manage church photos and media"
    },

    {
        "name": "manage_settings",
        "description": "Change CMS settings"
    },

    {
        "name": "manage_admins",
        "description": "Create and manage other administrators"
    }
]


for item in permissions:

    existing = (
        db.query(Permission)
        .filter(Permission.name == item["name"])
        .first()
    )

    if not existing:

        permission = Permission(
            name=item["name"],
            description=item["description"]
        )

        db.add(permission)


db.commit()

db.close()


print("Permissions created successfully")
