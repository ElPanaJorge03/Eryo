from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import admin, categorias, componentes, pedidos, productos

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
    allow_origins=[
        settings.FRONTEND_URL,
        "http://192.168.1.13:3000",
        "http://192.168.1.16:3000",
    ],
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


@app.get("/")
def root():
    return {"message": "Eryo API funcionando 🧵"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
