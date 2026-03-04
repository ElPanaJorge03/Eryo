from pydantic import BaseModel, EmailStr


class AdminCreate(BaseModel):
    """Para registrar el admin inicial."""
    username: str
    email: EmailStr
    password: str


class AdminLogin(BaseModel):
    """Para iniciar sesión."""
    username: str
    password: str


class Token(BaseModel):
    """Respuesta de login exitoso."""
    access_token: str
    token_type: str = "bearer"
