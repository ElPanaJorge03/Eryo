from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaResponse, CategoriaUpdate

router = APIRouter(prefix="/api/categorias", tags=["Categorías"])


# ─────────────────────────────────────────────
# Endpoints públicos (los ve el cliente)
# ─────────────────────────────────────────────

@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    """Lista todas las categorías. Público — se usa en filtros del catálogo."""
    return db.query(Categoria).all()


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Obtiene una categoría por ID."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


# ─────────────────────────────────────────────
# Endpoints protegidos (solo el admin)
# ─────────────────────────────────────────────

@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Crea una categoría nueva. Solo admin."""
    existente = db.query(Categoria).filter(Categoria.nombre == data.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    categoria = Categoria(**data.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Actualiza una categoría existente. Solo admin."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(categoria, field, value)

    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Elimina una categoría. Solo admin."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    db.delete(categoria)
    db.commit()
