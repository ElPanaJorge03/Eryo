"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Plus, Trash2, Upload, ImageOff, Eye, EyeOff,
    Loader2, X, CheckCircle, Edit3
} from "lucide-react";
import { useProductosAdmin, useEliminarProducto } from "@/lib/hooks";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { ProductoResumen } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

// ─── Subcomponente: Gestor de fotos de un producto ───────────────────────────

interface FotoManagerProps {
    producto: ProductoResumen;
    onClose: () => void;
}

function FotoManager({ producto, onClose }: FotoManagerProps) {
    const qc = useQueryClient();
    const [fotos, setFotos] = useState<Array<{ id: number; url: string; orden: number }>>([]);
    const [previews, setPreviews] = useState<Array<{ file: File; previewUrl: string }>>([]);
    const [uploading, setUploading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cargar fotos actuales del producto
    async function cargarFotos() {
        if (loaded) return;
        try {
            const r = await api.get(`/api/productos/${producto.id}`);
            setFotos(r.data.fotos ?? []);
            setLoaded(true);
        } catch {
            toast.error("No se pudieron cargar las fotos");
        }
    }

    // Llamamos a cargar cuando monta
    if (!loaded) cargarFotos();

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const nuevos = files.map((f) => ({
            file: f,
            previewUrl: URL.createObjectURL(f),
        }));
        setPreviews((prev) => [...prev, ...nuevos]);
        // Reset input para poder elegir el mismo archivo dos veces
        e.target.value = "";
    }

    function quitarPreview(idx: number) {
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[idx].previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    }

    async function subirFotos() {
        if (previews.length === 0) return;
        setUploading(true);
        try {
            // 1. Subir todas a Cloudinary
            const results = await uploadMultipleToCloudinary(previews.map((p) => p.file));

            // 2. Guardar URLs en el backend
            const fotosPayload = results.map((r, i) => ({
                url: r.secure_url,
                public_id: r.public_id,
                orden: fotos.length + i,
            }));
            await api.post(`/api/productos/${producto.id}/fotos/batch`, fotosPayload);

            // 3. Actualizar estado local
            const nuevasFotos = results.map((r, i) => ({
                id: Date.now() + i,  // temporal hasta recargar
                url: r.secure_url,
                orden: fotos.length + i,
            }));
            setFotos((prev) => [...prev, ...nuevasFotos]);
            previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
            setPreviews([]);

            // Invalidar cache para que la lista se actualice
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
            qc.invalidateQueries({ queryKey: ["productos"] });

            toast.success(`${results.length} foto${results.length > 1 ? "s" : ""} subida${results.length > 1 ? "s" : ""} correctamente`);
        } catch (err: any) {
            toast.error(err?.message ?? "Error al subir las fotos");
        } finally {
            setUploading(false);
        }
    }

    async function eliminarFoto(fotoId: number) {
        try {
            await api.delete(`/api/productos/${producto.id}/fotos/${fotoId}`);
            setFotos((prev) => prev.filter((f) => f.id !== fotoId));
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
            qc.invalidateQueries({ queryKey: ["productos"] });
            toast.success("Foto eliminada");
        } catch {
            toast.error("No se pudo eliminar la foto");
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(11,2,5,0.85)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ padding: "28px" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="section-title text-lg mb-1">Gestionar fotos</h2>
                        <p className="section-subtitle text-xs">{producto.nombre}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Cerrar">
                        <X size={20} />
                    </button>
                </div>

                {/* Fotos actuales */}
                <div className="mb-6">
                    <label className="input-label mb-3 block">Fotos actuales ({fotos.length})</label>
                    {fotos.length === 0 ? (
                        <div
                            className="rounded-xl flex items-center justify-center gap-2 py-8"
                            style={{ background: "rgba(44,27,71,0.4)", border: "1px dashed rgba(114,76,157,0.3)" }}
                        >
                            <ImageOff size={20} style={{ color: "rgba(220,202,233,0.3)" }} />
                            <span className="text-sm" style={{ color: "rgba(220,202,233,0.3)" }}>
                                Sin fotos todavía
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {fotos.map((f) => (
                                <div key={f.id} className="relative aspect-square group">
                                    <Image
                                        src={f.url}
                                        alt="Foto del producto"
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="150px"
                                    />
                                    <button
                                        onClick={() => eliminarFoto(f.id)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ background: "rgba(248,113,113,0.9)" }}
                                        aria-label="Eliminar foto"
                                    >
                                        <X size={12} style={{ color: "white" }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <hr className="divider" />

                {/* Agregar nuevas fotos */}
                <div className="mb-6">
                    <label className="input-label mb-3 block">Agregar fotos nuevas</label>

                    {/* Zona de drop / botón */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 rounded-xl flex flex-col items-center gap-3 transition-colors cursor-pointer"
                        style={{
                            background: "rgba(44,27,71,0.3)",
                            border: "2px dashed rgba(114,76,157,0.4)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#9356A0")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(114,76,157,0.4)")}
                    >
                        <Upload size={28} style={{ color: "rgba(147,86,160,0.7)" }} />
                        <span className="text-sm" style={{ color: "rgba(220,202,233,0.5)" }}>
                            Clic para seleccionar fotos
                        </span>
                        <span className="text-xs" style={{ color: "rgba(220,202,233,0.3)" }}>
                            JPG, PNG o WebP — máx. 10MB por foto
                        </span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={onFileChange}
                    />
                </div>

                {/* Previews de fotos nuevas */}
                {previews.length > 0 && (
                    <div className="mb-6">
                        <label className="input-label mb-3 block">
                            Listas para subir ({previews.length})
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {previews.map((p, i) => (
                                <div key={p.previewUrl} className="relative aspect-square group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={p.previewUrl}
                                        alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                        style={{ border: "2px solid rgba(147,86,160,0.5)" }}
                                    />
                                    <button
                                        onClick={() => quitarPreview(i)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                        style={{ background: "rgba(248,113,113,0.9)" }}
                                        aria-label="Quitar preview"
                                    >
                                        <X size={12} style={{ color: "white" }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cerrar
                    </button>
                    {previews.length > 0 && (
                        <button
                            id="btn-subir-fotos"
                            onClick={subirFotos}
                            disabled={uploading}
                            className="btn btn-primary"
                        >
                            {uploading ? (
                                <><Loader2 size={16} className="animate-spin" /> Subiendo…</>
                            ) : (
                                <><Upload size={16} /> Subir {previews.length} foto{previews.length > 1 ? "s" : ""}</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminProductosPage() {
    const qc = useQueryClient();
    const { data: productos, isLoading } = useProductosAdmin();
    const eliminar = useEliminarProducto();
    const [fotoManager, setFotoManager] = useState<ProductoResumen | null>(null);

    async function toggleActivo(p: ProductoResumen) {
        try {
            await api.put(`/api/productos/${p.id}`, { activo: !p.activo });
            toast.success(p.activo ? "Producto desactivado" : "Producto activado");
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
            qc.invalidateQueries({ queryKey: ["productos"] });
        } catch (err: any) {
            console.error(err);
            toast.error("No se pudo actualizar el producto");
        }
    }

    async function confirmarEliminar(p: ProductoResumen) {
        if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminar.mutateAsync(p.id);
            toast.success("Producto eliminado");
        } catch (err: any) {
            console.error("Error al eliminar", err?.response?.data || err);
            toast.error(err?.response?.data?.detail ?? "No se pudo eliminar el producto");
        }
    }

    return (
        <>
            {fotoManager && (
                <FotoManager producto={fotoManager} onClose={() => setFotoManager(null)} />
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-title">Productos</h1>
                    <p className="section-subtitle">
                        {isLoading ? "Cargando…" : `${productos?.length ?? 0} productos en total`}
                    </p>
                </div>
                <Link href="/admin/productos/nuevo" className="btn btn-primary">
                    <Plus size={16} />
                    Nuevo producto
                </Link>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-20 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm min-w-max">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(114,76,157,0.2)" }}>
                                {["Foto", "Nombre", "Tipo", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 font-semibold"
                                        style={{ color: "rgba(220,202,233,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {productos?.map((p) => (
                                <tr
                                    key={p.id}
                                    style={{ borderBottom: "1px solid rgba(114,76,157,0.1)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(44,27,71,0.3)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    {/* Foto miniatura */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setFotoManager(p)}
                                            className="relative w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80"
                                            style={{ background: "rgba(44,27,71,0.6)", border: "1px solid rgba(114,76,157,0.3)" }}
                                            title="Gestionar fotos"
                                            aria-label={`Fotos de ${p.nombre}`}
                                        >
                                            {p.foto_principal ? (
                                                <Image src={p.foto_principal} alt={p.nombre} fill className="object-cover" sizes="48px" />
                                            ) : (
                                                <ImageOff size={16} style={{ color: "rgba(220,202,233,0.25)" }} />
                                            )}
                                        </button>
                                    </td>

                                    <td className="px-4 py-3 font-medium" style={{ color: "#DCCAE9", maxWidth: "200px" }}>
                                        <span className="line-clamp-1">{p.nombre}</span>
                                    </td>

                                    <td className="px-4 py-3" style={{ color: "rgba(220,202,233,0.6)" }}>
                                        {p.tipo}
                                    </td>

                                    <td className="px-4 py-3 font-semibold" style={{ color: "#9356A0" }}>
                                        {formatPrice(p.precio)}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            style={{
                                                color: p.stock === 0 ? "#f87171" : p.stock <= 3 ? "#fbbf24" : "#34d399",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {p.stock}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className={p.activo ? "badge badge-active" : "badge badge-cancelled"}>
                                            {p.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            {/* Editar Información */}
                                            <Link
                                                href={`/admin/productos/${p.id}`}
                                                className="btn btn-ghost btn-sm p-2"
                                                title="Editar producto"
                                                aria-label="Editar producto"
                                            >
                                                <Edit3 size={15} style={{ color: "#DCCAE9" }} />
                                            </Link>

                                            {/* Fotos */}
                                            <button
                                                onClick={() => setFotoManager(p)}
                                                className="btn btn-ghost btn-sm p-2"
                                                title="Gestionar fotos"
                                                aria-label="Gestionar fotos"
                                            >
                                                <Upload size={15} />
                                            </button>

                                            {/* Activar/Desactivar */}
                                            <button
                                                onClick={() => toggleActivo(p)}
                                                className="btn btn-ghost btn-sm p-2"
                                                title={p.activo ? "Desactivar" : "Activar"}
                                                aria-label={p.activo ? "Desactivar producto" : "Activar producto"}
                                            >
                                                {p.activo
                                                    ? <EyeOff size={15} style={{ color: "#fbbf24" }} />
                                                    : <Eye size={15} style={{ color: "#34d399" }} />}
                                            </button>

                                            {/* Eliminar */}
                                            <button
                                                onClick={() => confirmarEliminar(p)}
                                                className="btn btn-ghost btn-sm p-2"
                                                title="Eliminar producto"
                                                aria-label="Eliminar producto"
                                            >
                                                <Trash2 size={15} style={{ color: "#f87171" }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {productos?.length === 0 && (
                        <div className="text-center py-16" style={{ color: "rgba(220,202,233,0.4)" }}>
                            No hay productos. Crea el primero.
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
