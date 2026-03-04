from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from app.services.email_service import (
    send_email,
    template_pedido_estandar_cliente,
    template_pedido_personalizado_cliente,
    template_precio_definido,
    template_estado_actualizado,
)

from app.auth import get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.componente import Componente
from app.models.producto import Producto
from app.models.pedido import ItemPedido, PedidoEstandar, PedidoPersonalizado
from app.schemas.pedido import (
    CambiarEstadoRequest,
    DefinirPrecioRequest,
    PedidoEstandarCreate,
    PedidoEstandarResponse,
    PedidoPersonalizadoCreate,
    PedidoPersonalizadoResponse,
)

router = APIRouter(prefix="/api/pedidos", tags=["Pedidos"])

# Estados válidos para cada tipo de pedido
ESTADOS_ESTANDAR = ["PENDIENTE", "CONFIRMADO", "EN_CAMINO", "ENTREGADO", "CANCELADO"]
ESTADOS_PERSONALIZADO = [
    "PENDIENTE",
    "PRECIO_DEFINIDO",
    "CONFIRMADO",
    "EN_ELABORACION",
    "LISTO",
    "ENTREGADO",
    "CANCELADO",
]


# ═════════════════════════════════════════════
# PEDIDOS ESTÁNDAR
# ═════════════════════════════════════════════

@router.post("/estandar", response_model=PedidoEstandarResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido_estandar(
    data: PedidoEstandarCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """
    Crea un pedido estándar (desde el catálogo).
    Público — lo usa el cliente al hacer checkout.

    Verifica que cada producto exista, tenga stock suficiente y descuenta stock.
    """
    if not data.items:
        raise HTTPException(status_code=400, detail="El pedido debe tener al menos un item")

    if data.metodo_pago not in ("contraentrega", "transferencia"):
        raise HTTPException(status_code=400, detail="Método de pago inválido")

    # Crear el pedido
    pedido = PedidoEstandar(
        cliente_nombre=data.cliente_nombre,
        cliente_telefono=data.cliente_telefono,
        cliente_correo=data.cliente_correo,
        direccion=data.direccion,
        metodo_pago=data.metodo_pago,
        notas=data.notas,
    )
    db.add(pedido)
    db.flush()  # Para obtener el ID antes del commit

    total_pedido = 0

    # Procesar cada item del carrito
    for item_data in data.items:
        producto = db.query(Producto).filter(Producto.id == item_data.producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"Producto con ID {item_data.producto_id} no encontrado",
            )
        if not producto.activo:
            raise HTTPException(
                status_code=400,
                detail=f"El producto '{producto.nombre}' no está disponible",
            )
        if producto.stock < item_data.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}",
            )

        # Descontar stock
        producto.stock -= item_data.cantidad
        precio_item = producto.precio
        total_pedido += (precio_item * item_data.cantidad)

        item = ItemPedido(
            pedido_id=pedido.id,
            producto_id=producto.id,
            cantidad=item_data.cantidad,
            precio_unitario=precio_item,
        )
        db.add(item)

    db.commit()
    db.refresh(pedido)

    # Enviar correo al cliente asíncronamente
    html_content = template_pedido_estandar_cliente(
        nombre=pedido.cliente_nombre,
        id_pedido=pedido.id,
        total=f"{total_pedido:,.2f}"
    )
    background_tasks.add_task(
        send_email,
        to_email=pedido.cliente_correo,
        subject="¡Pedido Recibido! - Eryó Bisutería",
        html_content=html_content
    )

    return pedido


@router.get("/estandar", response_model=list[PedidoEstandarResponse])
def listar_pedidos_estandar(
    estado: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Lista pedidos estándar. Solo admin."""
    query = db.query(PedidoEstandar).options(joinedload(PedidoEstandar.items))

    if estado:
        query = query.filter(PedidoEstandar.estado == estado)

    return query.order_by(PedidoEstandar.creado_en.desc()).offset(skip).limit(limit).all()


@router.get("/estandar/{pedido_id}", response_model=PedidoEstandarResponse)
def obtener_pedido_estandar(
    pedido_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Obtiene detalle de un pedido estándar. Solo admin."""
    pedido = (
        db.query(PedidoEstandar)
        .options(joinedload(PedidoEstandar.items))
        .filter(PedidoEstandar.id == pedido_id)
        .first()
    )
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.patch("/estandar/{pedido_id}/estado", response_model=PedidoEstandarResponse)
def cambiar_estado_estandar(
    pedido_id: int,
    data: CambiarEstadoRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Cambia el estado de un pedido estándar. Solo admin."""
    if data.estado not in ESTADOS_ESTANDAR:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Opciones: {', '.join(ESTADOS_ESTANDAR)}",
        )

    pedido = db.query(PedidoEstandar).filter(PedidoEstandar.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    pedido.estado = data.estado
    db.commit()
    db.refresh(pedido)

    # Notificarr al cliente del cambio
    html_content = template_estado_actualizado(
        nombre=pedido.cliente_nombre,
        id_pedido=pedido.id,
        nuevo_estado=pedido.estado
    )
    background_tasks.add_task(
        send_email,
        to_email=pedido.cliente_correo,
        subject=f"Tu pedido ahora está: {pedido.estado} - Eryó",
        html_content=html_content
    )

    return pedido


@router.delete("/estandar/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pedido_estandar(
    pedido_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Elimina un pedido estándar. Solo admin."""
    pedido = db.query(PedidoEstandar).filter(PedidoEstandar.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    db.delete(pedido)
    db.commit()
    return None


# ═════════════════════════════════════════════
# PEDIDOS PERSONALIZADOS
# ═════════════════════════════════════════════

@router.post(
    "/personalizado",
    response_model=PedidoPersonalizadoResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido_personalizado(
    data: PedidoPersonalizadoCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Crea un pedido personalizado (el cliente elige componentes).
    Público — lo usa el cliente desde la sección de personalización.

    El precio NO se define aquí — lo define el vendedor después.
    """
    if not data.componente_ids:
        raise HTTPException(status_code=400, detail="Debe elegir al menos un componente")

    # Verificar que todos los componentes existen y están disponibles
    componentes = (
        db.query(Componente)
        .filter(Componente.id.in_(data.componente_ids))
        .all()
    )
    if len(componentes) != len(data.componente_ids):
        raise HTTPException(status_code=400, detail="Uno o más componentes no son válidos")

    no_disponibles = [c for c in componentes if not c.disponible]
    if no_disponibles:
        nombres = ", ".join(c.nombre for c in no_disponibles)
        raise HTTPException(
            status_code=400,
            detail=f"Componentes no disponibles: {nombres}",
        )

    pedido = PedidoPersonalizado(
        cliente_nombre=data.cliente_nombre,
        cliente_telefono=data.cliente_telefono,
        cliente_correo=data.cliente_correo,
        direccion=data.direccion,
        descripcion=data.descripcion,
        notas=data.notas,
        componentes=componentes,
    )
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    # Correo al cliente: "Gracias, evaluaremos precio"
    html_content = template_pedido_personalizado_cliente(
        nombre=pedido.cliente_nombre,
        id_pedido=pedido.id
    )
    background_tasks.add_task(
        send_email,
        to_email=pedido.cliente_correo,
        subject="Solicitud de Diseño Personalizado - Eryó",
        html_content=html_content
    )

    return pedido


@router.get("/personalizado", response_model=list[PedidoPersonalizadoResponse])
def listar_pedidos_personalizados(
    estado: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Lista pedidos personalizados. Solo admin."""
    query = db.query(PedidoPersonalizado).options(
        joinedload(PedidoPersonalizado.componentes)
    )

    if estado:
        query = query.filter(PedidoPersonalizado.estado == estado)

    return (
        query.order_by(PedidoPersonalizado.creado_en.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/personalizado/{pedido_id}", response_model=PedidoPersonalizadoResponse)
def obtener_pedido_personalizado(
    pedido_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Detalle de un pedido personalizado. Solo admin."""
    pedido = (
        db.query(PedidoPersonalizado)
        .options(joinedload(PedidoPersonalizado.componentes))
        .filter(PedidoPersonalizado.id == pedido_id)
        .first()
    )
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.patch("/personalizado/{pedido_id}/precio", response_model=PedidoPersonalizadoResponse)
def definir_precio(
    pedido_id: int,
    data: DefinirPrecioRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """
    El vendedor define el precio de un pedido personalizado.
    Solo se puede definir cuando el estado es PENDIENTE.
    Cambia el estado a PRECIO_DEFINIDO automáticamente.
    """
    from app.config import get_settings
    settings = get_settings()

    pedido = db.query(PedidoPersonalizado).filter(PedidoPersonalizado.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado != "PENDIENTE":
        raise HTTPException(
            status_code=400,
            detail="Solo se puede definir el precio cuando el pedido está PENDIENTE",
        )

    if data.precio <= 0:
        raise HTTPException(status_code=400, detail="El precio debe ser mayor a 0")

    pedido.precio_definido = data.precio
    pedido.estado = "PRECIO_DEFINIDO"
    db.commit()
    db.refresh(pedido)

    # Enviar correo al cliente con el enlace de confirmación
    enlace = f"{settings.FRONTEND_URL}/api/pedidos/personalizado/confirmar/{pedido.token_confirmacion}"
    # Opcional: Esto asume que el backend intercepta el link o que el frontend tiene una página. 
    # Usaremos el link de la api directamente por simplicidad, o la url del frontend si tuvieramos /confirmar en React

    enc_url = f"{settings.FRONTEND_URL}/confirmar/{pedido.token_confirmacion}"

    html_content = template_precio_definido(
        nombre=pedido.cliente_nombre,
        id_pedido=pedido.id,
        precio=pedido.precio_definido,
        enlace=enc_url
    )
    background_tasks.add_task(
        send_email,
        to_email=pedido.cliente_correo,
        subject="¡Precio Definido para tu Diseño! - Eryó",
        html_content=html_content
    )

    return pedido


@router.get("/personalizado/confirmar/{token}")
def confirmar_precio(token: str, accion: str, db: Session = Depends(get_db)):
    """
    El cliente confirma o rechaza el precio desde el enlace del correo.
    Público — no requiere autenticación, se valida por token único.

    Parámetros:
    - token: token único del pedido (en la URL)
    - accion: "aceptar" o "rechazar" (query param)
    """
    pedido = (
        db.query(PedidoPersonalizado)
        .filter(PedidoPersonalizado.token_confirmacion == token)
        .first()
    )
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado != "PRECIO_DEFINIDO":
        raise HTTPException(
            status_code=400,
            detail="Este pedido no está esperando confirmación de precio",
        )

    if accion == "aceptar":
        pedido.estado = "CONFIRMADO"
        mensaje = "Precio aceptado. Tu pedido está en proceso."
    elif accion == "rechazar":
        pedido.estado = "CANCELADO"
        mensaje = "Pedido cancelado."
    else:
        raise HTTPException(status_code=400, detail="Acción inválida. Use 'aceptar' o 'rechazar'")

    db.commit()

    # TODO: Enviar correo al vendedor notificando la decisión del cliente

    return {"mensaje": mensaje, "estado": pedido.estado}


@router.patch("/personalizado/{pedido_id}/estado", response_model=PedidoPersonalizadoResponse)
def cambiar_estado_personalizado(
    pedido_id: int,
    data: CambiarEstadoRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Cambia el estado de un pedido personalizado. Solo admin."""
    if data.estado not in ESTADOS_PERSONALIZADO:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Opciones: {', '.join(ESTADOS_PERSONALIZADO)}",
        )

    pedido = db.query(PedidoPersonalizado).filter(PedidoPersonalizado.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    pedido.estado = data.estado
    db.commit()
    db.refresh(pedido)

    html_content = template_estado_actualizado(
        nombre=pedido.cliente_nombre,
        id_pedido=pedido.id,
        nuevo_estado=pedido.estado
    )
    background_tasks.add_task(
        send_email,
        to_email=pedido.cliente_correo,
        subject=f"Tu pedido personalizado ahora está: {pedido.estado} - Eryó",
        html_content=html_content
    )

    return pedido


@router.delete("/personalizado/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pedido_personalizado(
    pedido_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Elimina un pedido personalizado. Solo admin."""
    pedido = db.query(PedidoPersonalizado).filter(PedidoPersonalizado.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    db.delete(pedido)
    db.commit()
    return None
