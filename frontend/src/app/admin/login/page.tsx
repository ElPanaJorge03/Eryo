"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import { EryoLogo } from "@/components/EryoLogo";
import { setToken } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { Metadata } from "next";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanUser = username.trim();
            const r = await api.post("/api/admin/login", { username: cleanUser, password });
            setToken(r.data.access_token);
            toast.success("Bienvenido al panel de administración");
            router.push("/admin/productos");
        } catch (err: any) {
            console.error("Login error:", err?.response?.data || err.message || err);
            const msg = err?.response?.data?.detail ?? "Error de conexión o credenciales incorrectas";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 relative"
            style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,86,160,0.15) 0%, transparent 70%)",
            }}
        >
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm hover:text-[#DCCAE9] transition-colors"
                style={{ color: "rgba(220,202,233,0.6)" }}
            >
                <ArrowLeft size={16} />
                Volver a la tienda
            </Link>

            <div className="w-full max-w-sm mt-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <EryoLogo height={110} />
                </div>

                {/* Card */}
                <div className="card p-8">
                    <h1 className="text-xl font-bold mb-1" style={{ color: "#DCCAE9" }}>
                        Panel de administración
                    </h1>
                    <p className="text-sm mb-6" style={{ color: "rgba(220,202,233,0.45)" }}>
                        Acceso exclusivo para el vendedor
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="username" className="input-label">Usuario</label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input"
                                placeholder="eryoadmin"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="input-label">Contraseña</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost p-0"
                                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPass
                                        ? <EyeOff size={16} style={{ color: "rgba(220,202,233,0.4)" }} />
                                        : <Eye size={16} style={{ color: "rgba(220,202,233,0.4)" }} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="btn-login"
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg w-full justify-center mt-2"
                        >
                            <LogIn size={18} />
                            {loading ? "Ingresando…" : "Ingresar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
