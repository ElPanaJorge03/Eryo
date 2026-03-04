from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class Admin(Base):
    """
    Usuario administrador (vendedor).
    Solo hay un admin en este proyecto, pero el modelo soporta múltiples
    por si en el futuro se necesita.

    La contraseña se almacena hasheada con bcrypt.
    """

    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Admin {self.username}>"
