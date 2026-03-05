"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    usePedidosEstandar,
    usePedidosPersonalizados,
    useActualizarEstadoEstandar,
    useActualizarEstadoPersonalizado,
    useDefinirPrecioPersonalizado,
    useEliminarPedidoEstandar,
    useEliminarPedidoPersonalizado,
} from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const ESTADOS_ESTANDAR = ["PENDIENTE", "CONFIRMADO", "EN_CAMINO", "ENTREGADO", "CANCELADO"];
const ESTADOS_PERSONALIZADO = [
    "PENDIENTE",
    "PRECIO_DEFINIDO",
    "CONFIRMADO",
    "EN_ELABORACION",
    "LISTO",
    "ENTREGADO",
    "CANCELADO",
];

export default function AdminPedidosPage() {
    const [tabActivo, setTabActivo] = useState<"estandar" | "personalizado">("estandar");

    const { data: pedidosEstandar, isLoading: isLoadingEstandar } = usePedidosEstandar();
    const { data: pedidosPerson, isLoading: isLoadingPerson } = usePedidosPersonalizados();

    const actualizarEstandar = useActualizarEstadoEstandar();
    const actualizarPerson = useActualizarEstadoPersonalizado();
    const definirPrecio = useDefinirPrecioPersonalizado();
    const eliminarEstandar = useEliminarPedidoEstandar();
    const eliminarPerson = useEliminarPedidoPersonalizado();

    const handleActualizarEstadoEst = async (id: number, estado: string) => {
        try {
            await actualizarEstandar.mutateAsync({ id, estado });
            toast.success("Estado actualizado");
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    const handleActualizarEstadoPer = async (id: number, estado: string) => {
        try {
            await actualizarPerson.mutateAsync({ id, estado });
            toast.success("Estado actualizado");
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    const handleFijarPrecio = async (id: number) => {
        const input = window.prompt("Ingresa el precio final del pedido (sin comas ni puntos):");
        if (!input) return;

        const precio = parseInt(input);
        if (isNaN(precio) || precio <= 0) {
            toast.error("Precio inválido");
            return;
        }

        try {
            await definirPrecio.mutateAsync({ id, precio });
            toast.success("Precio definido exitosamente");
        } catch (error) {
            toast.error("Error al definir el precio");
        }
    };

    const handleEliminarEstandar = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar permanentemente este pedido? Esta acción es irreversible.")) return;
        try {
            await eliminarEstandar.mutateAsync(id);
            toast.success("Pedido eliminado permanentemente");
        } catch (error) {
            toast.error("Error al eliminar pedido");
        }
    };

    const handleEliminarPerson = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar permanentemente este pedido personalizado? Esta acción es irreversible.")) return;
        try {
            await eliminarPerson.mutateAsync(id);
            toast.success("Pedido eliminado permanentemente");
        } catch (error) {
            toast.error("Error al eliminar pedido");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold" style={{ color: "#DCCAE9" }}>
                Gestión de Pedidos
            </h1>

            {/* ── Tabs ── */}
            <div className="flex gap-2 border-b border-[rgba(114,76,157,0.3)] pb-2">
                <button
                    onClick={() => setTabActivo("estandar")}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${tabActivo === "estandar"
                        ? "bg-[rgba(147,86,160,0.2)] text-[#9356A0] border-b-2 border-[#9356A0]"
                        : "text-[rgba(220,202,233,0.5)] hover:text-[#DCCAE9]"
                        }`}
                >
                    Catálogo
                </button>
                <button
                    onClick={() => setTabActivo("personalizado")}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${tabActivo === "personalizado"
                        ? "bg-[rgba(147,86,160,0.2)] text-[#9356A0] border-b-2 border-[#9356A0]"
                        : "text-[rgba(220,202,233,0.5)] hover:text-[#DCCAE9]"
                        }`}
                >
                    Personalizados
                </button>
            </div>

            {/* ── Contenido ── */}
            {tabActivo === "estandar" && (
                <div className="flex flex-col gap-4">
                    {isLoadingEstandar ? (
                        <p className="text-[rgba(220,202,233,0.5)]">Cargando pedidos...</p>
                    ) : pedidosEstandar?.length === 0 ? (
                        <p className="text-[rgba(220,202,233,0.5)]">No hay pedidos de catálogo aún.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pedidosEstandar?.map((p) => (
                                <div key={p.id} className="card p-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg" style={{ color: "#DCCAE9" }}>
                                                Pedido #{p.id}
                                            </h3>
                                            <p className="text-xs text-[rgba(220,202,233,0.6)]">
                                                {format(new Date(p.creado_en), "PPP - p", { locale: es })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="input text-xs w-auto py-1 px-2 h-auto"
                                                value={p.estado}
                                                onChange={(e) => handleActualizarEstadoEst(p.id, e.target.value)}
                                            >
                                                {ESTADOS_ESTANDAR.map((est) => (
                                                    <option key={est} value={est}>
                                                        {est.replace("_", " ")}
                                                    </option>
                                                ))}
                                            </select>

                                            {(p.estado === "ENTREGADO" || p.estado === "CANCELADO") && (
                                                <button
                                                    onClick={() => handleEliminarEstandar(p.id)}
                                                    className="btn btn-ghost p-1.5 hover:bg-red-500/10 hover:text-red-400 group transition"
                                                    aria-label="Eliminar pedido"
                                                    title="Eliminar pedido"
                                                >
                                                    <Trash2 size={16} className="text-gray-500 group-hover:text-red-400 transition" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm mt-2">
                                        <p><strong>Cliente:</strong> {p.cliente_nombre}</p>
                                        <p><strong>Tel:</strong> {p.cliente_telefono}</p>
                                        <p><strong>Correo:</strong> <a href={`mailto:${p.cliente_correo}`} className="text-[#9356A0] hover:underline">{p.cliente_correo}</a></p>
                                        <p><strong>Dirección:</strong> {p.direccion}</p>
                                        <p><strong>Pago:</strong> <span className="uppercase">{p.metodo_pago}</span></p>
                                        {p.notas && <p className="text-gray-400 mt-1 italic">"{p.notas}"</p>}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-[rgba(114,76,157,0.2)]">
                                        <p className="font-semibold text-xs mb-1 text-[rgba(220,202,233,0.5)] uppercase tracking-widest">
                                            Artículos
                                        </p>
                                        <ul className="text-sm flex flex-col gap-1">
                                            {p.items?.map((item) => (
                                                <li key={item.id} className="flex justify-between">
                                                    <span>{item.cantidad}x {item.producto_nombre || `Producto #${item.producto_id}`}</span>
                                                    <span>{formatPrice(item.precio_unitario * item.cantidad)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[rgba(114,76,157,0.2)]">
                                            <span className="font-bold">Total:</span>
                                            <span className="font-bold text-[#9356A0]">
                                                {formatPrice(
                                                    p.items?.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0) || 0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tabActivo === "personalizado" && (
                <div className="flex flex-col gap-4">
                    {isLoadingPerson ? (
                        <p className="text-[rgba(220,202,233,0.5)]">Cargando pedidos...</p>
                    ) : pedidosPerson?.length === 0 ? (
                        <p className="text-[rgba(220,202,233,0.5)]">No hay pedidos personalizados aún.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pedidosPerson?.map((p) => (
                                <div key={p.id} className="card p-5 flex flex-col gap-3 border-t-4 border-t-[#9356A0]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg" style={{ color: "#DCCAE9" }}>
                                                Personalizado #{p.id}
                                            </h3>
                                            <p className="text-xs text-[rgba(220,202,233,0.6)]">
                                                {format(new Date(p.creado_en), "PPP - p", { locale: es })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="input text-xs w-auto py-1 px-2 h-auto"
                                                value={p.estado}
                                                onChange={(e) => handleActualizarEstadoPer(p.id, e.target.value)}
                                            >
                                                {ESTADOS_PERSONALIZADO.map((est) => (
                                                    <option key={est} value={est}>
                                                        {est.replace("_", " ")}
                                                    </option>
                                                ))}
                                            </select>

                                            {(p.estado === "ENTREGADO" || p.estado === "CANCELADO") && (
                                                <button
                                                    onClick={() => handleEliminarPerson(p.id)}
                                                    className="btn btn-ghost p-1.5 hover:bg-red-500/10 hover:text-red-400 group transition"
                                                    aria-label="Eliminar pedido"
                                                    title="Eliminar pedido"
                                                >
                                                    <Trash2 size={16} className="text-gray-500 group-hover:text-red-400 transition" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm mt-2">
                                        <p><strong>Cliente:</strong> {p.cliente_nombre}</p>
                                        <p><strong>Tel:</strong> {p.cliente_telefono}</p>
                                        <p><strong>Correo:</strong> <a href={`mailto:${p.cliente_correo}`} className="text-[#9356A0] hover:underline">{p.cliente_correo}</a></p>
                                        <p><strong>Dirección:</strong> {p.direccion}</p>
                                        <p className="mt-2 text-gray-300"><strong>Idea de Diseño:</strong><br />{p.descripcion}</p>
                                        {p.notas && <p className="text-gray-400 mt-1 italic">"{p.notas}"</p>}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-[rgba(114,76,157,0.2)]">
                                        <p className="font-semibold text-xs mb-1 text-[rgba(220,202,233,0.5)] uppercase tracking-widest">
                                            Componentes Elegidos
                                        </p>
                                        <ul className="text-xs flex flex-wrap gap-1 mb-3">
                                            {p.componentes?.map((c) => (
                                                <li key={c.id} className="bg-[rgba(114,76,157,0.2)] px-2 py-1 rounded text-[#DCCAE9]">
                                                    {c.nombre}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto pt-3 border-t border-[rgba(114,76,157,0.2)] flex items-center justify-between">
                                            {p.precio_definido ? (
                                                <>
                                                    <span className="font-bold">Total Acordado:</span>
                                                    <span className="font-bold text-[#9356A0]">
                                                        {formatPrice(p.precio_definido)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-yellow-500 font-medium text-sm">Falta Cotizar</span>
                                                    <button
                                                        onClick={() => handleFijarPrecio(p.id)}
                                                        className="btn btn-primary btn-sm"
                                                        disabled={p.estado !== "PENDIENTE"}
                                                    >
                                                        Definir Precio
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
