"""Tiny JSON-file store with an in-memory fallback.

Note: on hosts with an ephemeral filesystem (for example free web services on
Render) the file is wiped on every restart, redeploy, or spin-down. Treat the
data as demo data.
"""
import json
import logging
import threading
from datetime import datetime, timezone
from pathlib import Path

from .config import MAX_STORED_REQUESTS

logger = logging.getLogger("service_requests.storage")

SEED_FILE = Path(__file__).resolve().parent / "seed_data.json"


class RequestStore:
    def __init__(self, data_file: Path):
        self._file = data_file
        self._lock = threading.Lock()
        self._items: list[dict] = []
        self.mode = "file"
        self._load()

    def _load(self) -> None:
        seed = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        try:
            if self._file.exists():
                self._items = json.loads(self._file.read_text(encoding="utf-8"))
            else:
                self._items = seed
                self._persist()
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Could not use %s (%s); falling back to memory", self._file, exc)
            self._items = seed
            self.mode = "memory"

    def _persist(self) -> None:
        if self.mode != "file":
            return
        try:
            self._file.parent.mkdir(parents=True, exist_ok=True)
            self._file.write_text(json.dumps(self._items, indent=2), encoding="utf-8")
        except OSError as exc:
            logger.warning("Could not write %s (%s); switching to memory", self._file, exc)
            self.mode = "memory"

    def list(self) -> list[dict]:
        with self._lock:
            return sorted(self._items, key=lambda i: i["id"], reverse=True)

    def create(self, payload: dict) -> dict:
        with self._lock:
            next_id = max((i["id"] for i in self._items), default=0) + 1
            item = {
                "id": next_id,
                **payload,
                "status": "open",
                "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            self._items.append(item)
            self._items = self._items[-MAX_STORED_REQUESTS:]
            self._persist()
            return item
