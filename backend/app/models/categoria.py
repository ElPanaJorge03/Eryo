from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Categoria(Base):
    """
    Categorías para organizar el catálogo.
    Ejemplo: "Manillas de hilo", "Anillos", "Collares", etc.
    """

    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, default="")

    # Relación inversa: una categoría tiene muchos productos
    productos = relationship("Producto", back_populates="categoria")

    def __repr__(self):
        return f"<Categoria {self.nombre}>"
