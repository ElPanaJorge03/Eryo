from sqlalchemy import Boolean, Column, Integer, String

from app.database import Base


class Componente(Base):
    """
    Componentes disponibles para pedidos personalizados.
    El vendedor administra qué opciones tiene el cliente para armar su pieza.

    Tipos de componente:
    - "tipo_pieza": Manilla, Anillo, Collar, etc.
    - "tejido": Estilo de tejido disponible
    - "color": Color del hilo
    - "digen": Piedra central disponible
    """

    __tablename__ = "componentes"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False)  # tipo_pieza, tejido, color, digen
    nombre = Column(String(100), nullable=False)
    disponible = Column(Boolean, default=True)
    imagen_url = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<Componente {self.tipo}: {self.nombre}>"
