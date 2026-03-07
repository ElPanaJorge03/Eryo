from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String, unique=True, index=True, nullable=False)
    p256dh = Column(String, nullable=False)
    auth = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    cliente_correo = Column(String, index=True, nullable=True) # opcional si no es admin
