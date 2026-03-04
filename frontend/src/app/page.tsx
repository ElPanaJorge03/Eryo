import Link from "next/link";
import { Scissors, ShoppingBag, ArrowRight, Gem } from "lucide-react";
import type { Metadata } from "next";
import { EryoLogo } from "@/components/EryoLogo";
import { CartBadgeLink } from "@/components/CartBadgeLink";

export const metadata: Metadata = {
  title: "Eryó — Bisutería Artesanal en Barranquilla",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ─────────────────────────────── */}
      <header
        style={{ borderBottom: "1px solid rgba(114,76,157,0.2)" }}
        className="sticky top-0 z-50 backdrop-blur-md"
      >
        <nav className="page-container h-16 flex items-center justify-between">
          <Link href="/" aria-label="Ir al inicio">
            <EryoLogo height={52} />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/catalogo" className="btn btn-ghost text-sm">Catálogo</Link>
            <Link href="/personalizado" className="btn btn-ghost text-sm">Personalizar</Link>
            <CartBadgeLink />
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────── */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,86,160,0.18) 0%, transparent 70%)",
            }}
          />

          <div className="page-container text-center relative z-10">
            {/* Logo principal en el hero */}
            <div className="flex justify-center mb-6">
              <EryoLogo height={220} />
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-[0.25em] mb-8"
              style={{ color: "rgba(147,86,160,0.8)" }}
            >
              Bisutería artesanal &mdash; Barranquilla
            </p>

            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              style={{ color: "#DCCAE9" }}
            >
              Piezas únicas,{" "}
              <span style={{ color: "#9356A0" }}>hechas para ti</span>
            </h1>

            <p
              className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ color: "rgba(220,202,233,0.6)" }}
            >
              En Eryó Bisuteria, creamos piezas únicas que reflejan tu estilo y personalidad.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/catalogo" className="btn btn-primary btn-lg">
                Ver catálogo
                <ArrowRight size={18} />
              </Link>
              <Link href="/personalizado" className="btn btn-secondary btn-lg">
                Hacer pedido personalizado
              </Link>
            </div>
          </div>
        </section>

        {/* ── Cards de características ───────────── */}
        <section className="page-container pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Gem size={24} style={{ color: "#9356A0" }} />,
                title: "Materiales cuidados",
                desc: "Hilos, digens y cuentas seleccionados para cada pieza.",
              },
              {
                icon: <Scissors size={24} style={{ color: "#9356A0" }} />,
                title: "100% artesanal",
                desc: "Cada accesorio es elaborado a mano, uno por uno.",
              },
              {
                icon: <ShoppingBag size={24} style={{ color: "#9356A0" }} />,
                title: "Entrega en Barranquilla",
                desc: "Contraentrega o transferencia bancaria. Sin sorpresas.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(147,86,160,0.15)" }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#DCCAE9" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(220,202,233,0.55)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────── */}
      <footer
        className="py-8 text-center text-xs"
        style={{
          borderTop: "1px solid rgba(114,76,157,0.15)",
          color: "rgba(220,202,233,0.35)",
        }}
      >
        &copy; {new Date().getFullYear()} Eryó — Bisutería Artesanal. Barranquilla, Colombia.
      </footer>
    </div >
  );
}
