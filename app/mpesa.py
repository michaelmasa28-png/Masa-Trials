import base64
import logging
from datetime import datetime, timezone, timedelta
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = (
    "https://sandbox.safaricom.co.ke"
    if settings.MPESA_ENV == "sandbox"
    else "https://api.safaricom.co.ke"
)


class MpesaError(Exception):
    """Raised for any M-Pesa API failure with a user-safe message."""


def _check_config() -> None:
    """Fail fast with a clear message when M-Pesa credentials are missing."""
    missing = [
        name
        for name, value in (
            ("consumer key", settings.MPESA_CONSUMER_KEY),
            ("consumer secret", settings.MPESA_CONSUMER_SECRET),
            ("shortcode", settings.MPESA_SHORTCODE),
            ("passkey", settings.MPESA_PASSKEY),
            ("callback url", settings.MPESA_CALLBACK_URL),
        )
        if not value
    ]
    if missing:
        raise MpesaError(
            "M-Pesa is not fully configured on the server "
            f"(missing: {', '.join(missing)}). Please contact the church office."
        )


async def get_access_token() -> str:
    """
    Requests a fresh OAuth token from Daraja.
    Valid for about 1 hour — call this fresh for every STK Push.
    Raises MpesaError on any failure so callers can show a friendly message.
    """
    _check_config()

    url = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                url,
                auth=(
                    settings.MPESA_CONSUMER_KEY,
                    settings.MPESA_CONSUMER_SECRET
                )
            )
    except httpx.TimeoutException:
        logger.error("M-Pesa token request timed out")
        raise MpesaError(
            "M-Pesa service timed out. Please try again in a moment."
        )
    except httpx.HTTPError as e:
        logger.error("M-Pesa token request network error: %s", e)
        raise MpesaError(
            "Could not reach the M-Pesa service. Please try again later."
        )

    if response.status_code != 200:
        logger.error(
            "M-Pesa token request failed: HTTP %s - %s",
            response.status_code, response.text[:200],
        )
        raise MpesaError(
            "M-Pesa authorization failed. The configured credentials may be "
            "invalid. Please contact the church office."
        )

    try:
        data = response.json()
    except ValueError:
        logger.error("M-Pesa token response was not valid JSON")
        raise MpesaError("Received an invalid response from M-Pesa. Try again.")

    token = data.get("access_token")
    if not token:
        logger.error("M-Pesa token response missing access_token: %s", data)
        raise MpesaError("M-Pesa did not grant access. Try again later.")

    return token


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

    # Daraja requires the timestamp in East Africa Time (UTC+3).
    # Render servers run on UTC, so datetime.now() alone would be
    # 3 hours late and M-Pesa would reject the generated password.
    eat_tz = timezone(timedelta(hours=3))
    timestamp = datetime.now(eat_tz).strftime("%Y%m%d%H%M%S")
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

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, json=payload, headers=headers)
    except httpx.TimeoutException:
        logger.error("M-Pesa STK push request timed out")
        raise MpesaError(
            "The M-Pesa request timed out. Please try again in a moment."
        )
    except httpx.HTTPError as e:
        logger.error("M-Pesa STK push network error: %s", e)
        raise MpesaError(
            "Could not reach the M-Pesa service. Please try again later."
        )

    try:
        data = response.json()
    except ValueError:
        logger.error(
            "M-Pesa STK push returned HTTP %s with non-JSON body: %s",
            response.status_code, response.text[:200],
        )
        raise MpesaError(
            "Received an invalid response from M-Pesa. Please try again."
        )

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
                parsed["transaction_date"] = _parse_mpesa_date(value)
            elif name == "Amount":
                parsed["amount"] = value
            elif name == "PhoneNumber":
                parsed["phone_number"] = str(value) if value else None

    return parsed


def _parse_mpesa_date(value):
    """
    Safaricom sends TransactionDate as YYYYMMDDHHMMSS (local time, EAT).
    Convert to an aware datetime so it can be stored in a DateTime column.
    Returns None on any unexpected value instead of crashing the callback.
    """
    if not value:
        return None

    try:
        raw = str(value).strip()
        if not raw.isdigit():
            return None
        # Safaricom timestamp is local East Africa Time (EAT = UTC+3).
        local = datetime.strptime(raw, "%Y%m%d%H%M%S")
        return local.replace(tzinfo=timezone(timedelta(hours=3)))
    except (ValueError, TypeError):
        logger.warning("Unparseable M-Pesa transaction date: %r", value)
        return None
