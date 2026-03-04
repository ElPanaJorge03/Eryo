from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Producto(Base):
    """
    Producto del catálogo.
    Tiene atributos fijos: tipo, estilo de tejido, color, digen, etc.
    Las fotos se guardan en una tabla separada (URLs de Cloudinary).
    """

    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text, default="")
    precio = Column(Float, nullable=False)
    tipo = Column(String(50), nullable=False)  # Manilla, Anillo, Collar, etc.
    estilo_tejido = Column(String(100), default="")
    color_hilo = Column(String(100), default="")
    digen = Column(String(100), default="")  # Piedra central (si aplica)
    stock = Column(Integer, default=0)
    activo = Column(Boolean, default=True)

    # FK a categoría
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)

    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    fotos = relationship("FotoProducto", back_populates="producto", cascade="all, delete-orphan")
    items_pedido = relationship("ItemPedido", back_populates="producto", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Producto {self.nombre} - ${self.precio}>"


class FotoProducto(Base):
    """
    Foto de un producto almacenada en Cloudinary.
    Un producto puede tener múltiples fotos.
    El campo 'orden' permite definir cuál se muestra primero.
    """

    __tablename__ = "fotos_producto"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)  # URL de Cloudinary
    public_id = Column(String(300), default="")  # ID de Cloudinary para eliminar
    orden = Column(Integer, default=0)

    # Relación inversa
    producto = relationship("Producto", back_populates="fotos")

    def __repr__(self):
        return f"<FotoProducto producto_id={self.producto_id}>"
