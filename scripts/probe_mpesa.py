import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings  # noqa: E402
from app.mpesa import get_access_token, stk_push, format_phone  # noqa: E402


async def main():
    print("DATA_ENV   :", settings.MPESA_ENV)
    print("SHORTCODE  :", settings.MPESA_SHORTCODE)
    print("CALLBACK   :", settings.MPESA_CALLBACK_URL)
    print("KEY_LEN    :", len(settings.MPESA_CONSUMER_KEY or ""))
    print("SECRET_LEN :", len(settings.MPESA_CONSUMER_SECRET or ""))
    print("PASSKEY_LEN:", len(settings.MPESA_PASSKEY or ""))
    print("PHONE      :", format_phone("0708374149"))

    token = await get_access_token()
    print("TOKEN_OK   :", bool(token))

    result = await stk_push(
        phone="0708374149",       # standard Daraja sandbox test MSISDN
        amount=1,
        account_reference="GIVING",
        transaction_desc="Test",
    )
    print("RESULT     :", result)


if __name__ == "__main__":
    asyncio.run(main())