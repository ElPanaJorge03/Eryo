"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function NuevoProductoPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        tipo: "Manilla", // Valor por defecto
        estilo_tejido: "",
        color_hilo: "",
        digen: "",
        stock: "1",
        activo: true,
    });

    const tiposDisponibles = ["Manilla", "Anillo", "Collar", "Aretes", "Tobillera", "Accesorio"];

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // Preparar el payload asegurando tipos numéricos
            const payload = {
                ...formData,
                precio: parseFloat(formData.precio),
                stock: parseInt(formData.stock, 10),
            };

            if (isNaN(payload.precio) || payload.precio <= 0) {
                toast.error("El precio debe ser mayor a 0");
                setLoading(false);
                return;
            }

            if (isNaN(payload.stock) || payload.stock < 0) {
                toast.error("El stock no puede ser negativo");
                setLoading(false);
                return;
            }

            // Llamar a la API
            await api.post("/api/productos/", payload);

            toast.success("Producto creado exitosamente");

            // Refrescar caché
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
            qc.invalidateQueries({ queryKey: ["productos"] });

            // Redirigir de vuelta a la lista de productos
            router.push("/admin/productos");

        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.detail ?? "Error al crear el producto");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/productos"
                    className="btn btn-ghost p-2 rounded-full"
                    aria-label="Volver"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="section-title text-xl mb-1">Nuevo producto</h1>
                    <p className="section-subtitle text-xs">Llena los datos base de tu diseño. Podrás añadir las fotos en el panel principal.</p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">

                {/* Info principal (Grilla 2 columnas) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                        <label htmlFor="nombre" className="input-label">Nombre del producto <span className="text-red-400">*</span></label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            className="input"
                            placeholder="Ej. Manilla Tejido Macramé con Corazón"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                        <label htmlFor="descripcion" className="input-label">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="input min-h-[100px] py-3"
                            placeholder="Describe los detalles, el material o la inspiración..."
                        />
                    </div>

                    {/* Precio */}
                    <div>
                        <label htmlFor="precio" className="input-label">Precio ($) <span className="text-red-400">*</span></label>
                        <input
                            id="precio"
                            name="precio"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={formData.precio}
                            onChange={handleChange}
                            className="input"
                            placeholder="Ej: 35.00"
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <label htmlFor="stock" className="input-label">Unidades en stock <span className="text-red-400">*</span></label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    {/* Tipo de pieza */}
                    <div>
                        <label htmlFor="tipo" className="input-label">Tipo de Pieza <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <select
                                id="tipo"
                                name="tipo"
                                required
                                value={formData.tipo}
                                onChange={handleChange}
                                className="input appearance-none pr-10"
                            >
                                {tiposDisponibles.map((t) => (
                                    <option key={t} value={t} className="bg-[#0f0818]">{t}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* Activo / Inactivo */}
                    <div className="flex flex-col justify-center">
                        <label className="input-label mb-2">Estado visible</label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9356A0]"></div>
                            </div>
                            <span className="text-sm font-medium" style={{ color: formData.activo ? "#DCCAE9" : "rgba(220,202,233,0.5)" }}>
                                {formData.activo ? "Activo (Visible en tienda)" : "Inactivo (Oculto)"}
                            </span>
                        </label>
                    </div>
                </div>

                <hr className="divider" />

                {/* Detalles Específicos de la pieza */}
                <div>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "#DCCAE9" }}>Especificaciones (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Estilo Tejido */}
                        <div>
                            <label htmlFor="estilo_tejido" className="input-label">Estilo de Tejido</label>
                            <input
                                id="estilo_tejido"
                                name="estilo_tejido"
                                type="text"
                                value={formData.estilo_tejido}
                                onChange={handleChange}
                                className="input"
                                placeholder="Ej: Macramé nudo plano"
                            />
                        </div>

                        {/* Color Hilo */}
                        <div>
                            <label htmlFor="color_hilo" className="input-label">Color del Hilo</label>
                            <input
                                id="color_hilo"
                                name="color_hilo"
                                type="text"
                                value={formData.color_hilo}
                                onChange={handleChange}
                                className="input"
                                placeholder="Ej: Negro, Rojo..."
                            />
                        </div>

                        {/* Digen / Centro */}
                        <div>
                            <label htmlFor="digen" className="input-label">Dijen o Pieza Central</label>
                            <input
                                id="digen"
                                name="digen"
                                type="text"
                                value={formData.digen}
                                onChange={handleChange}
                                className="input"
                                placeholder="Ej: Ojo Turco, Corazón Plata..."
                            />
                        </div>
                    </div>
                </div>

                {/* Acciones del formulario */}
                <div className="flex gap-4 pt-4 justify-end">
                    <Link href="/admin/productos" className="btn btn-secondary px-6">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary px-8"
                    >
                        {loading ? (
                            <><Loader2 size={18} className="animate-spin" /> Guardando…</>
                        ) : (
                            <><Save size={18} /> Crear Producto</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
