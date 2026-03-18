"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, ImageOff, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useProducto, useCategorias } from "@/lib/hooks";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";

export default function EditarProductoPage() {
    const router = useRouter();
    const params = useParams();
    const qc = useQueryClient();
    const productId = parseInt(params.id as string, 10);

    // Obtener los datos actuales del producto
    const { data: producto, isLoading: isLoadingProduct, isError } = useProducto(productId);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingFoto, setUploadingFoto] = useState(false);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        tipo: "Manilla",
        estilo_tejido: "",
        color_hilo: "",
        digen: "",
        stock: "1",
        activo: true,
        categoria_id: "" as string | number,
    });

    const { data: categorias } = useCategorias();
    const tiposDisponibles = ["Manilla", "Anillo", "Collar", "Aretes", "Tobillera", "Accesorio"];

    // Cargar los datos en el formulario cuando la petición termine
    useEffect(() => {
        if (producto) {
            setFormData({
                nombre: producto.nombre ?? "",
                descripcion: producto.descripcion ?? "",
                precio: producto.precio?.toString() ?? "",
                tipo: producto.tipo ?? "Manilla",
                estilo_tejido: producto.estilo_tejido ?? "",
                color_hilo: producto.color_hilo ?? "",
                digen: producto.digen ?? "",
                stock: producto.stock?.toString() ?? "1",
                activo: producto.activo ?? true,
                categoria_id: producto.categoria_id ?? "",
            });
        }
    }, [producto]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    }

    function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setFotoPreview(previewUrl);
        e.target.value = "";
    }

    function cancelarFotoPreview() {
        if (fotoPreview) {
            URL.revokeObjectURL(fotoPreview);
        }
        setFotoPreview(null);
    }

    async function cambiarFotoPrincipal() {
        if (!fotoPreview) return;

        // Obtener el archivo del preview
        const fileInput = fileInputRef.current;
        if (!fileInput?.files?.[0]) return;

        const file = fileInput.files[0];
        setUploadingFoto(true);

        try {
            // 1. Subir a Cloudinary
            const results = await uploadMultipleToCloudinary([file]);
            const { secure_url, public_id } = results[0];

            // 2. Actualizar foto_principal en el backend
            await api.put(`/api/productos/${productId}`, {
                foto_principal: secure_url,
                foto_principal_public_id: public_id,
            });

            toast.success("Foto principal actualizada");

            // 3. Refrescar caché
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
            qc.invalidateQueries({ queryKey: ["productos"] });
            qc.invalidateQueries({ queryKey: ["producto", productId] });

            // 4. Limpiar preview
            cancelarFotoPreview();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message ?? "Error al cambiar la foto");
        } finally {
            setUploadingFoto(false);
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
                categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
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

            // Llamar a la API (Endpoint PUT para editar)
            await api.put(`/api/productos/${productId}`, payload);

            toast.success("Producto modificado exitosamente");

            // Refrescar caché
            qc.invalidateQueries({ queryKey: ["productos-admin"] });
            qc.invalidateQueries({ queryKey: ["productos"] });
            qc.invalidateQueries({ queryKey: ["producto", productId] });

            // Redirigir de vuelta a la lista de productos
            router.push("/admin/productos");

        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.detail ?? "Error al editar el producto");
        } finally {
            setLoading(false);
        }
    }

    if (isLoadingProduct) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                <Loader2 size={32} className="animate-spin" style={{ color: "rgba(147,86,160,0.8)" }} />
            </div>
        );
    }

    if (isError || !producto) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
                <p className="text-red-400">Producto no encontrado</p>
                <Link href="/admin/productos" className="btn btn-secondary">
                    Volver
                </Link>
            </div>
        );
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
                    <h1 className="section-title text-xl mb-1">Editar producto</h1>
                    <p className="section-subtitle text-xs">Modifica la información general de la pieza.</p>
                </div>
            </div>

            {/* Sección de Foto Principal */}
            <div className="card p-6 md:p-8 mb-6">
                <h2 className="text-sm font-semibold mb-4" style={{ color: "#DCCAE9" }}>Foto Principal</h2>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Foto actual o preview */}
                    <div className="flex-shrink-0">
                        <div
                            className="relative w-32 h-32 rounded-lg overflow-hidden flex items-center justify-center"
                            style={{ background: "rgba(44,27,71,0.6)", border: "1px solid rgba(114,76,157,0.3)" }}
                        >
                            {fotoPreview ? (
                                <img
                                    src={fotoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : producto?.fotos?.[0]?.url ? (
                                <Image
                                    src={producto.fotos[0].url}
                                    alt={producto.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="128px"
                                />
                            ) : (
                                <ImageOff size={32} style={{ color: "rgba(220,202,233,0.25)" }} />
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        {fotoPreview ? (
                            <>
                                <div>
                                    <p className="text-xs" style={{ color: "rgba(220,202,233,0.6)" }}>
                                        Nueva foto seleccionada
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={cambiarFotoPrincipal}
                                        disabled={uploadingFoto}
                                        className="btn btn-primary btn-sm"
                                    >
                                        {uploadingFoto ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Subiendo…
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={14} />
                                                Cambiar Foto
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelarFotoPreview}
                                        disabled={uploadingFoto}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        <X size={14} />
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className="text-xs" style={{ color: "rgba(220,202,233,0.6)" }}>
                                        {producto?.fotos?.[0]?.url ? "Haz clic para cambiar la foto" : "Sin foto asignada"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-primary btn-sm w-fit"
                                >
                                    <Upload size={14} />
                                    Seleccionar Foto
                                </button>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={onFotoChange}
                        />
                    </div>
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

                    {/* Categoría */}
                    <div>
                        <label htmlFor="categoria_id" className="input-label">Categoría</label>
                        <div className="relative">
                            <select
                                id="categoria_id"
                                name="categoria_id"
                                value={formData.categoria_id === "" ? "" : formData.categoria_id}
                                onChange={handleChange}
                                className="input appearance-none pr-10"
                            >
                                <option value="" className="bg-[#0f0818]">Sin categoría</option>
                                {categorias?.map((c) => (
                                    <option key={c.id} value={c.id} className="bg-[#0f0818]">{c.nombre}</option>
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

                        {/* Herraje/Dije */}
                        <div>
                            <label htmlFor="digen" className="input-label">Herraje/Dije</label>
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
                            <><Save size={18} /> Guardar Cambios</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
