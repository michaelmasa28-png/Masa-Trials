from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Member


router = APIRouter(tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):

    total_members = db.query(Member).filter(Member.status == "Approved").count()

    return {
        "success": True,
        "total_members": total_members
    }
