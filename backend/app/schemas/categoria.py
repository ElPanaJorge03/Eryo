from pydantic import BaseModel


# ─────────────────────────────────────────────
# Schemas de entrada (lo que envía el cliente)
# ─────────────────────────────────────────────

class CategoriaCreate(BaseModel):
    """Para crear una categoría nueva."""
    nombre: str
    descripcion: str = ""


class CategoriaUpdate(BaseModel):
    """
    Para actualizar una categoría.
    Todos los campos son opcionales: solo se actualiza lo que se envíe.
    """
    nombre: str | None = None
    descripcion: str | None = None


# ─────────────────────────────────────────────
# Schemas de salida (lo que devuelve la API)
# ─────────────────────────────────────────────

class CategoriaResponse(BaseModel):
    """Representación de una categoría en las respuestas."""
    id: int
    nombre: str
    descripcion: str

    model_config = {"from_attributes": True}
