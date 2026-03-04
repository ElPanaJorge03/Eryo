from pydantic import BaseModel


class ComponenteCreate(BaseModel):
    """Para crear un componente nuevo."""
    tipo: str  # "tipo_pieza", "tejido", "color", "digen"
    nombre: str
    disponible: bool = True
    imagen_url: str | None = None


class ComponenteUpdate(BaseModel):
    """Para actualizar un componente."""
    tipo: str | None = None
    nombre: str | None = None
    disponible: bool | None = None
    imagen_url: str | None = None


class ComponenteResponse(BaseModel):
    id: int
    tipo: str
    nombre: str
    disponible: bool
    imagen_url: str | None = None

    model_config = {"from_attributes": True}
