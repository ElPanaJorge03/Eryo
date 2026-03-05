import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# ─────────────────────────────────────────────
# Tabla asociativa: pedido personalizado <-> componentes
# Un pedido personalizado puede tener muchos componentes
# y un componente puede estar en muchos pedidos.
# ─────────────────────────────────────────────
pedido_personalizado_componentes = Table(
    "pedido_personalizado_componentes",
    Base.metadata,
    Column("pedido_id", Integer, ForeignKey("pedidos_personalizados.id", ondelete="CASCADE")),
    Column("componente_id", Integer, ForeignKey("componentes.id")),
)


class PedidoEstandar(Base):
    """
    Pedido de un producto existente del catálogo.

    Flujo de estados:
    PENDIENTE → CONFIRMADO → EN_CAMINO → ENTREGADO
    (Cancelación posible en cualquier punto → CANCELADO)
    """

    __tablename__ = "pedidos_estandar"

    id = Column(Integer, primary_key=True, index=True)
    cliente_nombre = Column(String(200), nullable=False)
    cliente_telefono = Column(String(20), nullable=False)
    cliente_correo = Column(String(200), nullable=False)
    direccion = Column(Text, nullable=False)
    metodo_pago = Column(String(20), nullable=False)  # "contraentrega" o "transferencia"
    estado = Column(String(30), default="PENDIENTE")
    notas = Column(Text, default="")
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relación: un pedido estándar tiene muchos items
    items = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PedidoEstandar #{self.id} - {self.estado}>"


class ItemPedido(Base):
    """
    Línea individual dentro de un pedido estándar.
    Cada item referencia un producto con cantidad y precio al momento de la compra.
    """

    __tablename__ = "items_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos_estandar.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Float, nullable=False)

    # Relaciones
    pedido = relationship("PedidoEstandar", back_populates="items")
    producto = relationship("Producto", back_populates="items_pedido")

    def __repr__(self):
        return f"<ItemPedido pedido={self.pedido_id} producto={self.producto_id} x{self.cantidad}>"

    @property
    def producto_nombre(self) -> str:
        return self.producto.nombre if self.producto else f"Producto #{self.producto_id}"


def _generar_token():
    """Genera un token único para confirmación de precio."""
    return uuid.uuid4().hex


class PedidoPersonalizado(Base):
    """
    Pedido donde el cliente arma su pieza eligiendo componentes.

    Flujo de estados:
    PENDIENTE → PRECIO_DEFINIDO → CONFIRMADO → EN_ELABORACION → LISTO → ENTREGADO
    (Cancelación posible en cualquier punto → CANCELADO)

    El token_confirmacion se usa en el enlace que recibe el cliente por correo
    para aceptar o rechazar el precio definido por el vendedor.
    """

    __tablename__ = "pedidos_personalizados"

    id = Column(Integer, primary_key=True, index=True)
    cliente_nombre = Column(String(200), nullable=False)
    cliente_telefono = Column(String(20), nullable=False)
    cliente_correo = Column(String(200), nullable=False)
    direccion = Column(Text, nullable=False)
    descripcion = Column(Text, default="")  # Descripción adicional del cliente
    precio_definido = Column(Float, nullable=True)  # Lo define el vendedor después
    estado = Column(String(30), default="PENDIENTE")
    token_confirmacion = Column(String(64), default=_generar_token, unique=True)
    notas = Column(Text, default="")
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relación many-to-many con componentes
    componentes = relationship("Componente", secondary=pedido_personalizado_componentes)

    def __repr__(self):
        return f"<PedidoPersonalizado #{self.id} - {self.estado}>"
