"""SQLite connection and SQLAlchemy session factory."""
from pathlib import Path
import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_FILE = Path(os.environ.get("DATABASE_PATH", str(Path(__file__).resolve().parents[1] / "devices.db"))).expanduser().resolve()
DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = "sqlite:///" + DATABASE_FILE.as_posix()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
