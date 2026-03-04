from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.admin import Admin

settings = get_settings()

# ─────────────────────────────────────────────
# Hashing de contraseñas con bcrypt
# ─────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────────
# JWT
# ─────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")


def create_access_token(data: dict) -> str:
    """
    Crea un token JWT con un tiempo de expiración.
    'data' normalmente contiene {"sub": username}.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    """
    Dependency de FastAPI que verifica el token JWT y devuelve el admin.

    Se usa en endpoints protegidos así:
        @router.post("/productos")
        def crear(admin: Admin = Depends(get_current_admin)):
            ...

    Si el token es inválido o el admin no existe, lanza 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    admin = db.query(Admin).filter(Admin.username == username).first()
    if admin is None:
        raise credentials_exception

    return admin
