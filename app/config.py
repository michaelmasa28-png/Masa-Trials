from dotenv import load_dotenv
import os

load_dotenv()

# ===========================================
# DATABASE CONFIGURATION
# Supports both PostgreSQL and SQLite
# ===========================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./church_cms.db")

# Auto-detect database type from URL
DATABASE_TYPE = "postgresql" if DATABASE_URL.startswith("postgresql") else "sqlite"

# ===========================================
# SECURITY
# ===========================================

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_a_long_random_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 180)
)

# ===========================================
# CORS
# ===========================================

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:8000").split(",")

# ===========================================
# M-PESA (Sandbox)
# ===========================================

MPESA_ENV = os.getenv("MPESA_ENV", "sandbox")
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY", "")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL", "")
MPESA_CALLBACK_SECRET = os.getenv("MPESA_CALLBACK_SECRET", "")


class Settings:
    DATABASE_URL = DATABASE_URL
    DATABASE_TYPE = DATABASE_TYPE
    SECRET_KEY = SECRET_KEY
    ALGORITHM = ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES = ACCESS_TOKEN_EXPIRE_MINUTES

    MPESA_ENV = MPESA_ENV
    MPESA_CONSUMER_KEY = MPESA_CONSUMER_KEY
    MPESA_CONSUMER_SECRET = MPESA_CONSUMER_SECRET
    MPESA_SHORTCODE = MPESA_SHORTCODE
    MPESA_PASSKEY = MPESA_PASSKEY
    MPESA_CALLBACK_URL = MPESA_CALLBACK_URL
    MPESA_CALLBACK_SECRET = MPESA_CALLBACK_SECRET

    CORS_ORIGINS = CORS_ORIGINS


settings = Settings()