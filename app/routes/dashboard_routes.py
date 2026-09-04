from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member, Event, Attendance, Giving


router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):

    today = date.today()

    total_members = (
        db.query(Member)
        .filter(Member.status == "Approved")
        .count()
    )

    upcoming_events = (
        db.query(Event)
        .filter(Event.start_date >= today)
        .count()
    )

    today_attendance = (
        db.query(Attendance)
        .filter(Attendance.attendance_date == today)
        .count()
    )

    first_of_month = date(today.year, today.month, 1)
    monthly_offerings = (
        db.query(db.func.coalesce(db.func.sum(Giving.amount), 0.0))
        .filter(
            Giving.status == "Success",
            db.func.date(Giving.created_at) >= first_of_month,
        )
        .scalar()
    )

    return {
        "success": True,
        "total_members": total_members,
        "upcoming_events": upcoming_events,
        "today_attendance": today_attendance,
        "monthly_offerings": round(float(monthly_offerings or 0), 2),
        "as_of": datetime.now().isoformat(),
    }