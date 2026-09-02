#!/usr/bin/env python3
"""Restore a Church CMS backup made by scripts/backup.py.

Usage
-----
    python scripts/restore.py backups/churchweb-20260101-120000.json.gz
    python scripts/restore.py backups/latest.json.gz --replace

--replace  wipes existing rows first (tables are cleared in FK-safe order,
           then the snapshot is inserted). Without it, rows are inserted on
           top of whatever is already there.

Always test restores against a throwaway copy before trusting them.
"""

import argparse
import gzip
import json
import logging
import sys
from pathlib import Path

from sqlalchemy import text

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("restore")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def load_snapshot(path):
    if str(path).endswith(".gz"):
        with gzip.open(path, "rt", encoding="utf-8") as f:
            return json.load(f)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(description="Restore the Church CMS database from a backup file.")
    parser.add_argument("file", help="Path to a .json.gz backup file")
    parser.add_argument("--replace", action="store_true", help="Clear existing data before restoring.")
    args = parser.parse_args()

    from app.database import engine
    from app.models import Base

    data = load_snapshot(Path(args.file))
    log.info("Loaded snapshot with tables: %s", ", ".join(f"{k}({len(v)})" for k, v in data.items() if v))

    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        if engine.dialect.name == "postgresql":
            conn.execute(text("SET session_replication_role = replica"))

        if args.replace:
            for table in reversed(Base.metadata.sorted_tables):
                if table.name in data:
                    conn.execute(table.delete())
            log.info("Existing rows cleared.")

        for table in Base.metadata.sorted_tables:
            rows = data.get(table.name)
            if not rows:
                continue
            conn.execute(table.insert(), rows)
            log.info("Restored %-28s %d rows", table.name, len(rows))

        if engine.dialect.name == "postgresql":
            conn.execute(text("SET session_replication_role = DEFAULT"))

    log.info("Restore finished. Verify counts in the admin dashboard.")


if __name__ == "__main__":
    main()