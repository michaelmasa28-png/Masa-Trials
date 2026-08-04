from dotenv import load_dotenv
import os

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 180)
)

# ===========================================
# M-PESA (Sandbox)
# ===========================================

MPESA_ENV = os.getenv("MPESA_ENV", "sandbox")

MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")

MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")

MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")

MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")

MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")