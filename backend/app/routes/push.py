from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.push import PushSubscription
import json

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys
    cliente_correo: str | None = None
    is_admin: bool = False

@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(data: PushSubscriptionCreate, db: Session = Depends(get_db)):
    # Check if subscription already exists
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == data.endpoint).first()
    if existing:
        existing.p256dh = data.keys.p256dh
        existing.auth = data.keys.auth
        existing.cliente_correo = data.cliente_correo
        existing.is_admin = data.is_admin
    else:
        new_sub = PushSubscription(
            endpoint=data.endpoint,
            p256dh=data.keys.p256dh,
            auth=data.keys.auth,
            cliente_correo=data.cliente_correo,
            is_admin=data.is_admin
        )
        db.add(new_sub)
    db.commit()
    return {"message": "Suscripción guardada correctamente"}

@router.delete("/unsubscribe")
def unsubscribe(endpoint: str, db: Session = Depends(get_db)):
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"message": "Suscripción eliminada"}
