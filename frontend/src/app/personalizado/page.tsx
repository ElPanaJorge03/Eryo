"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, Palette } from "lucide-react";
import { EryoLogo } from "@/components/EryoLogo";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useComponentes } from "@/lib/hooks";

export default function PersonalizadoPage() {
    // Agrupamos la consulta de componentes
    const { data: componentes, isLoading: isLoadingComponentes } = useComponentes();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Selecciones del usuario
    const [selectedComponentes, setSelectedComponentes] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        cliente_nombre: "",
        cliente_telefono: "",
        cliente_correo: "",
        direccion: "",
        descripcion: "",
        notas: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleComponente = (id: number, tipo: string) => {
        // Obtenemos los id's de los componentes del mismo tipo que están actualmente seleccionados
        const sameTypeIds = componentes?.filter(c => c.tipo === tipo).map(c => c.id) || [];

        setSelectedComponentes(prev => {
            // Permitimos deseleccionar o seleccionar (como radio button, pero permitiendo deselección o selección única por tipo)
            // Si quieres selección múltiple por tipo, quita este filter
            const filtered = prev.filter(cId => !sameTypeIds.includes(cId));
            if (prev.includes(id)) {
                return filtered; // Lo quitó
            }
            return [...filtered, id]; // Lo agregó
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que se haya elegido al menos un tipo de pieza o descrito la idea
        if (selectedComponentes.length === 0 && formData.descripcion.trim().length === 0) {
            toast.error("Por favor, selecciona algún componente o describe tu idea detalladamente.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                componente_ids: selectedComponentes
            };

            await api.post("/api/pedidos/personalizado", payload);

            setSuccess(true);
            toast.success("Solicitud enviada con éxito");

        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.detail ?? "Error al enviar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    // Agrupamiento
    const compsDisponibles = componentes?.filter(c => c.disponible) || [];
    const tipos = [
        { key: "tipo_pieza", label: "Tipo de Pieza" },
        { key: "tejido", label: "Estilo de Tejido" },
        { key: "color", label: "Color del Hilo" },
        { key: "digen", label: "Dijen / Centro" }
    ];

    if (success) {
        return (
            <div className="min-h-screen flex flex-col pt-16 page-container text-center items-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(147,86,160,0.2)" }}>
                    <CheckCircle size={40} style={{ color: "#DCCAE9" }} />
                </div>
                <h1 className="text-3xl font-bold mb-4" style={{ color: "#DCCAE9" }}>¡Solicitud Recibida!</h1>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Revisaremos tu diseño y la disponibilidad de materiales. Muy pronto te contactaremos por WhatsApp con el <strong>precio y tiempo de entrega estimado</strong>.
                </p>
                <div className="p-4 rounded-xl border mb-10 text-left w-full max-w-sm" style={{ border: "1px solid rgba(114,76,157,0.3)", background: "rgba(44,27,71,0.2)" }}>
                    <p className="text-sm text-[#DCCAE9] mb-2 font-semibold">¿Qué sigue?</p>
                    <ol className="text-sm text-gray-400 list-decimal list-inside space-y-1">
                        <li>Recibes el precio vía correo / WhatsApp.</li>
                        <li>Tú apruebas o rechazas el pedido.</li>
                        <li>Si apruebas, comenzamos a crearlo. ¡Pagas al recibir!</li>
                    </ol>
                </div>
                <Link href="/" className="btn btn-primary px-8">
                    Volver al inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-md mb-6 md:mb-10" style={{ borderBottom: "1px solid rgba(114,76,157,0.2)" }}>
                <nav className="page-container h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="btn btn-ghost p-2" aria-label="Volver">
                            <ArrowLeft size={20} />
                        </Link>
                        <Link href="/">
                            <EryoLogo height={36} />
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 page-container max-w-4xl">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full" style={{ background: "rgba(147,86,160,0.15)" }}>
                            <Palette size={32} style={{ color: "#9356A0" }} />
                        </div>
                    </div>
                    <h1 className="section-title text-3xl">Crea tu Pieza Única</h1>
                    <p className="text-gray-400 mt-3">
                        Selecciona los estilos que te gustaría combinar y descríbenos la idea que tienes en mente. Nosotros nos encargamos de darte una cotización.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Sección 1: Componentes */}
                    <div className="card p-6 md:p-8">
                        <h2 className="text-xl font-semibold mb-6 text-[#DCCAE9] border-b border-[rgba(114,76,157,0.2)] pb-4">
                            1. Elige los materiales
                        </h2>

                        {isLoadingComponentes ? (
                            <div className="flex justify-center py-10">
                                <Loader2 size={32} className="animate-spin" style={{ color: "#9356A0" }} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {tipos.map(categoria => {
                                    const items = compsDisponibles.filter(c => c.tipo === categoria.key);
                                    if (items.length === 0) return null;

                                    return (
                                        <div key={categoria.key}>
                                            <h3 className="font-medium text-[rgba(220,202,233,0.8)] mb-3">{categoria.label}</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {items.map(item => {
                                                    const isSelected = selectedComponentes.includes(item.id);
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => toggleComponente(item.id, categoria.key)}
                                                            className={`flex items-center gap-3 p-2 pr-4 rounded-full text-sm font-medium transition-all ${isSelected
                                                                ? "shadow-lg bg-[#9356A0] text-white border-[#DCCAE9]"
                                                                : "hover:bg-[rgba(147,86,160,0.15)] text-[rgba(220,202,233,0.6)] border-[rgba(114,76,157,0.4)]"
                                                                }`}
                                                            style={{
                                                                borderWidth: "1px",
                                                                borderStyle: "solid"
                                                            }}
                                                        >
                                                            {/* Thumbnail Image */}
                                                            {item.imagen_url ? (
                                                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/5 relative">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={item.imagen_url}
                                                                        alt={item.nombre}
                                                                        className="w-full h-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                // Placeholder if no image
                                                                <div className="w-8 h-8 rounded-full bg-[rgba(114,76,157,0.2)] shrink-0 flex items-center justify-center">
                                                                    <Palette size={14} className={isSelected ? "text-[rgba(255,255,255,0.7)]" : "text-[#9356A0]"} />
                                                                </div>
                                                            )}
                                                            <span>{item.nombre}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sección 2: Explicación de la idea */}
                    <div className="card p-6 md:p-8">
                        <h2 className="text-xl font-semibold mb-6 text-[#DCCAE9] border-b border-[rgba(114,76,157,0.2)] pb-4">
                            2. Cuéntanos tu idea
                        </h2>

                        <div>
                            <label htmlFor="descripcion" className="input-label">Descripción del diseño *</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                required
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="input min-h-[120px] py-3"
                                placeholder="Ej: Quiero combinar el tejido macramé con colores negro y rojo, y en el centro un dije de corazón plata. También me gustaría que fuera ajustable..."
                            />
                        </div>
                    </div>

                    {/* Sección 3: Datos de Contacto */}
                    <div className="card p-6 md:p-8">
                        <h2 className="text-xl font-semibold mb-6 text-[#DCCAE9] border-b border-[rgba(114,76,157,0.2)] pb-4">
                            3. Tus datos de contacto
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="cliente_nombre" className="input-label">Nombre completo *</label>
                                <input type="text" id="cliente_nombre" name="cliente_nombre" required value={formData.cliente_nombre} onChange={handleChange} className="input" placeholder="Ej: María Pérez" />
                            </div>

                            <div>
                                <label htmlFor="cliente_telefono" className="input-label">Teléfono/WhatsApp *</label>
                                <input type="tel" id="cliente_telefono" name="cliente_telefono" required value={formData.cliente_telefono} onChange={handleChange} className="input" placeholder="300 000 0000" />
                            </div>

                            <div>
                                <label htmlFor="cliente_correo" className="input-label">Correo electrónico *</label>
                                <input type="email" id="cliente_correo" name="cliente_correo" required value={formData.cliente_correo} onChange={handleChange} className="input" placeholder="correo@ejemplo.com" />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="direccion" className="input-label">Dirección (Solo Barranquilla y alrededores) *</label>
                                <input type="text" id="direccion" name="direccion" required value={formData.direccion} onChange={handleChange} className="input" placeholder="Ej: Calle 10 #20-30, Barrio X" />
                            </div>

                            <div className="md:col-span-2 mt-4 text-center">
                                <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto md:px-12 py-3 text-lg">
                                    {loading ? <><Loader2 size={18} className="animate-spin" /> Procesando petición…</> : "Enviar Solicitud de Cotización"}
                                </button>
                                <p className="text-xs text-gray-500 mt-4">Al enviar esta solicitud, no te estás comprometiendo a pagar nada todavía. Primero recibirás y aprobarás el precio propuesto.</p>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
