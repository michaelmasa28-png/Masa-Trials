#!/usr/bin/env python3
"""Zero-cost database backup for Kingdom Ways Church CMS.

Creates gzipped JSON snapshots of every table into backups/ and optionally
pushes them to Cloudinary (as raw files) using your existing free credentials.

Examples
--------
Local / server:
    python scripts/backup.py                       # keeps last 14 snapshots
    python scripts/backup.py --keep 30
    python scripts/backup.py --skip-cloudinary

Windows Task Scheduler:
    C:\\path\\to\\venv\\Scripts\\python.exe C:\\path\\to\\churchweb\\scripts\\backup.py

Render / any Linux cron (daily at 3am):
    0 3 * * * cd /app && python scripts/backup.py >> /var/log/backup.log 2>&1
"""

import argparse
import gzip
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("backup")

BACKUP_DIR = PROJECT_ROOT / "backups"
BACKUP_PREFIX = "churchweb-"


def dump_rows(engine):
    """Read every tracked table into a {table_name: [row, ...]} dict."""
    from app.models import Base

    snapshot = {}
    with engine.connect() as conn:
        for table in Base.metadata.sorted_tables:
            rows = conn.execute(table.select()).mappings().all()
            snapshot[table.name] = [dict(r) for r in rows]
    return snapshot


def write_snapshot(snapshot, dest_dir):
    dest_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = dest_dir / f"{BACKUP_PREFIX}{stamp}.json.gz"
    with gzip.open(path, "wt", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, default=str)
    total = sum(len(rows) for rows in snapshot.values())
    log.info("Backup written: %s (%d rows across %d tables)", path, total, len(snapshot))
    return path


def prune(dest_dir, keep):
    backups = sorted(dest_dir.glob(f"{BACKUP_PREFIX}*.json.gz"), key=lambda p: p.stat().st_mtime)
    for old in backups[: max(0, len(backups) - keep)]:
        old.unlink()
        log.info("Pruned old backup: %s", old)


def upload_cloudinary(path):
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    api_key = os.getenv("CLOUDINARY_API_KEY", "")
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "")
    if not (cloud_name and api_key and api_secret):
        log.info("Cloudinary not configured - skipping offsite copy.")
        return
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    resp = cloudinary.uploader.upload(
        str(path),
        resource_type="raw",
        folder="backups",
        use_filename=True,
        unique_filename=True,
        overwrite=False,
    )
    log.info("Offsite copy pushed to Cloudinary: %s", resp.get("secure_url"))


def main():
    parser = argparse.ArgumentParser(description="Backup the Church CMS database.")
    parser.add_argument("--keep", type=int, default=14, help="Number of backups to keep locally (default 14).")
    parser.add_argument("--skip-cloudinary", action="store_true", help="Do not push an offsite copy to Cloudinary.")
    args = parser.parse_args()

    from app.database import engine

    if engine.dialect.name not in ("sqlite", "postgresql"):
        log.error("Unsupported database dialect: %s", engine.dialect.name)
        raise SystemExit(1)

    snapshot = dump_rows(engine)
    path = write_snapshot(snapshot, BACKUP_DIR)
    prune(BACKUP_DIR, args.keep)
    if not args.skip_cloudinary:
        upload_cloudinary(path)
    log.info("Backup finished.")


if __name__ == "__main__":
    main()