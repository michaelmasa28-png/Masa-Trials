# =====================================================
# FINANCE ROUTES
# Kingdom Ways Church CMS
# PART 1
# =====================================================

from datetime import datetime
from uuid import uuid4
import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member, Giving
from app.schemas import (
    STKPushRequest,
    STKPushResponse,
    PaymentStatusResponse,
    GivingHistoryResponse,
    GivingResponse,
    ReceiptResponse,
    MpesaCallbackResponse
)

# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/api/finance",
    tags=["Finance"]
)

# =====================================================
# RECEIPT NUMBER
# Example:
# KWC-RCP-2026-000001
# =====================================================

def generate_receipt_number(db: Session) -> str:

    year = datetime.now().year

    total = db.query(Giving).count() + 1

    return f"KWC-RCP-{year}-{total:06d}"


# =====================================================
# INTERNAL TRANSACTION ID
# =====================================================

def generate_transaction_id() -> str:

    return str(uuid4())


# =====================================================
# RANDOM REFERENCE
# =====================================================

def generate_reference(length: int = 8):

    chars = string.ascii_uppercase + string.digits

    return "".join(

        random.choice(chars)

        for _ in range(length)

    )


# =====================================================
# FIND MEMBER
# =====================================================

def get_member_or_404(

    member_id: int,

    db: Session

):

    member = (

        db.query(Member)

        .filter(Member.id == member_id)

        .first()

    )

    if not member:

        raise HTTPException(

            status_code=404,

            detail="Member not found."

        )

    return member


# =====================================================
# FIND GIVING
# =====================================================

def get_giving_by_checkout(

    checkout_request_id: str,

    db: Session

):

    giving = (

        db.query(Giving)

        .filter(

            Giving.checkout_request_id

            == checkout_request_id

        )

        .first()

    )

    if not giving:

        raise HTTPException(

            status_code=404,

            detail="Transaction not found."

        )

    return giving


# =====================================================
# FIND RECEIPT
# =====================================================

def get_giving_by_transaction(

    transaction_id: str,

    db: Session

):

    giving = (

        db.query(Giving)

        .filter(

            Giving.transaction_id

            == transaction_id

        )

        .first()

    )

    if not giving:

        raise HTTPException(

            status_code=404,

            detail="Receipt not found."

        )

    return giving


# =====================================================
# VALIDATE PAYMENT
# =====================================================

def validate_payment(

    request: STKPushRequest

):

    if request.amount <= 0:

        raise HTTPException(

            status_code=400,

            detail="Amount must be greater than zero."

        )

    if request.category.strip() == "":

        raise HTTPException(

            status_code=400,

            detail="Category is required."

        )

    phone = request.phone_number.strip()

    if not (

        phone.startswith("254")

        or phone.startswith("07")

        or phone.startswith("01")

    ):

        raise HTTPException(

            status_code=400,

            detail="Invalid phone number."

        )

    return True


# =====================================================
# HEALTH CHECK
# =====================================================

@router.get("/health")

def finance_health():

    return {

        "success": True,

        "service": "Finance API",

        "status": "Running",

        "time": datetime.utcnow()

    }

