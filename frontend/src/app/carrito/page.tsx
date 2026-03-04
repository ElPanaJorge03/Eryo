"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CheckCircle, Loader2 } from "lucide-react";
import { EryoLogo } from "@/components/EryoLogo";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useCart } from "@/lib/CartContext";

export default function CarritoPage() {
    const router = useRouter();
    const { cart, updateQuantity, removeItem, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Estado del checkout
    const [formData, setFormData] = useState({
        cliente_nombre: "",
        cliente_telefono: "",
        cliente_correo: "",
        direccion: "",
        metodo_pago: "contraentrega",
        notas: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error("El carrito está vacío");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                items: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad
                }))
            };

            await api.post("/api/pedidos/estandar", payload);

            // Vaciar carrito
            clearCart();
            setSuccess(true);
            toast.success("Pedido realizado con éxito");

        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.detail ?? "Error al procesar el pedido. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col pt-16 page-container text-center items-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(52,211,153,0.2)" }}>
                    <CheckCircle size={40} style={{ color: "#34d399" }} />
                </div>
                <h1 className="text-3xl font-bold mb-4" style={{ color: "#DCCAE9" }}>¡Pedido Recibido!</h1>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Tu orden está en nuestras manos. Nos comunicaremos contigo vía WhatsApp al número que nos proporcionaste para confirmar el envío.
                </p>
                <Link href="/catalogo" className="btn btn-primary px-8">
                    Seguir comprando
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md mb-6 md:mb-10" style={{ borderBottom: "1px solid rgba(114,76,157,0.2)" }}>
                <nav className="page-container h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="btn btn-ghost p-2" aria-label="Volver">
                            <ArrowLeft size={20} />
                        </button>
                        <Link href="/">
                            <EryoLogo height={36} />
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 page-container max-w-5xl">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingBag size={28} style={{ color: "#9356A0" }} />
                    <h1 className="section-title text-2xl mb-0">Mi Carrito</h1>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-20 card">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-30 text-[#9356A0]" />
                        <h2 className="text-xl font-semibold mb-2 text-[#DCCAE9]">Tu carrito está vacío</h2>
                        <p className="text-gray-400 mb-8">Parece que aún no has agregado ninguna pieza de nuestro catálogo.</p>
                        <Link href="/catalogo" className="btn btn-primary inline-flex">
                            Explorar catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Lista de productos */}
                        <div className="lg:col-span-7 space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="card p-4 flex gap-4 items-center relative overflow-hidden">
                                    {/* Imagen miniatura */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-[#0f0818] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[rgba(147,86,160,0.3)]">
                                        {item.foto ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag size={24} className="opacity-20" />
                                        )}
                                    </div>

                                    {/* Detalles */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm md:text-base leading-tight mb-1 text-[#DCCAE9] truncate">
                                            {item.nombre}
                                        </h3>
                                        <p className="font-bold text-[#9356A0] mb-3">
                                            ${item.precio.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                        </p>

                                        {/* Controles de cantidad */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-[#0b0205] border border-[rgba(114,76,157,0.3)] rounded-full h-8 overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-full flex justify-center items-center hover:bg-[rgba(147,86,160,0.2)] transition text-[#DCCAE9]"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-full flex justify-center items-center hover:bg-[rgba(147,86,160,0.2)] transition text-[#DCCAE9]"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Borrar */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="btn btn-ghost p-3 absolute right-2 top-2 hover:bg-red-500/10 hover:text-red-400 group transition"
                                        aria-label="Remover producto"
                                    >
                                        <Trash2 size={18} className="text-gray-500 group-hover:text-red-400 transition" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Form */}
                        <div className="lg:col-span-5">
                            <form onSubmit={handleSubmit} className="card p-6 md:p-8 sticky top-24">
                                <h2 className="text-lg font-semibold mb-6 text-[#DCCAE9] border-b border-[rgba(114,76,157,0.2)] pb-4">Detalles del Envío</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="cliente_nombre" className="input-label">Nombre completo *</label>
                                        <input type="text" id="cliente_nombre" name="cliente_nombre" required value={formData.cliente_nombre} onChange={handleChange} className="input" placeholder="Ej: María Pérez" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="cliente_telefono" className="input-label">Teléfono/WhatsApp *</label>
                                            <input type="tel" id="cliente_telefono" name="cliente_telefono" required value={formData.cliente_telefono} onChange={handleChange} className="input" placeholder="300 000 0000" />
                                        </div>
                                        <div>
                                            <label htmlFor="cliente_correo" className="input-label">Correo electrónico *</label>
                                            <input type="email" id="cliente_correo" name="cliente_correo" required value={formData.cliente_correo} onChange={handleChange} className="input" placeholder="correo@ejemplo.com" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="direccion" className="input-label">Dirección completa *</label>
                                        <textarea id="direccion" name="direccion" required value={formData.direccion} onChange={handleChange} className="input py-3" placeholder="Calle, Carrera, Barrio (Solo Barranquilla y alrededores)" rows={2} />
                                    </div>

                                    <div>
                                        <label htmlFor="notas" className="input-label">Notas adicionales (Opcional)</label>
                                        <input type="text" id="notas" name="notas" value={formData.notas} onChange={handleChange} className="input" placeholder="Instrucciones para la entrega..." />
                                    </div>

                                    <div>
                                        <label htmlFor="metodo_pago" className="input-label">Método de pago</label>
                                        <div className="relative">
                                            <select id="metodo_pago" name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="input appearance-none pr-10">
                                                <option value="contraentrega" className="bg-[#0f0818]">Pago Contraentrega (Efectivo)</option>
                                                <option value="transferencia" className="bg-[#0f0818]">Transferencia Bancaria (Nequi/Bancolombia)</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {formData.metodo_pago === "transferencia"
                                                ? "Nos contactaremos contigo para enviarte los datos exactos del pago."
                                                : "Pagas en casa exactamente el monto al recibir tu pedido."}
                                        </p>
                                    </div>
                                </div>

                                <hr className="divider my-6" />

                                {/* Total */}
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-400">Total a pagar</span>
                                    <span className="text-2xl font-bold text-[#9356A0]">
                                        ${total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
                                    {loading ? <><Loader2 size={18} className="animate-spin" /> Procesando…</> : "Completar pedido"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
