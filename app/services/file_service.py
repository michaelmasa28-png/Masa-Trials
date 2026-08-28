import os
import uuid
import logging
from fastapi import UploadFile, HTTPException
from app.utils import (
    validate_upload,
    MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, MAX_PDF_SIZE,
    ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_PDF_TYPES,
)

logger = logging.getLogger(__name__)

UPLOAD_ROOT = "public/uploads"


def _save_upload(file: UploadFile, dest_dir: str) -> str:
    """Save an uploaded file and return the relative URL path."""
    os.makedirs(dest_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(dest_dir, filename)
    with open(filepath, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    return f"/{dest_dir}/{filename}"


def delete_upload(url_path: str) -> bool:
    """Delete a file from disk given its URL path (e.g. /uploads/gallery/...)."""
    if not url_path:
        return False
    physical = url_path.lstrip("/")
    physical = os.path.join("public", physical) if not physical.startswith("public/") else physical
    try:
        if os.path.isfile(physical):
            os.remove(physical)
            return True
    except OSError as e:
        logger.warning("Failed to delete file %s: %s", physical, e)
    return False


async def save_image(file: UploadFile, sub_dir: str) -> str:
    """Validate and save an image upload. Returns the relative URL path."""
    await validate_upload(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, "Image")
    dest = os.path.join(UPLOAD_ROOT, sub_dir)
    return _save_upload(file, dest)


async def save_video(file: UploadFile, sub_dir: str) -> str:
    """Validate and save a video upload. Returns the relative URL path."""
    await validate_upload(file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES, "Video")
    dest = os.path.join(UPLOAD_ROOT, sub_dir)
    return _save_upload(file, dest)


async def save_pdf(file: UploadFile, sub_dir: str) -> str:
    """Validate and save a PDF upload. Returns the relative URL path."""
    await validate_upload(file, MAX_PDF_SIZE, ALLOWED_PDF_TYPES, "PDF")
    dest = os.path.join(UPLOAD_ROOT, sub_dir)
    return _save_upload(file, dest)
