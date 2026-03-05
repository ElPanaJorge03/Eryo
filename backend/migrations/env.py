from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ─────────────────────────────────────────────
# Importar settings y todos los modelos
# para que Alembic los detecte en autogenerate
# ─────────────────────────────────────────────
from app.config import get_settings
from app.database import Base

# Importar cada modelo para que quede registrado en Base.metadata
import app.models.admin        # noqa: F401
import app.models.categoria    # noqa: F401
import app.models.componente   # noqa: F401
import app.models.producto     # noqa: F401
import app.models.pedido       # noqa: F401

settings = get_settings()

# Configuración de logging de alembic.ini
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Apuntar al metadata de nuestros modelos
target_metadata = Base.metadata

# Inyectar la URL desde el .env (en vez de alembic.ini)
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    """
    Modo offline: genera el SQL sin conectarse a la BD.
    Útil para revisar las queries antes de ejecutarlas.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Modo online: se conecta a la BD y ejecuta las migraciones.
    Es el modo normal de uso.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
