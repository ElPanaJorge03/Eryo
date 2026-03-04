from pydantic import BaseModel


# ─────────────────────────────────────────────
# Foto de producto
# ─────────────────────────────────────────────

class FotoCreate(BaseModel):
    """
    Lo que envía el frontend al guardar fotos de un producto.
    La URL viene de Cloudinary (ya subida). El public_id se necesita
    para poder eliminar la foto de Cloudinary si el admin la borra.
    """
    url: str
    public_id: str = ""
    orden: int = 0


class FotoProductoResponse(BaseModel):
    id: int
    url: str
    public_id: str
    orden: int

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Schemas de entrada
# ─────────────────────────────────────────────

class ProductoCreate(BaseModel):
    """Para crear un producto nuevo."""
    nombre: str
    descripcion: str = ""
    precio: float
    tipo: str
    estilo_tejido: str = ""
    color_hilo: str = ""
    digen: str = ""
    stock: int = 0
    activo: bool = True
    categoria_id: int | None = None


class ProductoUpdate(BaseModel):
    """Para actualizar un producto. Solo se actualizan los campos enviados."""
    nombre: str | None = None
    descripcion: str | None = None
    precio: float | None = None
    tipo: str | None = None
    estilo_tejido: str | None = None
    color_hilo: str | None = None
    digen: str | None = None
    stock: int | None = None
    activo: bool | None = None
    categoria_id: int | None = None


# ─────────────────────────────────────────────
# Schemas de salida
# ─────────────────────────────────────────────

class ProductoResponse(BaseModel):
    """Producto completo con sus fotos."""
    id: int
    nombre: str
    descripcion: str
    precio: float
    tipo: str
    estilo_tejido: str
    color_hilo: str
    digen: str
    stock: int
    activo: bool
    categoria_id: int | None
    fotos: list[FotoProductoResponse] = []

    model_config = {"from_attributes": True}


class ProductoListResponse(BaseModel):
    """
    Versión resumida para listados.
    Incluye solo la primera foto como miniatura.
    """
    id: int
    nombre: str
    precio: float
    tipo: str
    stock: int
    activo: bool
    categoria_id: int | None
    foto_principal: str | None = None  # URL de la primera foto

    model_config = {"from_attributes": True}
