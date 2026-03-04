from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminCreate, AdminLogin, Token

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/registro", response_model=Token, status_code=status.HTTP_201_CREATED)
def registrar_admin(data: AdminCreate, db: Session = Depends(get_db)):
    """
    Registra el admin inicial.
    Solo permite un admin — si ya existe uno, rechaza el registro.
    Esto es intencional: el vendedor es una sola persona.
    """
    admin_existente = db.query(Admin).first()
    if admin_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un administrador registrado",
        )

    nuevo_admin = Admin(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)

    token = create_access_token({"sub": nuevo_admin.username})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(data: AdminLogin, db: Session = Depends(get_db)):
    """
    Login del admin. Devuelve un JWT para autenticarse en endpoints protegidos.
    """
    # Buscar por username O por email (acepta cualquiera de los dos)
    admin = (
        db.query(Admin)
        .filter(
            (Admin.username == data.username) | (Admin.email == data.username)
        )
        .first()
    )
    if not admin or not verify_password(data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )

    token = create_access_token({"sub": admin.username})
    return {"access_token": token, "token_type": "bearer"}
