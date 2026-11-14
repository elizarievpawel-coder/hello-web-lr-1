"""Request and response schemas with server-side validation."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DeviceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    description: str = Field(min_length=3, max_length=120)
    os: str = Field(min_length=2, max_length=50)
    details: list[str] = Field(default_factory=list, max_length=20)
    status: Literal["Online", "Offline"] = "Offline"
    image: str = Field(default="assets/images/tn.jpg", min_length=1, max_length=300)
    alt: str = Field(default="Изображение устройства", min_length=1, max_length=200)

    @field_validator("name", "description", "os", "image", "alt", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("details")
    @classmethod
    def check_details(cls, value: list[str]) -> list[str]:
        if any(not isinstance(item, str) or len(item.strip()) > 160 for item in value):
            raise ValueError("Каждая характеристика должна быть строкой длиной до 160 символов")
        return [item.strip() for item in value if item.strip()]


class DeviceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=50)
    description: str | None = Field(default=None, min_length=3, max_length=120)
    os: str | None = Field(default=None, min_length=2, max_length=50)
    details: list[str] | None = Field(default=None, max_length=20)
    status: Literal["Online", "Offline"] | None = None
    image: str | None = Field(default=None, min_length=1, max_length=300)
    alt: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("name", "description", "os", "image", "alt", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("details")
    @classmethod
    def check_details(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        if any(not isinstance(item, str) or len(item.strip()) > 160 for item in value):
            raise ValueError("Каждая характеристика должна быть строкой длиной до 160 символов")
        return [item.strip() for item in value if item.strip()]


class DeviceRead(DeviceCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
