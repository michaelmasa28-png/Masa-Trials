import logging
from fastapi import UploadFile
from app.utils import (
    validate_upload,
    MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, MAX_PDF_SIZE,
    ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_PDF_TYPES,
)
from app.services import storage

logger = logging.getLogger(__name__)


async def save_image(file: UploadFile, sub_dir: str) -> str:
    """Validate and save an image upload. Returns the relative URL path."""
    await validate_upload(file, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, "Image")
    return storage.upload_file_object(file, sub_dir, optimize_images=True)


async def save_video(file: UploadFile, sub_dir: str) -> str:
    """Validate and save a video upload. Returns the relative URL path."""
    await validate_upload(file, MAX_VIDEO_SIZE, ALLOWED_VIDEO_TYPES, "Video")
    return storage.upload_file_object(file, sub_dir)


async def save_pdf(file: UploadFile, sub_dir: str) -> str:
    """Validate and save a PDF upload. Returns the relative URL path."""
    await validate_upload(file, MAX_PDF_SIZE, ALLOWED_PDF_TYPES, "PDF")
    return storage.upload_file_object(file, sub_dir)
