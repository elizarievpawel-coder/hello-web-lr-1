"""FastAPI backend and single-origin frontend hosting."""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

from app.database import Base, SessionLocal, engine
from app.routers.devices import router as devices_router
from app.seed import DEFAULT_DEVICES

FRONTEND_DIR = Path(__file__).resolve().parents[2]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Do not reinsert demo devices after a user deletes all records.
    is_first_run = not inspect(engine).has_table("devices")
    Base.metadata.create_all(bind=engine)
    if is_first_run:
        with SessionLocal() as session:
            session.add_all(DEFAULT_DEVICES)
            session.commit()
    yield


app = FastAPI(
    title="Personal Control Center API",
    description="REST API для хранения и управления карточками компьютерных устройств",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(devices_router)

for folder in ("styles", "js", "assets"):
    app.mount("/" + folder, StaticFiles(directory=FRONTEND_DIR / folder), name=folder)


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/health", tags=["Service"])
def health_check():
    return {"status": "ok"}
