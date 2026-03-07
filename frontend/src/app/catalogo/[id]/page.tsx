"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import {
    ArrowLeft, ShoppingCart, ImageOff, ChevronLeft, ChevronRight, Package,
} from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { useProducto } from "@/lib/hooks";
import { EryoLogo } from "@/components/EryoLogo";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";

export default function DetalleProductoPage() {
    const { id } = useParams<{ id: string }>();
    const productoId = Number(id);

    const { data: producto, isLoading, isError } = useProducto(productoId);
    const { addToCart } = useCart();
    const [fotoIdx, setFotoIdx] = useState(0);
    const [cantidad, setCantidad] = useState(1);

    // ── Loading ──────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="skeleton w-16 h-16 rounded-full" />
                    <div className="skeleton w-40 h-4 rounded" />
                </div>
            </div>
        );
    }

    if (isError || !producto) return null; // Next notFound() solo funciona en server components

    const fotos = [...(producto.fotos ?? [])].sort((a, b) => a.orden - b.orden);
    const fotoActual = fotos[fotoIdx];
    const agotado = producto.stock === 0;

    const attrs: Array<{ label: string; value: string | undefined }> = [
        { label: "Tipo", value: producto.tipo },
        { label: "Estilo tejido", value: producto.estilo_tejido },
        { label: "Color hilo", value: producto.color_hilo },
        { label: "Dije / Herraje", value: producto.digen },
        { label: "Stock", value: producto.stock > 0 ? `${producto.stock} disponibles` : "Agotado" },
    ];

    function agregarAlCarrito() {
        if (!producto) return;
        addToCart({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad,
            foto: fotos[0]?.url ?? null,
        }, cantidad);
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Navbar ─────────────────────────────── */}
            <header
                className="sticky top-0 z-50 backdrop-blur-md"
                style={{ borderBottom: "1px solid rgba(114,76,157,0.2)" }}
            >
                <nav className="page-container h-16 flex items-center justify-between">
                    <Link href="/" aria-label="Inicio">
                        <EryoLogo height={48} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/catalogo" className="btn btn-ghost text-sm">Catálogo</Link>
                        <Link href="/personalizado" className="btn btn-ghost text-sm">Personalizar</Link>
                        <Link href="/carrito" className="btn btn-secondary btn-sm">
                            <ShoppingBag size={15} />Carrito
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="page-container py-10 flex-1">
                {/* Breadcrumb */}
                <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 text-sm mb-8 hover:underline"
                    style={{ color: "rgba(220,202,233,0.5)" }}
                >
                    <ArrowLeft size={15} />
                    Volver al catálogo
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                    {/* ── Galería de fotos ──────────────────── */}
                    <div className="flex flex-col gap-3">
                        {/* Foto principal */}
                        <div
                            className="relative aspect-square rounded-xl overflow-hidden"
                            style={{ background: "rgba(44,27,71,0.5)", border: "1px solid rgba(114,76,157,0.25)" }}
                        >
                            {fotoActual ? (
                                <Image
                                    src={fotoActual.url}
                                    alt={`${producto.nombre} — foto ${fotoIdx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                    <ImageOff size={48} style={{ color: "rgba(220,202,233,0.2)" }} />
                                    <span className="text-sm" style={{ color: "rgba(220,202,233,0.3)" }}>Sin foto</span>
                                </div>
                            )}

                            {/* Controles galería */}
                            {fotos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setFotoIdx((i) => Math.max(0, i - 1))}
                                        disabled={fotoIdx === 0}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-ghost p-2 rounded-full"
                                        style={{ background: "rgba(11,2,5,0.6)", backdropFilter: "blur(4px)" }}
                                        aria-label="Foto anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setFotoIdx((i) => Math.min(fotos.length - 1, i + 1))}
                                        disabled={fotoIdx === fotos.length - 1}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost p-2 rounded-full"
                                        style={{ background: "rgba(11,2,5,0.6)", backdropFilter: "blur(4px)" }}
                                        aria-label="Foto siguiente"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Miniaturas */}
                        {fotos.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {fotos.map((f, i) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFotoIdx(i)}
                                        className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
                                        style={{
                                            border: i === fotoIdx
                                                ? "2px solid #9356A0"
                                                : "2px solid transparent",
                                            opacity: i === fotoIdx ? 1 : 0.6,
                                        }}
                                        aria-label={`Ver foto ${i + 1}`}
                                    >
                                        <Image src={f.url} alt={`miniatura ${i + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Info del producto ─────────────────── */}
                    <div className="flex flex-col gap-6">
                        {/* Tipo chip */}
                        <div>
                            <span
                                className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
                                style={{ background: "rgba(147,86,160,0.15)", color: "#9356A0" }}
                            >
                                {producto.tipo}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#DCCAE9" }}>
                            {producto.nombre}
                        </h1>

                        {/* Precio */}
                        <div className="text-3xl font-bold" style={{ color: "#9356A0" }}>
                            {formatPrice(producto.precio)}
                        </div>

                        {producto.descripcion && (
                            <div className="leading-relaxed text-[rgba(220,202,233,0.65)] flex flex-col gap-2">
                                {producto.descripcion.split('\n').map((line, idx) => (
                                    <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        )}

                        <hr className="divider" />

                        {/* Atributos */}
                        <dl className="grid grid-cols-2 gap-y-3 gap-x-4">
                            {attrs.filter((a) => a.value).map((a) => (
                                <div key={a.label}>
                                    <dt className="input-label">{a.label}</dt>
                                    <dd className="text-sm font-medium" style={{ color: "#DCCAE9" }}>{a.value}</dd>
                                </div>
                            ))}
                        </dl>

                        <hr className="divider" />

                        {/* Selector de cantidad + botón */}
                        {!agotado && (
                            <div className="flex items-center gap-3">
                                <label htmlFor="cantidad" className="input-label mb-0">Cantidad</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                        className="btn btn-secondary w-8 h-8 p-0 flex items-center justify-center text-lg"
                                        aria-label="Reducir cantidad"
                                    >
                                        −
                                    </button>
                                    <span
                                        id="cantidad"
                                        className="w-10 text-center font-bold"
                                        style={{ color: "#DCCAE9" }}
                                    >
                                        {cantidad}
                                    </span>
                                    <button
                                        onClick={() => setCantidad((c) => Math.min(producto!.stock, c + 1))}
                                        className="btn btn-secondary w-8 h-8 p-0 flex items-center justify-center text-lg"
                                        aria-label="Aumentar cantidad"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            id="btn-agregar-carrito"
                            onClick={agregarAlCarrito}
                            disabled={agotado}
                            className="btn btn-primary btn-lg w-full justify-center"
                        >
                            {agotado ? (
                                <>
                                    <Package size={18} /> Agotado
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={18} /> Agregar al carrito
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <footer
                className="py-8 text-center text-xs mt-12"
                style={{ borderTop: "1px solid rgba(114,76,157,0.15)", color: "rgba(220,202,233,0.35)" }}
            >
                &copy; {new Date().getFullYear()} Eryó — Bisutería Artesanal. Barranquilla, Colombia.
            </footer>
        </div>
    );
}
