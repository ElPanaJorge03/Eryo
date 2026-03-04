from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings

settings = get_settings()

# Motor de conexión a PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Fábrica de sesiones — cada request usa su propia sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    Clase base para todos los modelos SQLAlchemy.
    Todos los modelos heredan de esta clase.
    """
    pass


def get_db():
    """
    Dependency de FastAPI que inyecta una sesión de BD.
    Se usa en los endpoints así:

        @router.get("/productos")
        def listar(db: Session = Depends(get_db)):
            ...

    La sesión se cierra automáticamente al terminar el request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
