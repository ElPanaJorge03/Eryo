from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import admin, categorias, componentes, pedidos, productos, push

settings = get_settings()

app = FastAPI(
    title="Eryo API",
    description="API para tienda de bisutería artesanal",
    version="0.1.0",
)

# ─────────────────────────────────────────────
# CORS: permite que el frontend (Next.js) haga requests al backend
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Registrar todas las rutas
# ─────────────────────────────────────────────
app.include_router(admin.router)
app.include_router(categorias.router)
app.include_router(componentes.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(push.router)


@app.get("/")
def root():
    return {"message": "Eryo API funcionando 🧵"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/init-db")
def init_db():
    from app.database import engine, Base
    import app.models.admin
    import app.models.categoria
    import app.models.componente
    import app.models.producto
    import app.models.pedido
    import app.models.push
    
    Base.metadata.create_all(bind=engine)
    return {"message": "Tablas de la base de datos creadas exitosamente 🚀"}
