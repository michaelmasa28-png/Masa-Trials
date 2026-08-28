from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member, Attendance

router = APIRouter(tags=["Attendance"])

@router.get("/attendance/today")
def attendance_today(db: Session = Depends(get_db)):

    today = date.today()

    approved_members = (
        db.query(Member)
        .filter(Member.status == "Approved")
        .all()
    )

    attendance = (
        db.query(Attendance)
        .filter(Attendance.attendance_date == today)
        .all()
    )

    present = []
    offline = []
    online_today = []

    attendance_lookup = {
        item.member_id: item
        for item in attendance
    }

    online_limit = datetime.now(timezone.utc) - timedelta(minutes=5)

    for member in approved_members:

        # ONLINE MEMBERS
        is_online = (
            member.online
            and member.last_seen
            and member.last_seen >= online_limit
        )

        if is_online:
            online_today.append({
                "id": member.id,
                "full_name": member.full_name,
                "last_seen": member.last_seen
            })

        # MEMBERS WHO HAVE CHECKED ATTENDANCE
        if member.id in attendance_lookup:

            record = attendance_lookup[member.id]

            present.append({
                "id": member.id,
                "full_name": member.full_name,
                "time_in": record.time_in,
                "time_out": record.time_out,
                "last_seen": member.last_seen,
                "online": is_online
            })

        # MEMBERS WHO HAVE NOT CHECKED ATTENDANCE
        else:

            offline.append({
                "id": member.id,
                "full_name": member.full_name,
                "last_seen": member.last_seen,
                "online": is_online
            })

            # Mark inactive users offline
            if member.online and member.last_seen and not is_online:
                member.online = False

    db.commit()

    return {
        "approved_members": len(approved_members),
        "present_today": len(present),
        "not_checked": len(offline),
        "online_today": len(online_today),
        "attendance": present,
        "offline": offline,
        "online": online_today
    }
