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
// Categorías — admin & público
// ─────────────────────────────────────────────

export function useCategorias() {
    return useQuery<Categoria[]>({
        queryKey: ["categorias"],
        queryFn: () => api.get("/api/categorias/").then((r) => r.data),
        staleTime: 5 * 60_000, // 5 min
    });
}

export function useCrearCategoria() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Categoria, "id">) => api.post("/api/categorias/", data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
    });
}

export function useActualizarCategoria() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<Categoria> & { id: number }) =>
            api.put(`/api/categorias/${id}`, data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
    });
}

export function useEliminarCategoria() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete(`/api/categorias/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
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
            api.get("/api/componentes/", { params: { ...(tipo ? { tipo } : {}), solo_disponibles: true } }).then((r) => r.data),
    });
}

export function useAdminComponentes() {
    return useQuery<Componente[]>({
        queryKey: ["admin-componentes"],
        queryFn: () =>
            api.get("/api/componentes/", { params: { solo_disponibles: false } }).then((r) => r.data),
    });
}

export function useCrearComponente() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Componente, "id">) => api.post("/api/componentes/", data).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["componentes"] });
            qc.invalidateQueries({ queryKey: ["admin-componentes"] });
        },
    });
}

export function useActualizarComponente() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<Componente> & { id: number }) =>
            api.put(`/api/componentes/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["componentes"] });
            qc.invalidateQueries({ queryKey: ["admin-componentes"] });
        },
    });
}

export function useEliminarComponente() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete(`/api/componentes/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["componentes"] });
            qc.invalidateQueries({ queryKey: ["admin-componentes"] });
        },
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

export function useActualizarEstadoEstandar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: string }) =>
            api.patch(`/api/pedidos/estandar/${id}/estado`, { estado }).then((r) => r.data as PedidoEstandar),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pedidos-estandar"] });
        },
    });
}

export function usePedidosPersonalizados() {
    return useQuery<PedidoPersonalizado[]>({
        queryKey: ["pedidos-personalizados"],
        queryFn: () => api.get("/api/pedidos/personalizado").then((r) => r.data),
    });
}

export function useActualizarEstadoPersonalizado() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: string }) =>
            api.patch(`/api/pedidos/personalizado/${id}/estado`, { estado }).then((r) => r.data as PedidoPersonalizado),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pedidos-personalizados"] });
        },
    });
}

export function useDefinirPrecioPersonalizado() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, precio }: { id: number; precio: number }) =>
            api.patch(`/api/pedidos/personalizado/${id}/precio`, { precio }).then((r) => r.data as PedidoPersonalizado),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pedidos-personalizados"] });
        },
    });
}

export function useEliminarPedidoEstandar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete(`/api/pedidos/estandar/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pedidos-estandar"] });
        },
    });
}

export function useEliminarPedidoPersonalizado() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete(`/api/pedidos/personalizado/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["pedidos-personalizados"] });
        },
    });
}
