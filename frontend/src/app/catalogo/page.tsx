"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Gem, ChevronDown, ChevronUp } from "lucide-react";
import { useCategorias, useProductos } from "@/lib/hooks";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Select } from "@/components/Select";
import { EryoLogo } from "@/components/EryoLogo";
import { ShoppingBag } from "lucide-react";
import type { ProductoResumen } from "@/lib/types";
import toast from "react-hot-toast";
import { useCart } from "@/lib/CartContext";

const TIPOS = ["Manilla", "Anillo", "Collar", "Aretes", "Tobillera"];
const ULTIMOS_LIMIT = 8;

export default function CatalogoPage() {
    const [busqueda, setBusqueda] = useState("");
    const [categoriaId, setCategoriaId] = useState<number | undefined>();
    const [tipo, setTipo] = useState<string | undefined>();
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    /** "tipo" = filas por tipo de pieza; "categoria" = filas por categoría */
    const [vistaPor, setVistaPor] = useState<"tipo" | "categoria">("tipo");
    /** Clave = id de sección (tipo o categoria_id), valor = si la fila está expandida (ver más) */
    const [filasExpandidas, setFilasExpandidas] = useState<Record<string, boolean>>({});

    const { data: categorias } = useCategorias();
    const hayFiltros = !!busqueda || !!categoriaId || !!tipo;
    const {
        data: productos,
        isLoading,
        isError,
    } = useProductos({
        categoria_id: categoriaId,
        tipo,
        busqueda: busqueda || undefined,
        limit: hayFiltros ? undefined : 1000,
    });

    const limpiarFiltros = () => {
        setBusqueda("");
        setCategoriaId(undefined);
        setTipo(undefined);
    };

    const { addToCart, totalItems } = useCart();

    function agregarAlCarrito(producto: ProductoResumen) {
        addToCart({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            foto: producto.foto_principal,
        });
    }

    const toggleFila = useCallback((key: string) => {
        setFilasExpandidas((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    /** Fila horizontal con scroll que funciona en PC y móvil */
    function FilaProductos({
        titulo,
        productosFila,
        filaKey,
    }: { titulo: string; productosFila: ProductoResumen[]; filaKey: string }) {
        const expandida = !!filasExpandidas[filaKey];
        return (
            <section className="w-full min-w-0">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold capitalize" style={{ color: "#DCCAE9" }}>{titulo}</h2>
                    <button
                        type="button"
                        onClick={() => toggleFila(filaKey)}
                        className="btn btn-ghost btn-sm text-sm flex items-center gap-1"
                        style={{ color: "#9356A0" }}
                    >
                        {expandida ? (
                            <><ChevronUp size={16} /> Ver menos</>
                        ) : (
                            <><ChevronDown size={16} /> Ver más</>
                        )}
                    </button>
                </div>
                <div
                    className="w-full overflow-hidden rounded-xl border border-[rgba(114,76,157,0.2)] min-w-0"
                    style={{ background: "rgba(20,10,30,0.5)" }}
                >
                    {expandida ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                            {productosFila.map((p) => (
                                <div key={p.id}>
                                    <ProductCard producto={p} onAgregar={agregarAlCarrito} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="catalogo-fila-scroll flex gap-4 p-4 min-w-0">
                            {productosFila.map((p) => (
                                <div key={p.id} className="w-[160px] md:w-[220px] shrink-0 snap-start">
                                    <ProductCard producto={p} onAgregar={agregarAlCarrito} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
            {/* ── Navbar ─────────────────────────────── */}
            <header
                className="sticky top-0 z-50 backdrop-blur-md"
                style={{ borderBottom: "1px solid rgba(114,76,157,0.2)" }}
            >
                <nav className="page-container h-16 flex items-center justify-between">
                    <Link href="/" aria-label="Ir al inicio">
                        <EryoLogo height={48} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/catalogo" className="btn btn-ghost text-sm" style={{ color: "#9356A0" }}>Catálogo</Link>
                        <Link href="/personalizado" className="btn btn-ghost text-sm">Personalizar</Link>
                        <Link href="/carrito" className="btn btn-secondary btn-sm relative">
                            <ShoppingBag size={15} />
                            Carrito
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 page-container py-10 min-w-0 w-full flex flex-col">
                {/* ── Encabezado ─────────────────────────── */}
                <div className="mb-8">
                    <h1 className="section-title">Catálogo</h1>
                    <p className="section-subtitle">
                        {isLoading ? "Cargando productos…" : `${productos?.length ?? 0} piezas disponibles`}
                    </p>
                </div>

                {/* ── Barra de búsqueda + filtros ─────────── */}
                <div className="flex flex-col md:flex-row gap-3 mb-8">
                    {/* Buscador */}
                    <div className="relative flex-1">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "rgba(220,202,233,0.4)" }}
                        />
                        <input
                            id="busqueda-catalogo"
                            type="search"
                            placeholder="Buscar piezas…"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input pl-9"
                        />
                    </div>

                    {/* Botón filtros (móvil) */}
                    <button
                        id="toggle-filtros"
                        onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                        className="btn btn-secondary md:hidden"
                    >
                        <SlidersHorizontal size={16} />
                        Filtros
                        {hayFiltros && (
                            <span
                                className="ml-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                                style={{ background: "#9356A0", color: "#DCCAE9" }}
                            >
                                !
                            </span>
                        )}
                    </button>

                    {/* Filtros desktop + móvil desplegado */}
                    <div className={`flex flex-col md:flex-row gap-3 ${filtrosAbiertos ? "flex" : "hidden md:flex"}`}>
                        {/* Categoría */}
                        <Select
                            id="filtro-categoria"
                            value={categoriaId}
                            onChange={(v) => setCategoriaId(v ? Number(v) : undefined)}
                            placeholder="Todas las categorías"
                            options={categorias?.map((c) => ({ value: c.id, label: c.nombre })) ?? []}
                            minWidth={180}
                        />

                        {/* Tipo */}
                        <Select
                            id="filtro-tipo"
                            value={tipo}
                            onChange={(v) => setTipo(v as string | undefined)}
                            placeholder="Todos los tipos"
                            options={TIPOS.map((t) => ({ value: t, label: t }))}
                            minWidth={160}
                        />

                        {/* Limpiar filtros */}
                        {hayFiltros && (
                            <button
                                id="limpiar-filtros"
                                onClick={limpiarFiltros}
                                className="btn btn-ghost text-sm flex items-center gap-1"
                                style={{ color: "rgba(220,202,233,0.5)" }}
                            >
                                <X size={14} />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Chips de filtros activos ────────────── */}
                {hayFiltros && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {busqueda && (
                            <span className="badge badge-done">
                                Búsqueda: "{busqueda}"
                                <button onClick={() => setBusqueda("")}><X size={11} /></button>
                            </span>
                        )}
                        {categoriaId && categorias && (
                            <span className="badge badge-done">
                                {categorias.find((c) => c.id === categoriaId)?.nombre}
                                <button onClick={() => setCategoriaId(undefined)}><X size={11} /></button>
                            </span>
                        )}
                        {tipo && (
                            <span className="badge badge-done">
                                {tipo}
                                <button onClick={() => setTipo(undefined)}><X size={11} /></button>
                            </span>
                        )}
                    </div>
                )}

                {/* ── Grid de productos ───────────────────── */}
                {isError ? (
                    <div className="text-center py-24">
                        <p style={{ color: "#f87171" }}>No se pudo cargar el catálogo. Intenta de nuevo.</p>
                    </div>
                ) : isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : productos?.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center gap-4">
                        <Gem size={48} style={{ color: "rgba(147,86,160,0.3)" }} />
                        <p className="section-subtitle">No hay piezas con estos filtros</p>
                        <button onClick={limpiarFiltros} className="btn btn-secondary btn-sm">
                            Ver todo el catálogo
                        </button>
                    </div>
                ) : hayFiltros ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {productos?.map((p) => (
                            <ProductCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 w-full min-w-0">
                        {/* Primera fila: últimos productos agregados */}
                        {productos && productos.length > 0 && (
                            <FilaProductos
                                titulo="Últimos agregados"
                                productosFila={productos.slice(0, ULTIMOS_LIMIT)}
                                filaKey="ultimos"
                            />
                        )}

                        {/* Toggle ver por tipo o por categoría */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ color: "rgba(220,202,233,0.6)" }}>Ver filas por:</span>
                            <button
                                type="button"
                                onClick={() => setVistaPor("tipo")}
                                className={`btn btn-sm ${vistaPor === "tipo" ? "btn-primary" : "btn-ghost"}`}
                            >
                                Tipo
                            </button>
                            <button
                                type="button"
                                onClick={() => setVistaPor("categoria")}
                                className={`btn btn-sm ${vistaPor === "categoria" ? "btn-primary" : "btn-ghost"}`}
                            >
                                Categoría
                            </button>
                        </div>

                        {vistaPor === "tipo" ? (
                            <>
                                {TIPOS.map((tipoName) => {
                                    const prodsTipo = productos?.filter((p) => p.tipo === tipoName) ?? [];
                                    if (prodsTipo.length === 0) return null;
                                    return (
                                        <FilaProductos
                                            key={tipoName}
                                            titulo={`${tipoName}s`}
                                            productosFila={prodsTipo}
                                            filaKey={`tipo-${tipoName}`}
                                        />
                                    );
                                })}
                                {(() => {
                                    const sinTipo = productos?.filter((p) => !TIPOS.includes(p.tipo)) ?? [];
                                    if (sinTipo.length === 0) return null;
                                    return (
                                        <FilaProductos
                                            titulo="Otras piezas"
                                            productosFila={sinTipo}
                                            filaKey="tipo-otras"
                                        />
                                    );
                                })()}
                            </>
                        ) : (
                            <>
                                {categorias?.map((cat) => {
                                    const prodsCat = productos?.filter((p) => p.categoria_id === cat.id) ?? [];
                                    if (prodsCat.length === 0) return null;
                                    return (
                                        <FilaProductos
                                            key={cat.id}
                                            titulo={cat.nombre}
                                            productosFila={prodsCat}
                                            filaKey={`cat-${cat.id}`}
                                        />
                                    );
                                })}
                                {(() => {
                                    const sinCat = productos?.filter((p) => p.categoria_id == null) ?? [];
                                    if (sinCat.length === 0) return null;
                                    return (
                                        <FilaProductos
                                            titulo="Sin categoría"
                                            productosFila={sinCat}
                                            filaKey="cat-sin"
                                        />
                                    );
                                })()}
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* ── Footer ─────────────────────────────── */}
            <footer
                className="py-8 text-center text-xs mt-12"
                style={{ borderTop: "1px solid rgba(114,76,157,0.15)", color: "rgba(220,202,233,0.35)" }}
            >
                &copy; {new Date().getFullYear()} Eryó — Bisutería Artesanal. Barranquilla, Colombia.
            </footer>
        </div>
    );
}
