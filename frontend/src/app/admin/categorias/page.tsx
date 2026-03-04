"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
    useCategorias,
    useCrearCategoria,
    useActualizarCategoria,
    useEliminarCategoria,
} from "@/lib/hooks";
import type { Categoria } from "@/lib/types";
import toast from "react-hot-toast";

export default function AdminCategoriasPage() {
    const { data: categorias, isLoading } = useCategorias();
    const crearCat = useCrearCategoria();
    const actualizarCat = useActualizarCategoria();
    const eliminarCat = useEliminarCategoria();

    // Estado del formulario
    const [editando, setEditando] = useState<Categoria | null>(null);
    const [mostrandoForm, setMostrandoForm] = useState(false);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const resetForm = () => {
        setNombre("");
        setDescripcion("");
        setEditando(null);
        setMostrandoForm(false);
    };

    const handleEdit = (cat: Categoria) => {
        setNombre(cat.nombre);
        setDescripcion(cat.descripcion);
        setEditando(cat);
        setMostrandoForm(true);
    };

    const handleDelete = async (id: number, nombreInfo: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar la categoría '${nombreInfo}'? Se perderá la referencia en los productos.`)) {
            return;
        }
        try {
            await eliminarCat.mutateAsync(id);
            toast.success("Categoría eliminada");
        } catch (error) {
            toast.error("Error al eliminar categoría");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editando) {
                await actualizarCat.mutateAsync({
                    id: editando.id,
                    nombre,
                    descripcion,
                });
                toast.success("Categoría actualizada");
            } else {
                await crearCat.mutateAsync({
                    nombre,
                    descripcion,
                });
                toast.success("Categoría creada");
            }
            resetForm();
        } catch (error: any) {
            toast.error(error?.response?.data?.detail || "Error al procesar la categoría");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold" style={{ color: "#DCCAE9" }}>
                    Gestión de Categorías
                </h1>
                {!mostrandoForm && (
                    <button
                        onClick={() => setMostrandoForm(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        Nueva Categoría
                    </button>
                )}
            </div>

            {/* ── Formulario ── */}
            {mostrandoForm && (
                <div className="card p-5 border border-dashed" style={{ borderColor: "#9356A0" }}>
                    <h2 className="text-lg font-bold mb-4">
                        {editando ? "Editar Categoría" : "Nueva Categoría"}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="input-label">Nombre *</label>
                            <input
                                required
                                type="text"
                                className="input"
                                placeholder="Ej: Anillos, Manillas de Hilo..."
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Descripción</label>
                            <textarea
                                className="input min-h-[80px]"
                                placeholder="Breve descripción opcional de esta sección"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={crearCat.isPending || actualizarCat.isPending}
                            >
                                {editando ? "Guardar Cambios" : "Crear Categoría"}
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

            {/* ── Lista de categorías ── */}
            {isLoading ? (
                <p className="text-[rgba(220,202,233,0.5)]">Cargando categorías...</p>
            ) : categorias?.length === 0 ? (
                <p className="text-[rgba(220,202,233,0.5)] pt-6">No has creado ninguna categoría.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorias?.map((cat) => (
                        <div key={cat.id} className="card p-5 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: "#DCCAE9" }}>
                                        {cat.nombre}
                                    </h3>
                                    <p className="text-sm mt-1 text-[rgba(220,202,233,0.6)]">
                                        {cat.descripcion || <span className="italic">Sin descripción</span>}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="p-2 rounded-lg transition-colors hover:bg-[rgba(147,86,160,0.2)]"
                                        style={{ color: "#DCCAE9" }}
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id, cat.nombre)}
                                        className="p-2 rounded-lg transition-colors hover:bg-[rgba(248,113,113,0.2)] text-red-400"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
