import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
    Categoria,
    Producto,
    ProductoResumen,
    Componente,
    PedidoEstandar,
    PedidoPersonalizado,
} from "@/lib/types";

// ─────────────────────────────────────────────
// Categorías
// ─────────────────────────────────────────────

export function useCategorias() {
    return useQuery<Categoria[]>({
        queryKey: ["categorias"],
        queryFn: () => api.get("/api/categorias/").then((r) => r.data),
        staleTime: 5 * 60_000, // 5 min — raro que cambien
    });
}

// ─────────────────────────────────────────────
// Productos — catálogo público
// ─────────────────────────────────────────────

interface FiltrosProducto {
    categoria_id?: number;
    tipo?: string;
    busqueda?: string;
    skip?: number;
    limit?: number;
}

export function useProductos(filtros: FiltrosProducto = {}) {
    return useQuery<ProductoResumen[]>({
        queryKey: ["productos", filtros],
        queryFn: () =>
            api
                .get("/api/productos/", { params: filtros })
                .then((r) => r.data),
    });
}

export function useProducto(id: number) {
    return useQuery<Producto>({
        queryKey: ["producto", id],
        queryFn: () => api.get(`/api/productos/${id}`).then((r) => r.data),
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────
// Componentes — para pedidos personalizados
// ─────────────────────────────────────────────

export function useComponentes(tipo?: string) {
    return useQuery<Componente[]>({
        queryKey: ["componentes", tipo],
        queryFn: () =>
            api.get("/api/componentes/", { params: tipo ? { tipo } : {} }).then((r) => r.data),
    });
}

// ─────────────────────────────────────────────
// Pedidos
// ─────────────────────────────────────────────

export function useCrearPedidoEstandar() {
    return useMutation({
        mutationFn: (data: unknown) =>
            api.post("/api/pedidos/estandar", data).then((r) => r.data as PedidoEstandar),
    });
}

export function useCrearPedidoPersonalizado() {
    return useMutation({
        mutationFn: (data: unknown) =>
            api.post("/api/pedidos/personalizado", data).then((r) => r.data as PedidoPersonalizado),
    });
}

// ─────────────────────────────────────────────
// Admin — productos
// ─────────────────────────────────────────────

export function useProductosAdmin() {
    return useQuery<ProductoResumen[]>({
        queryKey: ["productos-admin"],
        queryFn: () => api.get("/api/productos/admin/todos").then((r) => r.data),
    });
}

export function useEliminarProducto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete(`/api/productos/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["productos"] });
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
        },
    });
}

// ─────────────────────────────────────────────
// Admin — pedidos
// ─────────────────────────────────────────────

export function usePedidosEstandar() {
    return useQuery<PedidoEstandar[]>({
        queryKey: ["pedidos-estandar"],
        queryFn: () => api.get("/api/pedidos/estandar").then((r) => r.data),
    });
}

export function usePedidosPersonalizados() {
    return useQuery<PedidoPersonalizado[]>({
        queryKey: ["pedidos-personalizados"],
        queryFn: () => api.get("/api/pedidos/personalizado").then((r) => r.data),
    });
}
