from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member, Event, Attendance, Giving


router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/activity")
def dashboard_activity(db: Session = Depends(get_db)):
    """Real recent activity feed (latest giving, members, events)."""

    items = []

    for m in (
        db.query(Member)
        .order_by(Member.created_at.desc())
        .limit(3)
        .all()
    ):
        items.append({
            "date": m.created_at.strftime("%d %b") if m.created_at else "",
            "activity": f"Member {m.full_name or m.member_number or ''} registered",
            "status": m.status or "Pending",
        })

    for g in (
        db.query(Giving)
        .filter(Giving.status == "Success")
        .order_by(Giving.created_at.desc())
        .limit(3)
        .all()
    ):
        items.append({
            "date": g.created_at.strftime("%d %b") if g.created_at else "",
            "activity": f"Giving received — KSh {g.amount:.0f} ({g.category or 'Offering'})",
            "status": "Success",
        })

    for e in (
        db.query(Event)
        .order_by(Event.created_at.desc())
        .limit(3)
        .all()
    ):
        items.append({
            "date": e.created_at.strftime("%d %b") if e.created_at else "",
            "activity": f"Event added — {e.title}",
            "status": "Scheduled" if (e.start_date and e.start_date >= date.today()) else "Past",
        })

    seen = set()
    ordered = []
    for it in sorted(items, key=lambda x: x["date"], reverse=True):
        key = (it["activity"], it["date"])
        if key not in seen:
            seen.add(key)
            ordered.append(it)
        if len(ordered) >= 6:
            break

    return {"success": True, "activities": ordered}


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
        db.query(func.coalesce(func.sum(Giving.amount), 0.0))
        .filter(
            Giving.status == "Success",
            func.date(Giving.created_at) >= first_of_month,
        )
        .scalar()
    )

    upcoming = (
        db.query(Event)
        .filter(Event.start_date >= today)
        .order_by(Event.start_date.asc(), Event.start_time.asc())
        .limit(4)
        .all()
    )

    return {
        "success": True,
        "total_members": total_members,
        "upcoming_events": upcoming_events,
        "today_attendance": today_attendance,
        "monthly_offerings": round(float(monthly_offerings or 0), 2),
        "upcoming_list": [
            {
                "title": e.title,
                "date": e.start_date.strftime("%a %d %b") if e.start_date else "",
                "time": (e.start_time.strftime("%I:%M %p") if e.start_time else ""),
                "venue": e.venue or "",
            }
            for e in upcoming
        ],
        "as_of": datetime.now().isoformat(),
    }