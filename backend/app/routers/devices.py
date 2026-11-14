"""REST API for devices: full CRUD plus validation and HTTP statuses."""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Device
from app.schemas import DeviceCreate, DeviceRead, DeviceUpdate

router = APIRouter(prefix="/api/devices", tags=["Devices"])


def find_device(db: Session, device_id: int) -> Device:
    device = db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Устройство не найдено")
    return device


def ensure_unique_name(db: Session, name: str, except_id: int | None = None) -> None:
    query = select(Device.id).where(func.lower(Device.name) == name.lower())
    if except_id is not None:
        query = query.where(Device.id != except_id)
    if db.scalar(query.limit(1)) is not None:
        raise HTTPException(status_code=400, detail="Устройство с таким названием уже существует")


@router.get("", response_model=list[DeviceRead], summary="Получить все устройства")
def list_devices(db: Session = Depends(get_db)):
    return db.scalars(select(Device).order_by(Device.id)).all()


@router.get("/{device_id}", response_model=DeviceRead, summary="Получить устройство по ID",
            responses={404: {"description": "Устройство не найдено"}})
def get_device(device_id: int, db: Session = Depends(get_db)):
    return find_device(db, device_id)


@router.post("", response_model=DeviceRead, status_code=status.HTTP_201_CREATED,
             summary="Добавить устройство",
             responses={400: {"description": "Повторяющееся название"}})
def create_device(data: DeviceCreate, db: Session = Depends(get_db)):
    ensure_unique_name(db, data.name)
    device = Device(**data.model_dump())
    db.add(device)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Нельзя добавить устройство с таким названием")
    db.refresh(device)
    return device


@router.patch("/{device_id}", response_model=DeviceRead, summary="Изменить устройство",
              responses={400: {"description": "Повторяющееся название"},
                         404: {"description": "Устройство не найдено"}})
def update_device(device_id: int, data: DeviceUpdate, db: Session = Depends(get_db)):
    device = find_device(db, device_id)
    updates = data.model_dump(exclude_unset=True)
    if any(value is None for value in updates.values()):
        raise HTTPException(status_code=422, detail="Поля нельзя устанавливать в null")
    if "name" in updates:
        ensure_unique_name(db, updates["name"], except_id=device_id)
    for field, value in updates.items():
        setattr(device, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Некорректные данные или повторяющееся название")
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Удалить устройство",
               responses={404: {"description": "Устройство не найдено"}})
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db.delete(find_device(db, device_id))
    db.commit()
    return Response(status_code=204)
