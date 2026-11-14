"""Persistent device model."""
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, JSON, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Device(Base):
    __tablename__ = "devices"
    __table_args__ = (
        CheckConstraint("status IN ('Online', 'Offline')", name="ck_devices_status"),
        UniqueConstraint("name", name="uq_devices_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(120), nullable=False)
    os: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(7), nullable=False, default="Offline")
    image: Mapped[str] = mapped_column(String(300), nullable=False, default="assets/images/tn.jpg")
    alt: Mapped[str] = mapped_column(String(200), nullable=False, default="Изображение устройства")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.current_timestamp())
