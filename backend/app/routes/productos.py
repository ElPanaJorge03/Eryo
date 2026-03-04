from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.producto import FotoProducto, Producto
from app.schemas.producto import (
    FotoCreate,
    ProductoCreate,
    ProductoListResponse,
    ProductoResponse,
    ProductoUpdate,
)

router = APIRouter(prefix="/api/productos", tags=["Productos"])


# ─────────────────────────────────────────────
# Endpoints públicos (catálogo)
# ─────────────────────────────────────────────

@router.get("/", response_model=list[ProductoListResponse])
def listar_productos(
    categoria_id: int | None = None,
    tipo: str | None = None,
    busqueda: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Lista productos del catálogo con filtros opcionales.
    Solo muestra productos activos y con stock > 0 al público.
    Incluye la foto principal como miniatura.
    """
    query = db.query(Producto).filter(Producto.activo == True)

    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)
    if tipo:
        query = query.filter(Producto.tipo == tipo)
    if busqueda:
        query = query.filter(Producto.nombre.ilike(f"%{busqueda}%"))

    productos = query.options(joinedload(Producto.fotos)).offset(skip).limit(limit).all()

    # Construir respuesta con foto principal
    resultado = []
    for p in productos:
        fotos_ordenadas = sorted(p.fotos, key=lambda f: f.orden)
        resultado.append(
            ProductoListResponse(
                id=p.id,
                nombre=p.nombre,
                precio=p.precio,
                tipo=p.tipo,
                stock=p.stock,
                activo=p.activo,
                categoria_id=p.categoria_id,
                foto_principal=fotos_ordenadas[0].url if fotos_ordenadas else None,
            )
        )

    return resultado


# ─────────────────────────────────────────────
# Endpoints protegidos (admin)
# IMPORTANTE: /admin/todos debe ir ANTES de /{producto_id}.
# FastAPI evalúa rutas de arriba a abajo; si /{producto_id}
# estuviera primero, la palabra "admin" se intentaría convertir
# a int y daría un error 422 en vez de llegar a esta ruta.
# ─────────────────────────────────────────────

@router.get("/admin/todos", response_model=list[ProductoListResponse])
def listar_productos_admin(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """
    Lista TODOS los productos (activos e inactivos) para el panel admin.
    """
    productos = (
        db.query(Producto)
        .options(joinedload(Producto.fotos))
        .offset(skip)
        .limit(limit)
        .all()
    )

    resultado = []
    for p in productos:
        fotos_ordenadas = sorted(p.fotos, key=lambda f: f.orden)
        resultado.append(
            ProductoListResponse(
                id=p.id,
                nombre=p.nombre,
                precio=p.precio,
                tipo=p.tipo,
                stock=p.stock,
                activo=p.activo,
                categoria_id=p.categoria_id,
                foto_principal=fotos_ordenadas[0].url if fotos_ordenadas else None,
            )
        )

    return resultado


@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Crea un producto nuevo. Solo admin. Las fotos se agregan después."""
    producto = Producto(**data.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    """Detalle completo de un producto con todas sus fotos."""
    producto = (
        db.query(Producto)
        .options(joinedload(Producto.fotos))
        .filter(Producto.id == producto_id)
        .first()
    )
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Actualiza un producto. Solo admin."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(producto, field, value)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Elimina un producto y sus fotos. Solo admin."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Primero eliminar explícitamente las dependencias (fotos) dado que en SQLite
    # el ondelete="CASCADE" puede no activarse si no se estructuró desde el inicio
    db.query(FotoProducto).filter(FotoProducto.producto_id == producto_id).delete()

    db.delete(producto)
    db.commit()


# ─────────────────────────────────────────────
# Gestión de fotos (admin)
#
# Estrategia: lazy upload
# Las fotos NO se suben a Cloudinary mientras el admin
# rellena el formulario. Solo se suben al hacer clic en
# "Guardar". Así evitamos imágenes huérfanas en Cloudinary
# si el usuario cancela o cierra la pestaña.
#
# Flujo en el frontend:
#   1. Admin elige fotos → preview local (URL.createObjectURL)
#   2. Admin completa el formulario y confirma
#   3. Frontend sube cada foto a Cloudinary → obtiene URL
#   4. Frontend llama a POST /fotos/batch con todas las URLs
# ─────────────────────────────────────────────

@router.post("/{producto_id}/fotos", response_model=ProductoResponse)
def agregar_foto(
    producto_id: int,
    data: FotoCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """
    Agrega una foto a un producto (JSON body).
    La subida a Cloudinary ocurre en el frontend ANTES de llamar a este endpoint.
    """
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    foto = FotoProducto(
        producto_id=producto_id,
        url=data.url,
        public_id=data.public_id,
        orden=data.orden,
    )
    db.add(foto)
    db.commit()
    db.refresh(producto)
    return producto


@router.post("/{producto_id}/fotos/batch", response_model=ProductoResponse)
def agregar_fotos_batch(
    producto_id: int,
    fotos: list[FotoCreate],
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """
    Agrega múltiples fotos de una sola vez.
    Usado al guardar el formulario de producto — el frontend sube
    todas las fotos a Cloudinary y luego llama a este endpoint con
    la lista de URLs resultantes.
    """
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    for foto_data in fotos:
        foto = FotoProducto(
            producto_id=producto_id,
            url=foto_data.url,
            public_id=foto_data.public_id,
            orden=foto_data.orden,
        )
        db.add(foto)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{producto_id}/fotos/{foto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_foto(
    producto_id: int,
    foto_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Elimina una foto de un producto."""
    foto = (
        db.query(FotoProducto)
        .filter(FotoProducto.id == foto_id, FotoProducto.producto_id == producto_id)
        .first()
    )
    if not foto:
        raise HTTPException(status_code=404, detail="Foto no encontrada")

    db.delete(foto)
    db.commit()
