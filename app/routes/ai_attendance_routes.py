from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AIAttendanceSession
from app.dependencies import get_current_admin

router = APIRouter(tags=["AI Attendance"])


# ==========================================
# SAVE AN AI ATTENDANCE SESSION
# Called by the dashboard camera after a run
# ==========================================

@router.post("/attendance/ai/session")
def save_ai_session(
    payload: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):

    session_date = payload.get("session_date") or str(date.today())

    entered = int(payload.get("entered_count") or 0)
    exited = int(payload.get("exited_count") or 0)
    unique = int(payload.get("unique_count") or 0)

    notes = payload.get("notes") or "AI camera attendance"

    session = AIAttendanceSession(
        admin_id=admin.id,
        session_date=date.fromisoformat(session_date),
        entered_count=entered,
        exited_count=exited,
        unique_count=unique,
        notes=notes,
        started_at=datetime.now(timezone.utc),
        ended_at=datetime.now(timezone.utc)
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "success": True,
        "session_id": session.id,
        "unique_count": unique
    }


# ==========================================
# LATEST / SUMMARY FOR THE DASHBOARD
# ==========================================

@router.get("/attendance/ai/latest")
def latest_ai_session(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):

    today = date.today()

    session = (
        db.query(AIAttendanceSession)
        .filter(AIAttendanceSession.session_date == today)
        .order_by(AIAttendanceSession.created_at.desc())
        .first()
    )

    total_unique_today = (
        db.query(AIAttendanceSession)
        .filter(AIAttendanceSession.session_date == today)
        .count()
    )

    return {
        "success": True,
        "latest_unique_count": session.unique_count if session else 0,
        "sessions_today": total_unique_today
    }
