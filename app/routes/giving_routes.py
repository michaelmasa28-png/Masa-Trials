# =====================================================
# FINANCE ROUTES
# Kingdom Ways Church CMS
# PART 1
# =====================================================

from datetime import datetime, timezone
from uuid import uuid4
import json
import logging
import random
import string

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.mpesa import stk_push as mpesa_stk_push, normalize_callback, MpesaError
from app.database import get_db
from app.models import Member, Giving, Transaction, GivingAccount
from app.schema import (
    STKPushRequest,
    STKPushResponse,
    PaymentStatusResponse,
    GivingHistory,
    GivingHistoryResponse,
    GivingResponse,
    ReceiptResponse,
    MpesaCallbackResponse
)

router = APIRouter(
    prefix="/api/finance",
    tags=["Finance"]
)

logger = logging.getLogger(__name__)


# =====================================================
# STK PUSH
# =====================================================

@router.post(
    "/stk-push",
    response_model=STKPushResponse
)
async def stk_push(
    request: STKPushRequest,
    db: Session = Depends(get_db)
):
    """
    Initiate M-Pesa STK Push
    """

    member = (
        db.query(Member)
        .filter(Member.id == request.member_id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    validate_payment(request)

    account_type = (request.account_type or "paybill").strip().lower()
    if account_type not in ("paybill", "phone"):
        raise HTTPException(status_code=400, detail="Unsupported account type.")

    # Resolve the configured receiving account
    receiving_account = None
    if request.account_number:
        receiving_account = (
            db.query(GivingAccount)
            .filter(
                GivingAccount.number == request.account_number,
                GivingAccount.account_type == account_type,
                GivingAccount.is_active == True,  # noqa: E712
            )
            .first()
        )

    # ---- PHONE account: display-only, record pending giving to pay manually ----
    if account_type == "phone":
        giving = Giving(
            member_id=member.id,
            phone_number=request.phone_number,
            category=request.category,
            amount=request.amount,
            status="Pending",
            reference=request.reference,
            safaricom_name=receiving_account.account_name if receiving_account else None,
            checkout_request_id=f"PHONE-{uuid4().hex[:20]}",
        )
        db.add(giving)
        db.commit()

        target = (
            receiving_account.number
            if receiving_account
            else (request.account_number or "")
        )

        return STKPushResponse(
            success=True,
            message=f"Pay {request.amount} to M-Pesa {account_type} {target} to complete your giving.",
            checkout_request_id="",
            merchant_request_id=None,
            customer_message=f"Pay to number {target} (Account: {receiving_account.account_name if receiving_account else 'Giving'}) "
            f"and confirm from your phone. Your giving will be recorded.",
        )

    # ---- PAYBILL account: real STK push ----
    shortcode = None
    account_ref = member.member_number
    if receiving_account:
        shortcode = receiving_account.number.strip()
        if shortcode.isdigit() and len(shortcode) == 5:
            account_ref = shortcode

    try:
        result = await mpesa_stk_push(
            phone=request.phone_number,
            amount=request.amount,
            account_reference=account_ref,
            transaction_desc=request.category,
            shortcode=shortcode,
        )
    except MpesaError as e:
        logger.error("STK push failed for member %s: %s", member.id, e)
        return STKPushResponse(
            success=False,
            message=str(e),
            checkout_request_id=None,
            merchant_request_id=None,
            customer_message=str(e),
        )
    except Exception as e:
        logger.exception("Unexpected STK push failure for member %s", member.id)
        return STKPushResponse(
            success=False,
            message="We couldn't initiate your M-Pesa request. Please try again.",
            checkout_request_id=None,
            merchant_request_id=None,
            customer_message="Unable to reach M-Pesa right now. Please try again.",
        )

    if result["success"]:
        giving = Giving(
            member_id=member.id,
            phone_number=request.phone_number,
            category=request.category,
            amount=request.amount,
            status="Pending",
            checkout_request_id=result["checkout_request_id"],
            merchant_request_id=result["merchant_request_id"],
            reference=request.reference
        )

        db.add(giving)

        try:
            db.flush()
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error("STK push DB commit failed: %s: %s", type(e).__name__, e)
            # The prompt was sent to the phone, so the user may still pay.
            # Try to persist the record so it isn't lost.
            try:
                fresh_giving = Giving(
                    member_id=member.id,
                    phone_number=request.phone_number,
                    category=request.category,
                    amount=request.amount,
                    status="Pending",
                    checkout_request_id=result["checkout_request_id"],
                    merchant_request_id=result["merchant_request_id"],
                    reference=request.reference,
                )
                db.add(fresh_giving)
                db.commit()
            except Exception as e2:
                db.rollback()
                logger.error(
                    "STK push DB retry commit also failed: %s: %s",
                    type(e2).__name__, e2,
                )

            return STKPushResponse(
                success=True,
                message=result["response_description"],
                checkout_request_id=result["checkout_request_id"],
                merchant_request_id=result["merchant_request_id"],
                customer_message="Check your phone and complete the payment. "
                "It may take a moment to appear in your history.",
            )

    return STKPushResponse(
        success=result["success"],
        message=result["response_description"],
        checkout_request_id=result["checkout_request_id"],
        merchant_request_id=result["merchant_request_id"],
        customer_message=result["customer_message"]
    )


# =====================================================
# PAYMENT STATUS (polling)
# =====================================================

STATUS_MESSAGES = {
    "Pending": "Waiting for payment confirmation.",
    "Processing": "Processing your payment.",
    "Success": "Payment completed successfully.",
    "Cancelled": "Payment was cancelled.",
    "Failed": "Payment failed."
}


@router.get(
    "/mpesa/status/{checkout_request_id}",
    response_model=PaymentStatusResponse
)
def payment_status(
    checkout_request_id: str,
    db: Session = Depends(get_db)
):
    """
    Polled by the frontend after STK push to check
    whether the M-Pesa callback has landed yet.
    """

    giving = get_giving_by_checkout(checkout_request_id, db)

    return PaymentStatusResponse(
        success=giving.status == "Success",
        status=giving.status,
        result_code=None,
        message=STATUS_MESSAGES.get(
            giving.status, "Unknown payment status."
        ),
        receipt_number=giving.receipt_number,
        transaction_id=giving.transaction_id,
        mpesa_receipt=giving.mpesa_receipt,
        safaricom_name=giving.safaricom_name,
        phone=giving.phone_number,
        amount=giving.amount,
        category=giving.category,
        transaction_date=str(giving.transaction_date) if giving.transaction_date else None
    )


# =====================================================
# RECEIPT
# =====================================================

@router.get(
    "/receipt/{transaction_id}",
    response_model=ReceiptResponse
)
def get_receipt(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns receipt details for a confirmed payment.
    """

    giving = get_giving_by_transaction(transaction_id, db)

    if giving.status != "Success":
        raise HTTPException(
            status_code=400,
            detail="Receipt is not available until payment is confirmed."
        )

    member = get_member_or_404(giving.member_id, db)

    return ReceiptResponse(
        success=True,
        receipt_number=giving.receipt_number or "",
        transaction_id=giving.transaction_id,
        member_name=member.full_name,
        member_number=member.member_number or "",
        phone_number=giving.phone_number,
        category=giving.category,
        amount=giving.amount,
        mpesa_receipt=giving.mpesa_receipt,
        status=giving.status,
        created_at=giving.created_at,
        confirmed_at=giving.confirmed_at
    )


# =====================================================
# MEMBER GIVING HISTORY
# =====================================================

@router.get(
    "/member-history/{member_number}",
    response_model=GivingHistoryResponse
)
def member_history(
    member_number: str,
    db: Session = Depends(get_db)
):
    """
    All giving records for a member, most recent first.
    """

    member = (
        db.query(Member)
        .filter(Member.member_number == member_number)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found."
        )

    records = (
        db.query(Giving)
        .filter(Giving.member_id == member.id)
        .order_by(Giving.created_at.desc())
        .all()
    )

    # receipt_number can be NULL until a payment succeeds,
    # but the schema requires a str — coerce explicitly
    # rather than passing ORM objects straight through.
    history = [
        GivingHistory(
            id=g.id,
            receipt_number=g.receipt_number or "",
            category=g.category,
            amount=g.amount,
            phone_number=g.phone_number,
            reference=None,
            status=g.status,
            mpesa_receipt=g.mpesa_receipt,
            created_at=g.created_at,
            confirmed_at=g.confirmed_at
        )
        for g in records
    ]

    return GivingHistoryResponse(
        success=True,
        total=len(history),
        history=history
    )


# =====================================================
# M-PESA CALLBACK
# =====================================================

@router.post(
    "/mpesa-callback",
    response_model=MpesaCallbackResponse
)
async def mpesa_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Safaricom Daraja STK Push callback.
    Safaricom retries this endpoint if it doesn't get
    a 200 response, so we always return one — even on
    empty/invalid bodies or internal errors.
    """

    # Log caller origin for security audit
    client_host = request.client.host if request.client else "unknown"
    logger.info("M-Pesa callback from IP: %s", client_host)

    raw_body = await request.body()

    if not raw_body:
        logger.warning("Empty M-Pesa callback body received")
        return MpesaCallbackResponse(
            success=False,
            message="Empty callback body."
        )

    try:
        callback_data = json.loads(raw_body)
    except json.JSONDecodeError:
        logger.warning(
            "Invalid JSON in M-Pesa callback body: %r", raw_body
        )
        return MpesaCallbackResponse(
            success=False,
            message="Invalid JSON in callback body."
        )

    parsed = normalize_callback(callback_data)

    giving = (
        db.query(Giving)
        .filter(
            Giving.checkout_request_id
            == parsed["checkout_request_id"]
        )
        .first()
    )

    if not giving:
        return MpesaCallbackResponse(
            success=False,
            message="Transaction not found."
        )

    if parsed["result_code"] == 0:

        giving.status = "Success"
        giving.mpesa_receipt = parsed["mpesa_receipt"]
        giving.transaction_date = parsed["transaction_date"]
        giving.confirmed_at = datetime.now(timezone.utc)

        if parsed.get("amount"):
            giving.amount = float(parsed["amount"])

        if not giving.transaction_id:
            giving.transaction_id = generate_transaction_id()

        if not giving.receipt_number:
            giving.receipt_number = generate_receipt_number(db)

    elif parsed["result_code"] == 1032:

        giving.status = "Cancelled"
        giving.confirmed_at = datetime.now(timezone.utc)

    else:

        giving.status = "Failed"
        giving.confirmed_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(giving)

    except Exception as e:
        db.rollback()

        logger.error(
            "CALLBACK DATABASE ERROR: %s: %s",
            type(e).__name__, str(e)
        )

        # Still return 200 — raising here would make Safaricom
        # retry a webhook whose DB write already failed once,
        # and per Daraja's contract we must ack receipt regardless.
        return MpesaCallbackResponse(
            success=False,
            message="Internal error while processing callback."
        )

    return MpesaCallbackResponse(
        success=True,
        message="Callback processed."
    )


# =====================================================
# HEALTH CHECK
# =====================================================

@router.get("/health")
def finance_health():
    return {
        "success": True,
        "service": "Finance API",
        "status": "Running",
        "time": datetime.now(timezone.utc)
    }


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

def generate_reference(length: int = 8) -> str:
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
# FIND GIVING (by checkout request id)
# =====================================================

def get_giving_by_checkout(
    checkout_request_id: str,
    db: Session
):
    giving = (
        db.query(Giving)
        .filter(
            Giving.checkout_request_id == checkout_request_id
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
# FIND RECEIPT (by transaction id)
# =====================================================

def get_giving_by_transaction(
    transaction_id: str,
    db: Session
):
    giving = (
        db.query(Giving)
        .filter(
            Giving.transaction_id == transaction_id
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
# ADMIN FINANCE DASHBOARD ENDPOINTS
# =====================================================

from app.dependencies import get_current_admin


@router.get("/accounts")
def get_accounts(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).all()

    accounts = {
        "main": {"name": "Main Account", "balance": 0},
        "bank": {"name": "Bank Account", "balance": 0},
        "cash": {"name": "Cash", "balance": 0},
        "mpesa": {"name": "M-Pesa", "balance": 0},
        "petty": {"name": "Petty Cash", "balance": 0},
    }

    for tx in transactions:
        key = tx.account_key or "main"
        if key in accounts:
            if tx.tx_type == "income":
                accounts[key]["balance"] += tx.amount
            else:
                accounts[key]["balance"] -= tx.amount

    return {"success": True, "accounts": accounts}


@router.get("/transactions")
def get_transactions(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .limit(200)
        .all()
    )

    return {
        "success": True,
        "transactions": [
            {
                "tx_id": tx.id,
                "tx_date": tx.created_at.strftime("%Y-%m-%d %H:%M") if tx.created_at else "",
                "tx_type": tx.tx_type,
                "category": tx.category or "",
                "account_key": tx.account_key or "main",
                "amount": str(tx.amount),
                "tx_status": tx.status,
                "description": tx.description or "",
            }
            for tx in transactions
        ]
    }


@router.post("/transaction")
async def create_transaction(
    request: Request,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    body = await request.json()

    tx_payload = body.get("txPayload", body)

    tx = Transaction(
        tx_type=tx_payload.get("type", "income"),
        category=tx_payload.get("category", ""),
        description=tx_payload.get("desc", ""),
        account_key=tx_payload.get("account", "main"),
        amount=float(tx_payload.get("amount", 0)),
        status="confirmed",
        created_by=current_admin.id,
    )

    db.add(tx)
    db.commit()
    db.refresh(tx)

    return {"success": True, "tx_id": tx.id}


@router.put("/transaction/edit")
async def edit_transaction(
    request: Request,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    body = await request.json()

    tx_id = body.get("tx_id")
    if not tx_id:
        return {"success": False, "error": "Transaction ID required."}

    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        return {"success": False, "error": "Transaction not found."}

    updates = body.get("txPayload", body)
    if "type" in updates:
        tx.tx_type = updates["type"]
    if "category" in updates:
        tx.category = updates["category"]
    if "desc" in updates:
        tx.description = updates["desc"]
    if "account" in updates:
        tx.account_key = updates["account"]
    if "amount" in updates:
        tx.amount = float(updates["amount"])

    db.commit()

    return {"success": True}