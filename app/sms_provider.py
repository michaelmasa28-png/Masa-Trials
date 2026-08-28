"""
==========================================================
Kingdom Ways Church CMS
SMS Provider
==========================================================

This is the ONLY file you need to touch when you pick an SMS
gateway (Africa's Talking, Twilio, etc). Every route in
communication_routes.py calls send_sms_bulk() and never talks
to a gateway directly, so swapping providers means editing
this one function only.

Until you wire a real gateway, this stub logs the message and
reports success so the rest of the communication flow (history,
stats, delivery status) can be built and tested end-to-end.

--------------------------------------------------
Example: Africa's Talking (uncomment and fill in when ready)
--------------------------------------------------
import africastalking

africastalking.initialize(
    username="YOUR_USERNAME",
    api_key="YOUR_API_KEY"
)
sms = africastalking.SMS

def send_sms_bulk(phone_numbers: list[str], message: str) -> dict:
    try:
        response = sms.send(message, phone_numbers)
        recipients = response["SMSMessageData"]["Recipients"]
        sent = sum(1 for r in recipients if r["status"] == "Success")
        failed = len(recipients) - sent
        return {"success": failed == 0, "sent": sent, "failed": failed}
    except Exception as e:
        return {"success": False, "sent": 0, "failed": len(phone_numbers), "error": str(e)}
--------------------------------------------------
"""

import logging

logger = logging.getLogger(__name__)


def send_sms_bulk(phone_numbers: list[str], message: str) -> dict:
    """
    Send `message` to every number in `phone_numbers`.
    Must always return: {"success": bool, "sent": int, "failed": int}
    """

    if not phone_numbers:
        return {"success": False, "sent": 0, "failed": 0}

    # ---- STUB: replace this block with a real gateway call ----
    logger.info("[SMS STUB] Sending to %d numbers: %s", len(phone_numbers), message[:80])
    # -------------------------------------------------------------

    return {
        "success": True,
        "sent": len(phone_numbers),
        "failed": 0
    }