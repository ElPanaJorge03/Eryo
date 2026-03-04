"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, ShieldCheck, ShieldAlert, Upload, ImageOff } from "lucide-react";
import {
    useAdminComponentes,
    useCrearComponente,
    useActualizarComponente,
    useEliminarComponente,
} from "@/lib/hooks";
import type { Componente } from "@/lib/types";
import { uploadToCloudinary } from "@/lib/cloudinary";
import toast from "react-hot-toast";

const TIPOS_COMPONENTE = [
    { value: "tipo_pieza", label: "Tipo de Pieza (Manilla, Collar...)" },
    { value: "tejido", label: "Tejido" },
    { value: "color", label: "Color de Hilo" },
    { value: "digen", label: "Dije / Herraje" },
];

export default function AdminComponentesPage() {
    const { data: componentes, isLoading } = useAdminComponentes();
    const crearComp = useCrearComponente();
    const actualizarComp = useActualizarComponente();
    const eliminarComp = useEliminarComponente();

    // Filtro superior por tipo
    const [filtroTipo, setFiltroTipo] = useState<string>("todos");

    // Estado del formulario
    const [editando, setEditando] = useState<Componente | null>(null);
    const [mostrandoForm, setMostrandoForm] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [tipo, setTipo] = useState("tipo_pieza");
    const [nombre, setNombre] = useState("");
    const [disponible, setDisponible] = useState(true);
    const [imagenUrl, setImagenUrl] = useState<string | null>(null);

    const resetForm = () => {
        setNombre("");
        setTipo("tipo_pieza");
        setDisponible(true);
        setImagenUrl(null);
        setEditando(null);
        setMostrandoForm(false);
    };

    const handleEdit = (comp: Componente) => {
        setNombre(comp.nombre);
        setTipo(comp.tipo);
        setDisponible(comp.disponible);
        setImagenUrl(comp.imagen_url || null);
        setEditando(comp);
        setMostrandoForm(true);
    };

    const handleDelete = async (id: number, nombreInfo: string) => {
        if (!window.confirm(`¿Seguro que deseas eliminar definitivamente el componente '${nombreInfo}'? Si ya hay pedidos usando este componente podrían perder información visual.`)) {
            return;
        }
        try {
            await eliminarComp.mutateAsync(id);
            toast.success("Componente eliminado");
        } catch (error) {
            toast.error("Error al eliminar componente");
        }
    };

    const handleToggleDisponible = async (comp: Componente) => {
        try {
            await actualizarComp.mutateAsync({
                id: comp.id,
                disponible: !comp.disponible,
            });
            toast.success(`Componente ${!comp.disponible ? "Habilitado" : "Deshabilitado"}`);
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const res = await uploadToCloudinary(file);
            setImagenUrl(res.secure_url);
            toast.success("Imagen subida correctamente");
        } catch (error) {
            toast.error("Error al subir la imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => setImagenUrl(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editando) {
                await actualizarComp.mutateAsync({
                    id: editando.id,
                    nombre,
                    tipo,
                    disponible,
                    imagen_url: imagenUrl,
                });
                toast.success("Componente actualizado");
            } else {
                await crearComp.mutateAsync({
                    nombre,
                    tipo,
                    disponible,
                    imagen_url: imagenUrl,
                });
                toast.success("Componente agregado al inventario");
            }
            resetForm();
        } catch (error: any) {
            toast.error(error?.response?.data?.detail || "Error al procesar el componente");
        }
    };

    const componentesFiltrados =
        filtroTipo === "todos"
            ? componentes
            : componentes?.filter((c) => c.tipo === filtroTipo);

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold" style={{ color: "#DCCAE9" }}>
                    Insumos & Componentes
                </h1>
                {!mostrandoForm && (
                    <button
                        onClick={() => setMostrandoForm(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        Nuevo Componente
                    </button>
                )}
            </div>

            {/* ── Formulario ── */}
            {mostrandoForm && (
                <div className="card p-5 border border-dashed" style={{ borderColor: "#9356A0" }}>
                    <h2 className="text-lg font-bold mb-4">
                        {editando ? "Editar Componente" : "Agregar Nuevo Insumo"}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Clasificación *</label>
                                <select
                                    required
                                    className="input"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                >
                                    {TIPOS_COMPONENTE.map((tc) => (
                                        <option key={tc.value} value={tc.value}>
                                            {tc.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Nombre del Componente *</label>
                                <input
                                    required
                                    type="text"
                                    className="input"
                                    placeholder="Ej: Cruz Dorada, Espiral, Rojo pasión..."
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Imagen Upload Component */}
                        <div>
                            <label className="input-label">Imagen Referencial (Opcional)</label>
                            {imagenUrl ? (
                                <div className="relative w-[150px] aspect-square rounded-xl overflow-hidden border border-white/20">
                                    <Image src={imagenUrl} alt="Preview" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-1 right-1 bg-black/50 p-1 text-white rounded-md hover:bg-black/80"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full max-w-xs h-[150px] rounded-xl border-2 border-dashed border-[rgba(147,86,160,0.5)] bg-[rgba(147,86,160,0.05)] cursor-pointer hover:bg-[rgba(147,86,160,0.1)] transition-colors">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <div className="text-[#DCCAE9] flex flex-col items-center gap-2">
                                            <Upload size={24} className="animate-bounce" /> Subiendo...
                                        </div>
                                    ) : (
                                        <div className="text-[rgba(220,202,233,0.5)] flex flex-col items-center gap-2">
                                            <Upload size={24} /> Elegir Imagen
                                        </div>
                                    )}
                                </label>
                            )}
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer mt-2 w-max">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded"
                                checked={disponible}
                                onChange={(e) => setDisponible(e.target.checked)}
                            />
                            <span className="text-sm">Disponible para los clientes actualmente</span>
                        </label>

                        <div className="flex items-center gap-3 pt-3">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={crearComp.isPending || actualizarComp.isPending || uploading}
                            >
                                {editando ? "Guardar Cambios" : "Agregar al Inventario"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn btn-ghost"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtros Tabulares */}
            <div className="flex flex-wrap gap-2 pb-2 mt-4 border-b border-[rgba(114,76,157,0.3)]">
                <button
                    onClick={() => setFiltroTipo("todos")}
                    className={`px-3 py-1 font-medium text-sm rounded transition-colors ${filtroTipo === "todos"
                        ? "bg-[#9356A0] text-white"
                        : "bg-[rgba(147,86,160,0.1)] text-[#DCCAE9] hover:bg-[rgba(147,86,160,0.3)]"
                        }`}
                >
                    Todos
                </button>
                {TIPOS_COMPONENTE.map((tc) => (
                    <button
                        key={tc.value}
                        onClick={() => setFiltroTipo(tc.value)}
                        className={`px-3 py-1 font-medium text-sm rounded transition-colors ${filtroTipo === tc.value
                            ? "bg-[#9356A0] text-white"
                            : "bg-[rgba(147,86,160,0.1)] text-[#DCCAE9] hover:bg-[rgba(147,86,160,0.3)]"
                            }`}
                    >
                        {tc.label}
                    </button>
                ))}
            </div>

            {/* ── Lista de componentes ── */}
            {isLoading ? (
                <p className="text-[rgba(220,202,233,0.5)]">Cargando inventario de insumos...</p>
            ) : componentesFiltrados?.length === 0 ? (
                <p className="text-gray-400 italic pt-4">No hay componentes en esta vista.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {componentesFiltrados?.map((comp) => (
                        <div
                            key={comp.id}
                            className={`card p-4 flex flex-col gap-2 border-l-4 ${comp.disponible ? "border-l-emerald-500" : "border-l-red-500 opacity-60"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    {/* Thumbnail rendering */}
                                    <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-[rgba(255,255,255,0.05)] flex items-center justify-center border border-[rgba(114,76,157,0.2)]">
                                        {comp.imagen_url ? (
                                            <Image src={comp.imagen_url} alt={comp.nombre} width={64} height={64} className="object-cover w-full h-full" />
                                        ) : (
                                            <ImageOff size={20} className="text-[rgba(220,202,233,0.2)]" />
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9356A0]">
                                            {TIPOS_COMPONENTE.find(t => t.value === comp.tipo)?.label || comp.tipo}
                                        </span>
                                        <h3 className="font-bold text-lg leading-tight mt-1" style={{ color: "#DCCAE9" }}>
                                            {comp.nombre}
                                        </h3>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggleDisponible(comp)}
                                    title={comp.disponible ? "Ocultar catálogo" : "Publicar"}
                                    className="p-1 hover:bg-white/10 rounded ml-2"
                                >
                                    {comp.disponible ? (
                                        <ShieldCheck size={20} className="text-emerald-400" />
                                    ) : (
                                        <ShieldAlert size={20} className="text-red-400" />
                                    )}
                                </button>
                            </div>

                            <div className="mt-3 flex gap-2 justify-end pt-2 border-t border-[rgba(114,76,157,0.1)]">
                                <button
                                    onClick={() => handleEdit(comp)}
                                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[rgba(147,86,160,0.2)] text-[#DCCAE9] hover:bg-[#9356A0]"
                                >
                                    <Edit2 size={12} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(comp.id, comp.nombre)}
                                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[rgba(248,113,113,0.1)] text-red-400 hover:bg-[rgba(248,113,113,0.2)]"
                                >
                                    <Trash2 size={12} /> Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
