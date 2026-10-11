"""Pydantic models describing what the API accepts and returns."""
import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# Control characters other than tab/newline have no place in user-submitted text.
CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean(value: object) -> object:
    if isinstance(value, str):
        return CONTROL_CHARS.sub("", value).strip()
    return value


class ServiceRequestCreate(BaseModel):
    """Body of POST /api/requests."""

    name: str = Field(min_length=2, max_length=80)
    email: str = Field(max_length=254)
    subject: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1000)

    @field_validator("name", "email", "subject", "description", mode="before")
    @classmethod
    def clean_text(cls, value: object) -> object:
        return _clean(value)

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str) -> str:
        if not EMAIL_PATTERN.match(value):
            raise ValueError("Enter a valid email address")
        return value.lower()


class ServiceRequest(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    description: str
    status: Literal["open", "in_progress", "resolved"] = "open"
    created_at: str


class ServiceRequestList(BaseModel):
    data: list[ServiceRequest]
    count: int


class ServiceRequestCreated(BaseModel):
    data: ServiceRequest
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    storage: str
    time: str
