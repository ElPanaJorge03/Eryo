"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Palette, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";

export function PublicMobileNav() {
    const pathname = usePathname();
    const { totalItems } = useCart();

    // No mostrar en área de admin
    if (pathname.startsWith("/admin")) return null;

    const NAV = [
        { href: "/", icon: Home, label: "Inicio", exact: true },
        { href: "/catalogo", icon: Search, label: "Catálogo", exact: false },
        { href: "/personalizado", icon: Palette, label: "Personalizar", exact: false },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex items-center justify-center pointer-events-none px-4 gap-3">
            {/* Píldora principal */}
            <nav
                className="flex items-center p-2 rounded-full shadow-2xl pointer-events-auto"
                style={{
                    background: "rgba(20,10,30, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(147,86,160,0.3)"
                }}
            >
                <div className="flex items-center gap-1">
                    {NAV.map(({ href, icon: Icon, label, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center justify-center transition-all duration-300 rounded-full h-12 overflow-hidden ${active ? "px-5" : "w-12"}`}
                                style={{
                                    background: active ? "rgba(147,86,160,0.9)" : "transparent",
                                    color: active ? "#fff" : "rgba(220,202,233,0.6)",
                                }}
                            >
                                <Icon size={20} className={active ? "flex-shrink-0" : ""} />
                                {active && <span className="ml-2 text-sm font-semibold whitespace-nowrap">{label}</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Píldora separada para el Carrito (como en tu imagen) */}
            <Link
                href="/carrito"
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl pointer-events-auto relative"
                style={{
                    background: "rgba(20,10,30, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: pathname.startsWith("/carrito") ? "2px solid rgba(147,86,160,0.9)" : "1px solid rgba(147,86,160,0.3)",
                    color: pathname.startsWith("/carrito") ? "#fff" : "rgba(220,202,233,0.6)",
                }}
            >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                    <div className="absolute top-2 right-2 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {totalItems}
                    </div>
                )}
            </Link>
        </div>
    );
}
