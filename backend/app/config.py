from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Configuración central del backend.
    Lee las variables de entorno desde el archivo .env automáticamente.
    """

    # Base de datos
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Google Apps Script
    GAS_WEBHOOK_URL: str = ""

    # Notificaciones al vendedor (correo donde llegan los avisos de nuevos pedidos)
    VENDEDOR_EMAIL: str = ""

    # Web Push
    VAPID_PRIVATE_KEY: str = ""
    VAPID_CLAIMS_EMAIL: str = "mailto:admin@eryo.com"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    """
    Singleton de configuración.
    lru_cache asegura que se lea el .env una sola vez
    y se reutilice la misma instancia en toda la app.
    """
    return Settings()
