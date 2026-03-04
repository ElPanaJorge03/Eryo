// ─────────────────────────────────────────────
// Tipos que reflejan los schemas del backend
// ─────────────────────────────────────────────

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface FotoProducto {
    id: number;
    url: string;
    public_id: string;
    orden: number;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    tipo: string;
    estilo_tejido: string;
    color_hilo: string;
    digen: string;
    stock: number;
    activo: boolean;
    categoria_id: number | null;
    fotos: FotoProducto[];
}

export interface ProductoResumen {
    id: number;
    nombre: string;
    precio: number;
    tipo: string;
    stock: number;
    activo: boolean;
    categoria_id: number | null;
    foto_principal: string | null;
}

export interface Componente {
    id: number;
    tipo: string; // "tipo_pieza" | "tejido" | "color" | "digen"
    nombre: string;
    disponible: boolean;
}

export interface ItemPedido {
    id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
}

export type EstadoEstandar =
    | "PENDIENTE"
    | "CONFIRMADO"
    | "EN_CAMINO"
    | "ENTREGADO"
    | "CANCELADO";

export type EstadoPersonalizado =
    | "PENDIENTE"
    | "PRECIO_DEFINIDO"
    | "CONFIRMADO"
    | "EN_ELABORACION"
    | "LISTO"
    | "ENTREGADO"
    | "CANCELADO";

export interface PedidoEstandar {
    id: number;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_correo: string;
    direccion: string;
    metodo_pago: string;
    estado: EstadoEstandar;
    notas: string;
    items: ItemPedido[];
    creado_en: string;
    actualizado_en: string;
}

export interface PedidoPersonalizado {
    id: number;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_correo: string;
    direccion: string;
    descripcion: string;
    precio_definido: number | null;
    estado: EstadoPersonalizado;
    notas: string;
    componentes: Componente[];
    creado_en: string;
    actualizado_en: string;
}
