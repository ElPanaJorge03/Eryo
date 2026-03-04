from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.componente import Componente
from app.schemas.componente import ComponenteCreate, ComponenteResponse, ComponenteUpdate

router = APIRouter(prefix="/api/componentes", tags=["Componentes"])


# ─────────────────────────────────────────────
# Endpoints públicos
# ─────────────────────────────────────────────

@router.get("/", response_model=list[ComponenteResponse])
def listar_componentes(
    tipo: str | None = None,
    solo_disponibles: bool = True,
    db: Session = Depends(get_db),
):
    """
    Lista componentes disponibles para pedidos personalizados.
    Filtrable por tipo (tipo_pieza, tejido, color, digen).
    Por defecto solo muestra los disponibles.
    """
    query = db.query(Componente)

    if tipo:
        query = query.filter(Componente.tipo == tipo)
    if solo_disponibles:
        query = query.filter(Componente.disponible == True)

    return query.all()


# ─────────────────────────────────────────────
# Endpoints protegidos (solo admin)
# ─────────────────────────────────────────────

@router.post("/", response_model=ComponenteResponse, status_code=status.HTTP_201_CREATED)
def crear_componente(
    data: ComponenteCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Crea un componente. Solo admin."""
    componente = Componente(**data.model_dump())
    db.add(componente)
    db.commit()
    db.refresh(componente)
    return componente


@router.put("/{componente_id}", response_model=ComponenteResponse)
def actualizar_componente(
    componente_id: int,
    data: ComponenteUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Actualiza un componente. Solo admin."""
    componente = db.query(Componente).filter(Componente.id == componente_id).first()
    if not componente:
        raise HTTPException(status_code=404, detail="Componente no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(componente, field, value)

    db.commit()
    db.refresh(componente)
    return componente


@router.delete("/{componente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_componente(
    componente_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Elimina un componente. Solo admin."""
    from sqlalchemy.exc import IntegrityError
    
    componente = db.query(Componente).filter(Componente.id == componente_id).first()
    if not componente:
        raise HTTPException(status_code=404, detail="Componente no encontrado")

    try:
        db.delete(componente)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar este insumo porque ya figura dentro de la factura de un pedido. Por favor, ocúltalo (desactiva el escudo verde) en su lugar."
        )
