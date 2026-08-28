# =====================================================
# OCR UTILITIES
# Extracts name, phone, and ministry from scanned
# membership book images using Tesseract OCR.
# =====================================================
#
# Requirements:
#   pip install pytesseract Pillow
#   Install Tesseract OCR binary:
#     Windows: https://github.com/UB-Mannheim/tesseract/wiki
#     Linux:   sudo apt install tesseract-ocr
#
# =====================================================

import os
import re

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False


# Phone pattern: 07XXXXXXXX or 01XXXXXXXX (Kenyan numbers)
_PHONE_RE = re.compile(r"0[17]\d{8}")


def process_scanned_image(image_path: str, source_file: str = "") -> list[dict]:
    """
    Run OCR on a scanned membership book image.

    Returns a list of dicts:
        full_name, phone, ministry, raw_line, source_file, confidence
    """
    if not HAS_OCR:
        raise RuntimeError(
            "pytesseract/Pillow not installed. "
            "Run: pip install pytesseract Pillow"
        )

    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = Image.open(image_path)
    raw_text = pytesseract.image_to_string(img)

    return _parse_lines(raw_text, source_file)


def _parse_lines(text: str, source_file: str) -> list[dict]:
    """
    Heuristic parser: each non-empty line is treated as one
    member entry.  The first phone number found is extracted;
    the rest of the line is split into name and ministry.
    """
    results = []

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue

        phone_match = _PHONE_RE.search(line)
        phone = phone_match.group(0) if phone_match else None

        remainder = _PHONE_RE.sub("", line).strip(" ,|/-")

        parts = [p.strip() for p in remainder.split() if p.strip()]
        full_name = " ".join(parts[:3]) if len(parts) >= 3 else remainder
        ministry = parts[3] if len(parts) > 3 else None

        confidence = "high" if phone else "low"

        results.append({
            "full_name": full_name,
            "phone": phone,
            "ministry": ministry,
            "raw_line": line,
            "source_file": source_file,
            "confidence": confidence,
        })

    return results
