import json
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from app.models.push import PushSubscription
from app.config import get_settings

def send_push_notification(subscription: PushSubscription, payload: dict):
    settings = get_settings()
    if not settings.VAPID_PRIVATE_KEY:
        return False
        
    try:
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth
                }
            },
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": settings.VAPID_CLAIMS_EMAIL
            }
        )
        return True
    except WebPushException as ex:
        # Si da error GONE o Not Found, la suscripción expiró
        if ex.response and ex.response.status_code in (404, 410):
            return "EXPIRED"
        print("Error sending web push:", ex)
        return False

def notify_user_by_email(db: Session, email: str, payload: dict):
    """Notifica a todos los dispositivos de un correo específico"""
    if not email: return
    subs = db.query(PushSubscription).filter(PushSubscription.cliente_correo == email).all()
    _send_to_subs(db, subs, payload)
        
def notify_admins(db: Session, payload: dict):
    """Notifica a todos los administradores"""
    subs = db.query(PushSubscription).filter(PushSubscription.is_admin == True).all()
    _send_to_subs(db, subs, payload)

def _send_to_subs(db: Session, subs: list[PushSubscription], payload: dict):
    expired = []
    for sub in subs:
        result = send_push_notification(sub, payload)
        if result == "EXPIRED":
            expired.append(sub)
    
    # Limpiar suscripciones expiradas
    for sub in expired:
        db.delete(sub)
    if expired:
        db.commit()
