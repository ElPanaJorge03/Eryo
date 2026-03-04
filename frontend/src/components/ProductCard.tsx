import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ProductoResumen } from "@/lib/types";

interface Props {
    producto: ProductoResumen;
    onAgregar?: (producto: ProductoResumen) => void;
}

export function ProductCard({ producto, onAgregar }: Props) {
    const agotado = producto.stock === 0;

    return (
        <article className="card flex flex-col overflow-hidden group">
            {/* ── Imagen ─────────────────────────────── */}
            <Link href={`/catalogo/${producto.id}`} className="block relative aspect-square overflow-hidden">
                {producto.foto_principal ? (
                    <Image
                        src={producto.foto_principal}
                        alt={producto.nombre}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2"
                        style={{ background: "rgba(44,27,71,0.6)" }}
                    >
                        <ImageOff size={32} style={{ color: "rgba(220,202,233,0.25)" }} />
                        <span className="text-xs" style={{ color: "rgba(220,202,233,0.3)" }}>
                            Sin foto
                        </span>
                    </div>
                )}

                {/* Badge agotado */}
                {agotado && (
                    <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(11,2,5,0.65)" }}>
                        <span className="badge badge-cancelled text-xs">Agotado</span>
                    </div>
                )}

                {/* Chip de tipo */}
                <div className="absolute top-2 left-2">
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                            background: "rgba(11,2,5,0.7)",
                            color: "#DCCAE9",
                            border: "1px solid rgba(220,202,233,0.2)",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {producto.tipo}
                    </span>
                </div>
            </Link>

            {/* ── Info ───────────────────────────────── */}
            <div className="p-3 md:p-4 flex flex-col gap-2 flex-1">
                <Link href={`/catalogo/${producto.id}`}>
                    <h3
                        className="font-medium text-sm md:text-base leading-snug line-clamp-2 hover:underline transition-colors"
                        style={{ color: "#DCCAE9" }}
                        title={producto.nombre}
                    >
                        {producto.nombre}
                    </h3>
                </Link>

                <div className="mt-auto flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "rgba(114,76,157,0.15)" }}>
                    <span className="font-bold text-sm md:text-md" style={{ color: "#9356A0" }}>
                        {formatPrice(producto.precio)}
                    </span>

                    <button
                        id={`agregar-${producto.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAgregar?.(producto);
                        }}
                        disabled={agotado}
                        className="btn btn-primary h-8 md:h-9 w-full flex items-center justify-center gap-2 rounded-lg text-xs md:text-sm transition-transform active:scale-95"
                        aria-label={`Agregar ${producto.nombre} al carrito`}
                    >
                        <ShoppingCart size={16} />
                        Agregar
                    </button>
                </div>
            </div>
        </article>
    );
}

// ─── Skeleton ─────────────────────────────────
export function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="skeleton aspect-square w-full" />
            <div className="p-4 flex flex-col gap-3">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="flex justify-between items-center mt-2">
                    <div className="skeleton h-5 w-20 rounded" />
                    <div className="skeleton h-8 w-24 rounded" />
                </div>
            </div>
        </div>
    );
}
