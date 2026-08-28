import uuid
import random
import string
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import Member, Giving, Transaction
from app.mpesa import stk_push as mpesa_stk_push, normalize_callback

logger = logging.getLogger(__name__)


# ==========================================
# VALIDATION
# ==========================================
def validate_payment(amount: float, category: str, phone_number: str):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    if not category:
        raise HTTPException(status_code=400, detail="Category is required")
    if not phone_number.startswith(("254", "07", "01")):
        raise HTTPException(status_code=400, detail="Invalid phone number format")


# ==========================================
# ID GENERATION
# ==========================================
def generate_receipt_number(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Giving).count() + 1
    return f"KWC-RCP-{year}-{count:06d}"


def generate_transaction_id() -> str:
    return str(uuid.uuid4())


def generate_reference() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


# ==========================================
# STK PUSH
# ==========================================
def initiate_stk_push(member_id: int, phone_number: str, category: str, amount: float, reference: str | None, db: Session) -> dict:
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    validate_payment(amount, category, phone_number)

    receipt_number = generate_receipt_number(db)
    transaction_id = generate_transaction_id()
    if not reference:
        reference = generate_reference()

    giving = Giving(
        member_id=member.id,
        receipt_number=receipt_number,
        transaction_id=transaction_id,
        phone_number=phone_number,
        category=category,
        amount=amount,
        reference=reference,
        status="Pending",
    )
    db.add(giving)
    db.commit()
    db.refresh(giving)

    try:
        stk_response = mpesa_stk_push(phone_number, amount, receipt_number, category)
        giving.checkout_request_id = stk_response.get("CheckoutRequestID", "")
        giving.merchant_request_id = stk_response.get("MerchantRequestID", "")
        db.commit()

        return {
            "success": True,
            "message": "STK push sent. Please check your phone.",
            "checkout_request_id": giving.checkout_request_id,
            "merchant_request_id": giving.merchant_request_id,
            "customer_message": stk_response.get("CustomerMessage", ""),
            "receipt_number": receipt_number,
        }
    except Exception as e:
        giving.status = "Failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"M-Pesa API error: {str(e)}")


# ==========================================
# CALLBACK
# ==========================================
def process_mpesa_callback(body: dict, db: Session) -> dict:
    callback = normalize_callback(body)
    checkout_id = callback.get("CheckoutRequestID")

    if not checkout_id:
        return {"ResultCode": 0, "ResultDesc": "No CheckoutRequestID"}

    giving = db.query(Giving).filter(Giving.checkout_request_id == checkout_id).first()
    if not giving:
        return {"ResultCode": 0, "ResultDesc": "Giving record not found"}

    result_code = callback.get("ResultCode")

    if result_code == 0:
        giving.status = "Success"
        giving.mpesa_receipt = callback.get("MpesaReceiptNumber")
        giving.confirmed_at = datetime.now(timezone.utc)
        giving.result_code = str(result_code)
        giving.result_desc = callback.get("ResultDesc")
    elif result_code == 1032:
        giving.status = "Cancelled"
        giving.result_code = str(result_code)
        giving.result_desc = callback.get("ResultDesc")
    else:
        giving.status = "Failed"
        giving.result_code = str(result_code)
        giving.result_desc = callback.get("ResultDesc")

    db.commit()
    return {"ResultCode": 0, "ResultDesc": "Processed"}


# ==========================================
# STATUS & RECEIPTS
# ==========================================
def get_payment_status(checkout_request_id: str, db: Session) -> dict:
    giving = db.query(Giving).filter(Giving.checkout_request_id == checkout_request_id).first()
    if not giving:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "success": True,
        "status": giving.status,
        "message": f"Payment {giving.status.lower()}",
        "receipt_number": giving.receipt_number,
        "mpesa_receipt": giving.mpesa_receipt,
        "amount": giving.amount,
        "category": giving.category,
        "transaction_date": giving.created_at.isoformat() if giving.created_at else None,
    }


def get_receipt(transaction_id: str, db: Session) -> dict:
    giving = db.query(Giving).filter(Giving.transaction_id == transaction_id).first()
    if not giving:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if giving.status != "Success":
        raise HTTPException(status_code=400, detail="Receipt only available for successful payments")

    member = db.query(Member).filter(Member.id == giving.member_id).first()

    return {
        "success": True,
        "receipt_number": giving.receipt_number,
        "transaction_id": giving.transaction_id,
        "member_name": member.full_name if member else "Unknown",
        "member_number": member.member_number if member else "Unknown",
        "phone_number": giving.phone_number,
        "category": giving.category,
        "amount": giving.amount,
        "mpesa_receipt": giving.mpesa_receipt,
        "status": giving.status,
        "created_at": giving.created_at,
        "confirmed_at": giving.confirmed_at,
    }


# ==========================================
# HISTORY
# ==========================================
def get_member_history(member_number: str, db: Session) -> list:
    member = db.query(Member).filter(Member.member_number == member_number).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return (
        db.query(Giving)
        .filter(Giving.member_id == member.id)
        .order_by(Giving.created_at.desc())
        .all()
    )
