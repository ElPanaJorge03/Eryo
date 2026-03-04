import {
    EstadoEstandar,
    EstadoPersonalizado,
} from "@/lib/types";

export function formatPrice(price: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(price);
}

export function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateStr));
}

// ─── Etiquetas legibles para estados ──────────────

const LABELS_ESTANDAR: Record<EstadoEstandar, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    EN_CAMINO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

const LABELS_PERSONALIZADO: Record<EstadoPersonalizado, string> = {
    PENDIENTE: "Pendiente",
    PRECIO_DEFINIDO: "Precio definido",
    CONFIRMADO: "Confirmado",
    EN_ELABORACION: "En elaboración",
    LISTO: "Listo",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

export function labelEstado(estado: string): string {
    return (
        (LABELS_ESTANDAR as Record<string, string>)[estado] ??
        (LABELS_PERSONALIZADO as Record<string, string>)[estado] ??
        estado
    );
}

// ─── Clase CSS de badge según estado ──────────────

export function badgeEstado(estado: string): string {
    if (estado === "PENDIENTE" || estado === "PRECIO_DEFINIDO")
        return "badge badge-pending";
    if (estado === "ENTREGADO" || estado === "LISTO" || estado === "CONFIRMADO")
        return "badge badge-active";
    if (estado === "CANCELADO")
        return "badge badge-cancelled";
    return "badge badge-done";
}
