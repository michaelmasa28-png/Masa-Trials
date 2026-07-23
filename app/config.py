from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Neon / Production
DATABASE_URL = os.getenv("DATABASE_URL")

# Database settings
DATABASE_URL = os.getenv("DATABASE_URL")

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 180)
)
