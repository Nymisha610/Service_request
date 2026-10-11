"""Runtime configuration, read from environment variables."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

APP_VERSION = "1.0.0"
MAX_STORED_REQUESTS = 200


def _split_origins(raw: str) -> list[str]:
    # Browsers send origins without a trailing slash, so normalise what we are given.
    return [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    return _split_origins(raw)


def get_data_file() -> Path:
    configured = os.getenv("DATA_FILE", "data/requests.json")
    path = Path(configured)
    return path if path.is_absolute() else BASE_DIR / path
