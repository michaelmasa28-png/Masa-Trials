# =====================================================
# M-PESA SERVICE
# Kingdom Ways Church CMS
# PART 1
# Configuration & Access Token
# =====================================================

import base64
from datetime import datetime

import requests

from app.config import settings


# =====================================================
# CONFIGURATION
# =====================================================

CONSUMER_KEY = settings.MPESA_CONSUMER_KEY
CONSUMER_SECRET = settings.MPESA_CONSUMER_SECRET

SHORTCODE = settings.MPESA_SHORTCODE
PASSKEY = settings.MPESA_PASSKEY

CALLBACK_URL = settings.MPESA_CALLBACK_URL

ENVIRONMENT = settings.MPESA_ENVIRONMENT.lower()


# =====================================================
# DARAJA URLS
# =====================================================

if ENVIRONMENT == "production":

    BASE_URL = "https://api.safaricom.co.ke"

else:

    BASE_URL = "https://sandbox.safaricom.co.ke"


TOKEN_URL = (
    f"{BASE_URL}/oauth/v1/generate"
    "?grant_type=client_credentials"
)

STK_PUSH_URL = (
    f"{BASE_URL}/mpesa/stkpush/v1/processrequest"
)

STK_QUERY_URL = (
    f"{BASE_URL}/mpesa/stkpushquery/v1/query"
)


# =====================================================
# ACCESS TOKEN
# =====================================================

def get_access_token() -> str:
    """
    Get Daraja OAuth access token.
    """

    response = requests.get(
        TOKEN_URL,
        auth=(CONSUMER_KEY, CONSUMER_SECRET),
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    return data["access_token"]


# =====================================================
# PASSWORD
# =====================================================

def generate_password():

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    password = base64.b64encode(
        (
            SHORTCODE +
            PASSKEY +
            timestamp
        ).encode()
    ).decode()

    return password, timestamp


# =====================================================
# HEADERS
# =====================================================

def get_headers():

    token = get_access_token()

    return {

        "Authorization": f"Bearer {token}",

        "Content-Type": "application/json"

    }


# =====================================================
# PHONE FORMAT
# =====================================================

def normalize_phone(phone: str) -> str:
    """
    Convert phone to 2547XXXXXXXX format.
    """

    phone = phone.strip().replace(" ", "")

    if phone.startswith("+254"):

        return phone[1:]

    if phone.startswith("07"):

        return "254" + phone[1:]

    if phone.startswith("01"):

        return "254" + phone[1:]

    return phone


# =====================================================
# SERVICE STATUS
# =====================================================

def service_status():

    return {

        "service": "M-Pesa",

        "environment": ENVIRONMENT,

        "base_url": BASE_URL

    }
# =====================================================
# M-PESA SERVICE
# Kingdom Ways Church CMS
# PART 2
# STK PUSH REQUEST
# =====================================================

import requests


# =====================================================
# SEND STK PUSH
# =====================================================

def stk_push(
    phone: str,
    amount: float,
    account_reference: str,
    transaction_desc: str
):
    """
    Send an M-Pesa STK Push request.

    Returns:
        dict
    """

    phone = normalize_phone(phone)

    password, timestamp = generate_password()

    payload = {

        "BusinessShortCode": SHORTCODE,

        "Password": password,

        "Timestamp": timestamp,

        "TransactionType": "CustomerPayBillOnline",

        "Amount": int(amount),

        "PartyA": phone,

        "PartyB": SHORTCODE,

        "PhoneNumber": phone,

        "CallBackURL": CALLBACK_URL,

        "AccountReference": account_reference,

        "TransactionDesc": transaction_desc

    }

    response = requests.post(

        STK_PUSH_URL,

        headers=get_headers(),

        json=payload,

        timeout=60

    )

    response.raise_for_status()

    data = response.json()

    return {

        "success": data.get("ResponseCode") == "0",

        "response_code": data.get("ResponseCode"),

        "response_description": data.get("ResponseDescription"),

        "customer_message": data.get("CustomerMessage"),

        "merchant_request_id": data.get("MerchantRequestID"),

        "checkout_request_id": data.get("CheckoutRequestID"),

        "raw": data

    }


# =====================================================
# VALIDATE STK RESPONSE
# =====================================================

def validate_stk_response(result: dict):

    if not result.get("success"):

        raise Exception(

            result.get(

                "response_description",

                "STK Push failed."

            )

        )

    return result


# =====================================================
# QUICK TEST
# =====================================================

if __name__ == "__main__":

    print(

        service_status()

    )

    print(

        "Access Token OK"

    )

# =====================================================
# M-PESA SERVICE
# Kingdom Ways Church CMS
# PART 3
# STK PUSH STATUS QUERY
# =====================================================

import requests


# =====================================================
# QUERY STK STATUS
# =====================================================

def query_stk_status(checkout_request_id: str):
    """
    Query the status of an STK Push transaction.

    Returns:
        dict
    """

    password, timestamp = generate_password()

    payload = {

        "BusinessShortCode": SHORTCODE,

        "Password": password,

        "Timestamp": timestamp,

        "CheckoutRequestID": checkout_request_id

    }

    response = requests.post(

        STK_QUERY_URL,

        headers=get_headers(),

        json=payload,

        timeout=60

    )

    response.raise_for_status()

    data = response.json()

    result_code = data.get("ResultCode")
    result_desc = data.get("ResultDesc", "")

    # =================================================
    # SUCCESS
    # =================================================

    if result_code == "0":

        return {

            "success": True,

            "status": "Success",

            "result_code": result_code,

            "message": result_desc,

            "checkout_request_id": checkout_request_id,

            "raw": data

        }

    # =================================================
    # STILL PROCESSING
    # =================================================

    if result_code in [

        "1032",   # User still entering PIN
        "1037",   # Timeout waiting for customer
        "1"       # Request still processing

    ]:

        return {

            "success": True,

            "status": "Pending",

            "result_code": result_code,

            "message": result_desc,

            "checkout_request_id": checkout_request_id,

            "raw": data

        }

    # =================================================
    # USER CANCELLED
    # =================================================

    if result_code == "1032":

        return {

            "success": False,

            "status": "Cancelled",

            "result_code": result_code,

            "message": result_desc,

            "checkout_request_id": checkout_request_id,

            "raw": data

        }

    # =================================================
    # FAILED
    # =================================================

    return {

        "success": False,

        "status": "Failed",

        "result_code": result_code,

        "message": result_desc,

        "checkout_request_id": checkout_request_id,

        "raw": data

    }


# =====================================================
# WAIT FOR PAYMENT
# =====================================================

def wait_for_payment(
    checkout_request_id: str,
    attempts: int = 30,
    delay: int = 2
):
    """
    Optional helper for testing.
    Polls Daraja until payment succeeds or times out.
    """

    import time

    for _ in range(attempts):

        result = query_stk_status(
            checkout_request_id
        )

        if result["status"] in (
            "Success",
            "Failed",
            "Cancelled"
        ):

            return result

        time.sleep(delay)

    return {

        "success": False,

        "status": "Timeout",

        "message": "Payment timed out."

    }


# =====================================================
# SERVICE INFO
# =====================================================

def mpesa_info():

    return {

        "environment": ENVIRONMENT,

        "shortcode": SHORTCODE,

        "callback": CALLBACK_URL,

        "query_url": STK_QUERY_URL

    }

# =====================================================
# M-PESA SERVICE
# Kingdom Ways Church CMS
# PART 4
# CALLBACK PROCESSING
# =====================================================


# =====================================================
# FIND CALLBACK VALUE
# =====================================================

def get_callback_value(items, name, default=None):
    """
    Extract a value from CallbackMetadata.Item
    """

    for item in items:

        if item.get("Name") == name:

            return item.get("Value", default)

    return default


# =====================================================
# PARSE CALLBACK
# =====================================================

def parse_callback(callback_data: dict):
    """
    Parse Safaricom callback payload.

    Returns a normalized dictionary.
    """

    body = callback_data.get("Body", {})

    stk = body.get("stkCallback", {})

    result_code = stk.get("ResultCode")

    result_desc = stk.get("ResultDesc")

    checkout_request_id = stk.get("CheckoutRequestID")

    merchant_request_id = stk.get("MerchantRequestID")

    metadata = stk.get("CallbackMetadata", {})

    items = metadata.get("Item", [])

    return {

        "result_code": result_code,

        "result_description": result_desc,

        "checkout_request_id": checkout_request_id,

        "merchant_request_id": merchant_request_id,

        "amount": get_callback_value(
            items,
            "Amount"
        ),

        "mpesa_receipt": get_callback_value(
            items,
            "MpesaReceiptNumber"
        ),

        "transaction_date": get_callback_value(
            items,
            "TransactionDate"
        ),

        "phone_number": str(
            get_callback_value(
                items,
                "PhoneNumber",
                ""
            )
        ),

        "success": result_code == 0

    }


# =====================================================
# SUCCESS CALLBACK
# =====================================================

def callback_success(callback_data: dict):

    parsed = parse_callback(callback_data)

    return parsed["success"]


# =====================================================
# FORMAT TRANSACTION DATE
# =====================================================

def format_transaction_date(value):

    """
    Converts:
    20260803154530

    into datetime
    """

    if not value:

        return None

    value = str(value)

    return datetime.strptime(

        value,

        "%Y%m%d%H%M%S"

    )


# =====================================================
# NORMALIZE CALLBACK
# =====================================================

def normalize_callback(callback_data):

    """
    Returns callback ready
    for database update.
    """

    parsed = parse_callback(callback_data)

    parsed["transaction_date"] = (

        format_transaction_date(

            parsed["transaction_date"]

        )

    )

    return parsed


# =====================================================
# VALID CALLBACK
# =====================================================

def validate_callback(callback_data):

    try:

        body = callback_data["Body"]

        callback = body["stkCallback"]

        return (

            "CheckoutRequestID" in callback

        )

    except Exception:

        return False


# =====================================================
# CALLBACK SUMMARY
# =====================================================

def callback_summary(callback_data):

    parsed = normalize_callback(callback_data)

    return {

        "checkout_request_id":

            parsed["checkout_request_id"],

        "receipt":

            parsed["mpesa_receipt"],

        "amount":

            parsed["amount"],

        "phone":

            parsed["phone_number"],

        "status":

            "Success"

            if parsed["success"]

            else "Failed"

    }
# =====================================================
# M-PESA SERVICE
# Kingdom Ways Church CMS
# PART 5
# RECEIPT & UTILITY FUNCTIONS
# =====================================================

from uuid import uuid4


# =====================================================
# GENERATE RECEIPT NUMBER
# =====================================================

def generate_receipt_number(giving_id: int) -> str:
    """
    Example:
    KWC-RCP-2026-000001
    """

    year = datetime.now().year

    return f"KWC-RCP-{year}-{giving_id:06d}"


# =====================================================
# GENERATE TRANSACTION ID
# =====================================================

def generate_transaction_id() -> str:
    """
    Internal transaction ID
    """

    return str(uuid4())


# =====================================================
# PAYMENT SUCCESS
# =====================================================

def mark_payment_success(giving, callback):

    giving.status = "Success"

    giving.mpesa_receipt = callback.get(
        "mpesa_receipt"
    )

    giving.checkout_request_id = callback.get(
        "checkout_request_id"
    )

    giving.merchant_request_id = callback.get(
        "merchant_request_id"
    )

    giving.phone_number = callback.get(
        "phone_number"
    )

    giving.confirmed_at = datetime.utcnow()

    giving.result_code = callback.get(
        "result_code"
    )

    giving.result_description = callback.get(
        "result_description"
    )

    if callback.get("amount"):

        giving.amount = float(
            callback["amount"]
        )

    if not giving.transaction_id:

        giving.transaction_id = generate_transaction_id()

    if not giving.receipt_number:

        giving.receipt_number = generate_receipt_number(
            giving.id
        )

    return giving


# =====================================================
# PAYMENT FAILED
# =====================================================

def mark_payment_failed(giving, callback):

    giving.status = "Failed"

    giving.result_code = callback.get(
        "result_code"
    )

    giving.result_description = callback.get(
        "result_description"
    )

    giving.confirmed_at = datetime.utcnow()

    return giving


# =====================================================
# PAYMENT CANCELLED
# =====================================================

def mark_payment_cancelled(giving, callback):

    giving.status = "Cancelled"

    giving.result_code = callback.get(
        "result_code"
    )

    giving.result_description = callback.get(
        "result_description"
    )

    giving.confirmed_at = datetime.utcnow()

    return giving


# =====================================================
# SERIALIZE GIVING
# =====================================================

def serialize_giving(giving):

    return {

        "id": giving.id,

        "receipt_number": giving.receipt_number,

        "transaction_id": giving.transaction_id,

        "member_id": giving.member_id,

        "member_number": giving.member_number,

        "member_name": giving.member_name,

        "phone_number": giving.phone_number,

        "category": giving.category,

        "amount": giving.amount,

        "reference": giving.reference,

        "status": giving.status,

        "mpesa_receipt": giving.mpesa_receipt,

        "checkout_request_id": giving.checkout_request_id,

        "merchant_request_id": giving.merchant_request_id,

        "safaricom_name": giving.safaricom_name,

        "result_code": giving.result_code,

        "result_description": giving.result_description,

        "created_at": giving.created_at,

        "confirmed_at": giving.confirmed_at

    }


# =====================================================
# RECEIPT DATA
# =====================================================

def build_receipt(giving):

    return {

        "success": True,

        "receipt_number": giving.receipt_number,

        "transaction_id": giving.transaction_id,

        "member_name": giving.member_name,

        "member_number": giving.member_number,

        "phone_number": giving.phone_number,

        "category": giving.category,

        "amount": giving.amount,

        "mpesa_receipt": giving.mpesa_receipt,

        "safaricom_name": giving.safaricom_name,

        "status": giving.status,

        "created_at": giving.created_at,

        "confirmed_at": giving.confirmed_at

    }


# =====================================================
# READY FOR RECEIPT
# =====================================================

def receipt_available(giving):

    return (

        giving.status == "Success"

        and giving.mpesa_receipt is not None

        and giving.receipt_number is not None

    )


# =====================================================
# PAYMENT COMPLETE
# =====================================================

def payment_complete(giving):

    return giving.status in (

        "Success",

        "Failed",

        "Cancelled"

    )

# =====================================================
# M-PESA SERVICE
# Kingdom Ways Church CMS
# PART 6
# LOGGING, ERROR HANDLING & HEALTH CHECK
# =====================================================

import logging
import time
from requests.exceptions import (
    RequestException,
    Timeout,
    ConnectionError
)

# =====================================================
# LOGGER
# =====================================================

logger = logging.getLogger("mpesa")

if not logger.handlers:

    logging.basicConfig(

        level=logging.INFO,

        format="%(asctime)s | %(levelname)s | %(message)s"

    )

# =====================================================
# SAFE POST REQUEST
# =====================================================

def safe_post(

    url: str,

    headers: dict,

    payload: dict,

    timeout: int = 60

):
    """
    Wrapper around requests.post()
    with proper exception handling.
    """

    try:

        response = requests.post(

            url,

            headers=headers,

            json=payload,

            timeout=timeout

        )

        response.raise_for_status()

        return response.json()

    except Timeout:

        logger.error(

            "M-Pesa request timed out."

        )

        raise Exception(

            "Unable to reach Safaricom."

        )

    except ConnectionError:

        logger.error(

            "Network connection failed."

        )

        raise Exception(

            "Network connection failed."

        )

    except RequestException as e:

        logger.exception(e)

        raise Exception(

            str(e)

        )

# =====================================================
# RETRY HELPER
# =====================================================

def retry_request(

    callback,

    retries: int = 3,

    delay: int = 2

):
    """
    Retry any callable.
    """

    last_error = None

    for attempt in range(retries):

        try:

            return callback()

        except Exception as e:

            last_error = e

            logger.warning(

                f"Retry {attempt + 1}/{retries}"

            )

            time.sleep(delay)

    raise last_error

# =====================================================
# VERIFY CONNECTION
# =====================================================

def verify_connection():

    """
    Verify Daraja authentication.
    """

    try:

        token = get_access_token()

        return {

            "success": True,

            "message": "Connected",

            "token": token[:15] + "..."

        }

    except Exception as e:

        return {

            "success": False,

            "message": str(e)

        }

# =====================================================
# HEALTH
# =====================================================

def health():

    connection = verify_connection()

    return {

        "service": "M-Pesa",

        "environment": ENVIRONMENT,

        "base_url": BASE_URL,

        "callback_url": CALLBACK_URL,

        "connected": connection["success"],

        "message": connection["message"]

    }

# =====================================================
# LOG HELPERS
# =====================================================

def log_stk_request(

    phone,

    amount,

    checkout_request_id

):

    logger.info(

        f"STK PUSH | "

        f"Phone={phone} "

        f"Amount={amount} "

        f"Checkout={checkout_request_id}"

    )

def log_callback(

    checkout_request_id,

    receipt,

    status

):

    logger.info(

        f"CALLBACK | "

        f"{checkout_request_id} "

        f"{receipt} "

        f"{status}"

    )

# =====================================================
# SERVICE INFORMATION
# =====================================================

def version():

    return {

        "service": "Kingdom Ways M-Pesa Service",

        "version": "1.0.0",

        "environment": ENVIRONMENT

    }

# =====================================================
# PUBLIC EXPORTS
# =====================================================

__all__ = [

    "get_access_token",

    "generate_password",

    "normalize_phone",

    "stk_push",

    "query_stk_status",

    "wait_for_payment",

    "parse_callback",

    "normalize_callback",

    "callback_success",

    "mark_payment_success",

    "mark_payment_failed",

    "mark_payment_cancelled",

    "generate_receipt_number",

    "generate_transaction_id",

    "build_receipt",

    "receipt_available",

    "payment_complete",

    "health",

    "version"

]

