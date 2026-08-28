import re
import logging
from fastapi import UploadFile, HTTPException
from app.models import Member

logger = logging.getLogger(__name__)

# ==========================================
# UPLOAD SIZE LIMITS (bytes)
# ==========================================

MAX_IMAGE_SIZE = 10 * 1024 * 1024      # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024     # 100 MB
MAX_PDF_SIZE = 20 * 1024 * 1024        # 20 MB
MAX_DOCUMENT_SIZE = 5 * 1024 * 1024    # 5 MB

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
ALLOWED_PDF_TYPES = {"application/pdf"}


async def validate_upload(
    file: UploadFile,
    max_size: int = MAX_IMAGE_SIZE,
    allowed_types: set[str] | None = None,
    label: str = "File"
):
    """Validate upload file size and type. Raises HTTPException on failure."""
    if file.content_type and allowed_types:
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"{label}: unsupported type '{file.content_type}'."
            )

    # Read and check size
    contents = await file.read()
    file_size = len(contents)

    if file_size > max_size:
        max_mb = max_size // (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"{label}: file too large. Maximum size is {max_mb}MB."
        )

    # Reset file position so downstream code can read it
    await file.seek(0)
    return contents


def generate_username(full_name: str, db):
    """
    Generate a unique username from the member's full name.

    Example:
        Michael Masa -> michaelmasa
        Michael Masa (duplicate) -> michaelmasa2
    """

    # Convert to lowercase
    username = full_name.lower()

    # Remove spaces
    username = username.replace(" ", "")

    # Remove everything except letters and numbers
    username = re.sub(r"[^a-z0-9]", "", username)

    # Keep the original username
    base_username = username

    counter = 2

    # Ensure uniqueness
    while db.query(Member).filter(Member.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    return username

