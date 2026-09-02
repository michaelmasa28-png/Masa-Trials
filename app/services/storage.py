"""
Persistent, CDN-backed image storage via Cloudinary.

When Cloudinary credentials are configured, uploads are sent to Cloudinary's
free-tier CDN and a full public URL is returned (and stored in the DB).
When Cloudinary is not configured (e.g. local development), uploads fall back
to saving on the local filesystem under public/uploads and a relative URL path
is returned.

Because Cloudinary URLs are absolute and served from their global CDN, we do
NOT need a redirect middleware in the app.
"""
import logging
import os
import uuid

logger = logging.getLogger(__name__)

from app.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_FOLDER,
)

UPLOAD_ROOT = "public"


def cloudinary_enabled() -> bool:
    return bool(
        CLOUDINARY_CLOUD_NAME
        and CLOUDINARY_API_KEY
        and CLOUDINARY_API_SECRET
    )


def _configure_cloudinary():
    import cloudinary

    if not cloudinary.config().cloud_name:
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True,
        )


def _local_path(rel_path: str) -> str:
    return os.path.join(UPLOAD_ROOT, rel_path.lstrip("/"))


def _public_id(sub_dir: str, filename: str) -> str:
    name = os.path.splitext(filename or "file")[0]
    safe = "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in name)
    return f"{CLOUDINARY_FOLDER}/{sub_dir.strip('/')}/{safe}_{uuid.uuid4().hex[:8]}"


# ==========================================================
# UPLOAD
# ==========================================================

def _content_type_for(filename: str, fallback: str | None) -> str:
    if fallback:
        return fallback
    lower = filename.lower()
    if lower.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith(".gif"):
        return "image/gif"
    if lower.endswith(".webp"):
        return "image/webp"
    if lower.endswith(".mp4"):
        return "video/mp4"
    if lower.endswith(".webm"):
        return "video/webm"
    if lower.endswith(".pdf"):
        return "application/pdf"
    return "application/octet-stream"


def upload_file_object(
    file,
    sub_dir: str,
    content_type: str | None = None,
    optimize_images: bool = False,
) -> str:
    """Save an upload. Returns a full Cloudinary URL or a local relative path."""
    data = file.file.read()
    original_name = getattr(file, "filename", "file") or "file"
    mime = _content_type_for(original_name, content_type or getattr(file, "content_type", None))

    if cloudinary_enabled():
        return _upload_to_cloudinary(data, sub_dir, original_name, mime, optimize_images)

    # Local fallback
    ext = os.path.splitext(original_name)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext.lower()}"
    rel_path = f"/{sub_dir.strip('/')}/{filename}"
    if optimize_images and mime.startswith("image/"):
        optimized = _optimize_image(data)
        if optimized is not None:
            data = optimized
    _write_local(rel_path, data)
    return rel_path


def _upload_to_cloudinary(data: bytes, sub_dir: str, filename: str, mime: str, optimize: bool) -> str:
    import cloudinary.uploader

    _configure_cloudinary()
    public_id = _public_id(sub_dir, filename)
    resource_type = "video" if mime.startswith("video/") else "raw" if mime == "application/pdf" else "image"

    # Apply automatic format + quality + size capping for images.
    transformation = None
    if optimize and resource_type == "image":
        transformation = {
            "fetch_format": "auto",
            "quality": "auto:good",
            "width": 1600,
            "crop": "limit",
        }

    response = cloudinary.uploader.upload(
        data,
        public_id=public_id,
        resource_type=resource_type,
        overwrite=True,
        invalidate=True,
        transformation=transformation,
    )
    # Prefer a secure URL.
    url = response.get("secure_url") or response.get("url")
    logger.info("Cloudinary upload: %s", public_id)
    return url


def _write_local(rel_path: str, data: bytes) -> None:
    local = _local_path(rel_path)
    os.makedirs(os.path.dirname(local), exist_ok=True)
    with open(local, "wb") as buf:
        buf.write(data)


def _optimize_image(data: bytes) -> bytes | None:
    try:
        from PIL import Image
        import io

        img = Image.open(io.BytesIO(data))
        if img.format not in ("JPEG", "PNG"):
            return None
        img = img.convert("RGB")
        max_dim = 2048
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim))
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=80, optimize=True, progressive=True)
        optimized = out.getvalue()
        if len(optimized) < len(data):
            return optimized
    except Exception as e:
        logger.warning("Image optimization skipped: %s", e)
    return None


def resolve_public_url(value) -> str:
    """Normalize a stored image value into a browser-loadable URL.

    Full URLs (Cloudinary) and leading-slash paths are returned unchanged.
    Relative local paths (e.g. "uploads/events/x.jpg") get a leading slash
    so they resolve against the public static mount.
    """
    value = (value or "").strip()
    if not value:
        return ""
    if value.startswith("http://") or value.startswith("https://") or value.startswith("/"):
        return value
    return "/" + value


# ==========================================================
# DELETE
# ==========================================================

def _public_id_from_url(url: str) -> str | None:
    """Extract the Cloudinary public id from a secure Cloudinary URL."""
    try:
        # https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/name_x.ext
        part = url.split("/upload/", 1)[1]
        # strip optional version segment
        segments = part.split("/")
        if segments and segments[0].startswith("v") and segments[0][1:].isdigit():
            segments = segments[1:]
        # last segment is the file name with extension
        if not segments:
            return None
        path = "/".join(segments[:-1])
        name = os.path.splitext(segments[-1])[0]
        return f"{path}/{name}" if path else name
    except Exception:
        return None


def delete_upload(url_or_path: str) -> bool:
    """Delete a stored object. Accepts a Cloudinary URL or a local path."""
    if not url_or_path:
        return False

    deleted = False
    if cloudinary_enabled() and "res.cloudinary.com" in url_or_path:
        import cloudinary.uploader

        _configure_cloudinary()
        public_id = _public_id_from_url(url_or_path)
        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
                logger.info("Cloudinary delete: %s", public_id)
                deleted = True
            except Exception as e:
                logger.warning("Cloudinary delete failed: %s", e)

    # Also attempt local delete for safety (relative paths).
    if not url_or_path.startswith("http"):
        local = _local_path(url_or_path)
        try:
            if os.path.isfile(local):
                os.remove(local)
                deleted = True
        except OSError as e:
            logger.warning("Local delete failed: %s", e)

    return deleted


# Keep for reference/back-compat if any caller greps for it.
def file_exists_locally(rel_path: str) -> bool:
    if not rel_path or rel_path.startswith("http"):
        return False
    return os.path.isfile(_local_path(rel_path))
