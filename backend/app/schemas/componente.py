from pydantic import BaseModel


class ComponenteCreate(BaseModel):
    """Para crear un componente nuevo."""
    tipo: str  # "tipo_pieza", "tejido", "color", "digen"
    nombre: str
    disponible: bool = True


class ComponenteUpdate(BaseModel):
    """Para actualizar un componente."""
    tipo: str | None = None
    nombre: str | None = None
    disponible: bool | None = None


class ComponenteResponse(BaseModel):
    id: int
    tipo: str
    nombre: str
    disponible: bool

    model_config = {"from_attributes": True}
