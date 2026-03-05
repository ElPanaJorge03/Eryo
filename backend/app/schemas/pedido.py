from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.componente import ComponenteResponse


# ═════════════════════════════════════════════
# PEDIDO ESTÁNDAR
# ═════════════════════════════════════════════

class ItemPedidoCreate(BaseModel):
    """Un item dentro del carrito."""
    producto_id: int
    cantidad: int = 1


class ItemPedidoResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    producto_nombre: str | None = None

    model_config = {"from_attributes": True}


class PedidoEstandarCreate(BaseModel):
    """
    Lo que envía el cliente al hacer un pedido desde el catálogo.
    Los items son las líneas del carrito.
    """
    cliente_nombre: str
    cliente_telefono: str
    cliente_correo: EmailStr
    direccion: str
    metodo_pago: str  # "contraentrega" o "transferencia"
    notas: str = ""
    items: list[ItemPedidoCreate]


class PedidoEstandarResponse(BaseModel):
    """Pedido estándar completo."""
    id: int
    cliente_nombre: str
    cliente_telefono: str
    cliente_correo: str
    direccion: str
    metodo_pago: str
    estado: str
    notas: str
    items: list[ItemPedidoResponse] = []
    creado_en: datetime
    actualizado_en: datetime

    model_config = {"from_attributes": True}


class CambiarEstadoRequest(BaseModel):
    """Para que el admin cambie el estado de un pedido."""
    estado: str


# ═════════════════════════════════════════════
# PEDIDO PERSONALIZADO
# ═════════════════════════════════════════════

class PedidoPersonalizadoCreate(BaseModel):
    """
    Lo que envía el cliente al armar su pieza personalizada.
    No incluye precio — lo define el vendedor después.
    """
    cliente_nombre: str
    cliente_telefono: str
    cliente_correo: EmailStr
    direccion: str
    descripcion: str = ""
    notas: str = ""
    componente_ids: list[int]  # IDs de los componentes elegidos


class PedidoPersonalizadoResponse(BaseModel):
    """Pedido personalizado completo."""
    id: int
    cliente_nombre: str
    cliente_telefono: str
    cliente_correo: str
    direccion: str
    descripcion: str
    precio_definido: float | None
    estado: str
    notas: str
    componentes: list[ComponenteResponse] = []
    creado_en: datetime
    actualizado_en: datetime

    model_config = {"from_attributes": True}


class DefinirPrecioRequest(BaseModel):
    """Para que el vendedor defina el precio de un pedido personalizado."""
    precio: float
