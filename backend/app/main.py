"""Service Request API (FastAPI)."""
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import APP_VERSION, get_cors_origins, get_data_file
from .schemas import (
    HealthResponse,
    ServiceRequestCreate,
    ServiceRequestCreated,
    ServiceRequestList,
)
from .storage import RequestStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("service_requests.api")

app = FastAPI(title="Service Request API", version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

store = RequestStore(get_data_file())


def error_response(status: int, code: str, message: str, fields: dict | None = None) -> JSONResponse:
    body: dict = {"error": {"code": code, "message": message}}
    if fields:
        body["error"]["fields"] = fields
    return JSONResponse(status_code=status, content=body)


def _friendly(err: dict) -> str:
    kind = err.get("type", "")
    ctx = err.get("ctx", {})
    if kind == "missing":
        return "This field is required"
    if kind == "string_too_short":
        return f"Must be at least {ctx.get('min_length')} characters"
    if kind == "string_too_long":
        return f"Must be at most {ctx.get('max_length')} characters"
    if kind == "value_error":
        return str(err.get("msg", "Invalid value")).removeprefix("Value error, ")
    if kind == "string_type":
        return "Must be text"
    return err.get("msg", "Invalid value")


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError):
    fields: dict[str, str] = {}
    for err in exc.errors():
        loc = [p for p in err.get("loc", ()) if p != "body"]
        key = str(loc[-1]) if loc and isinstance(loc[-1], str) else "_form"
        fields.setdefault(key, _friendly(err))
    logger.warning("422 on %s %s: %s", request.method, request.url.path, fields)
    return error_response(422, "validation_error", "Please correct the highlighted fields.", fields)


@app.exception_handler(StarletteHTTPException)
async def handle_http_error(request: Request, exc: StarletteHTTPException):
    code = "not_found" if exc.status_code == 404 else "http_error"
    return error_response(exc.status_code, code, str(exc.detail))


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return error_response(500, "internal_error", "Something went wrong on the server.")


@app.get("/api/health", response_model=HealthResponse)
def health():
    return {
        "status": "ok",
        "service": "service-request-api",
        "version": APP_VERSION,
        "storage": store.mode,
        "time": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


@app.get("/api/requests", response_model=ServiceRequestList)
def list_requests():
    items = store.list()
    return {"data": items, "count": len(items)}


@app.post("/api/requests", response_model=ServiceRequestCreated, status_code=201)
def create_request(payload: ServiceRequestCreate):
    item = store.create(payload.model_dump())
    logger.info("Created service request #%s", item["id"])
    return {"data": item, "message": "Service request created."}
