import base64
import httpx
from datetime import datetime

from app.config import settings

BASE_URL = (
    "https://sandbox.safaricom.co.ke"
    if settings.MPESA_ENV == "sandbox"
    else "https://api.safaricom.co.ke"
)


async def get_access_token() -> str:
    """
    Requests a fresh OAuth token from Daraja.
    Valid for about 1 hour — call this fresh for every STK Push.
    """

    url = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            auth=(
                settings.MPESA_CONSUMER_KEY,
                settings.MPESA_CONSUMER_SECRET
            )
        )

    response.raise_for_status()

    return response.json()["access_token"]


def generate_password(timestamp: str, shortcode: str = None) -> str:
    """
    Daraja requires Base64(Shortcode + Passkey + Timestamp).
    Uses the env shortcode by default, or an override shortcode.
    """
    sc = shortcode or settings.MPESA_SHORTCODE
    raw = f"{sc}{settings.MPESA_PASSKEY}{timestamp}"

    return base64.b64encode(raw.encode()).decode()


def format_phone(phone: str) -> str:
    """
    Daraja expects phone numbers in 2547XXXXXXXX format.
    """

    phone = phone.strip().replace(" ", "")

    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif phone.startswith("+"):
        phone = phone[1:]

    return phone


async def stk_push(
    phone: str,
    amount: float,
    account_reference: str,
    transaction_desc: str,
    shortcode: str = None
) -> dict:
    """
    Sends an STK Push request to the customer's phone.
    Returns a dict matching what giving_routes.py expects.
    """
    sc = shortcode or settings.MPESA_SHORTCODE

    token = await get_access_token()

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = generate_password(timestamp, sc)
    formatted_phone = format_phone(phone)

    payload = {
        "BusinessShortCode": sc,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": formatted_phone,
        "PartyB": sc,
        "PhoneNumber": formatted_phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"{BASE_URL}/mpesa/stkpush/v1/processrequest"

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, json=payload, headers=headers)

    data = response.json()

    return {
        "success": data.get("ResponseCode") == "0",
        "response_description": data.get("ResponseDescription", ""),
        "checkout_request_id": data.get("CheckoutRequestID"),
        "merchant_request_id": data.get("MerchantRequestID"),
        "customer_message": data.get("CustomerMessage", "")
    }


def normalize_callback(callback_data: dict) -> dict:
    """
    Flattens Safaricom's nested callback payload into a
    simple dict for giving_routes.py to consume.
    """

    stk_callback = (
        callback_data
        .get("Body", {})
        .get("stkCallback", {})
    )

    result_code = stk_callback.get("ResultCode")
    checkout_request_id = stk_callback.get("CheckoutRequestID")

    parsed = {
        "checkout_request_id": checkout_request_id,
        "result_code": result_code,
        "mpesa_receipt": None,
        "transaction_date": None,
        "amount": None,
        "phone_number": None
    }

    if result_code == 0:

        items = (
            stk_callback
            .get("CallbackMetadata", {})
            .get("Item", [])
        )

        for item in items:

            name = item.get("Name")
            value = item.get("Value")

            if name == "MpesaReceiptNumber":
                parsed["mpesa_receipt"] = value
            elif name == "TransactionDate":
                parsed["transaction_date"] = str(value)
            elif name == "Amount":
                parsed["amount"] = value
            elif name == "PhoneNumber":
                parsed["phone_number"] = str(value) if value else None

    return parsed
