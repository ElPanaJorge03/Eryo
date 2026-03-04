"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Package, ShoppingBag, Tag, Puzzle,
    LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { EryoLogo } from "@/components/EryoLogo";
import { isAuthenticated, clearToken } from "@/lib/auth";

const NAV = [
    { href: "/admin/productos", icon: Package, label: "Productos" },
    { href: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos" },
    { href: "/admin/categorias", icon: Tag, label: "Categorías" },
    { href: "/admin/componentes", icon: Puzzle, label: "Componentes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [ready, setReady] = useState(false);

    const isLoginPage = pathname === "/admin/login";

    // Hooks SIEMPRE se llaman (reglas de React), la lógica interna varía
    useEffect(() => {
        if (isLoginPage) {
            // Login page no necesita autenticación
            setReady(true);
            return;
        }
        if (!isAuthenticated()) {
            router.replace("/admin/login");
        } else {
            setReady(true);
        }
    }, [router, isLoginPage]);

    // ── Página de login: renderizar sin layout de admin ─────
    if (isLoginPage) {
        return <>{children}</>;
    }

    // ── Cargando verificación de auth ────────────────────────
    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="skeleton w-12 h-12 rounded-full" />
            </div>
        );
    }

    function logout() {
        clearToken();
        router.push("/admin/login");
    }

    // ── Layout admin completo ─────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col md:flex-row pb-16 md:pb-0">
            {/* Sidebar (solo desktop) */}
            <aside
                className="hidden md:flex flex-col h-screen sticky top-0"
                style={{
                    width: "240px",
                    background: "#0f0818",
                    borderRight: "1px solid rgba(114,76,157,0.2)",
                }}
            >
                {/* Logo */}
                <div
                    className="p-4 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(114,76,157,0.15)" }}
                >
                    <Link href="/" aria-label="Ver tienda">
                        <EryoLogo height={40} />
                    </Link>
                </div>

                {/* Label */}
                <div className="px-4 py-3">
                    <span
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "rgba(147,86,160,0.6)" }}
                    >
                        Admin
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 flex flex-col gap-1">
                    {NAV.map(({ href, icon: Icon, label }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: active ? "rgba(147,86,160,0.2)" : "transparent",
                                    color: active ? "#DCCAE9" : "rgba(220,202,233,0.5)",
                                    borderLeft: active ? "2px solid #9356A0" : "2px solid transparent",
                                }}
                            >
                                <Icon size={17} />
                                {label}
                                {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3" style={{ borderTop: "1px solid rgba(114,76,157,0.15)" }}>
                    <button
                        id="btn-logout"
                        onClick={logout}
                        className="btn btn-ghost w-full justify-start text-sm gap-3"
                        style={{ color: "rgba(220,202,233,0.4)" }}
                    >
                        <LogOut size={17} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar móvil (solo logo y logout) */}
                <header
                    className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
                    style={{
                        background: "rgba(11,2,5,0.9)",
                        borderBottom: "1px solid rgba(114,76,157,0.2)",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <Link href="/">
                        <EryoLogo height={28} />
                    </Link>
                    <button onClick={logout} className="p-2 text-red-400 opacity-80" aria-label="Cerrar sesión">
                        <LogOut size={20} />
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>

            {/* Bottom Nav Bar (Flotante estilo píldora dinámica, solo móvil) */}
            <div className="md:hidden fixed bottom-6 left-0 right-0 z-40 flex items-center justify-center pointer-events-none px-4 gap-3">
                <nav
                    className="flex items-center p-2 rounded-full shadow-2xl pointer-events-auto"
                    style={{
                        background: "rgba(20,10,30, 0.8)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(147,86,160,0.3)"
                    }}
                >
                    <div className="flex items-center gap-1">
                        {NAV.map(({ href, icon: Icon, label }) => {
                            const active = pathname.startsWith(href);
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
            </div>
        </div>
    );
}
