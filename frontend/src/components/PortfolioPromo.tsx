"use client";
import { useEffect, useRef, useState } from "react";
import { Mail, ArrowRight, X } from "lucide-react";

export function PortfolioPromo() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const promoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDismissed) return;

        const handleScroll = () => {
            if (!promoRef.current) return;
            // Mostramos si el usuario ha bajado lo suficiente (ej: 400px o cerca del footer)
            const scrollY = window.scrollY;
            if (scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Check initial position just in case
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isDismissed]);

    if (isDismissed) return <div ref={promoRef} />; // Keep ref alive just in case

    return (
        <div ref={promoRef} className="fixed bottom-4 left-4 z-50 transition-all duration-500 max-w-xs" style={{
            transform: isVisible ? "translateY(0)" : "translateY(150%)",
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? "auto" : "none"
        }}>
            <div className="relative p-5 rounded-2xl shadow-2xl border overflow-hidden" style={{
                background: "rgba(20, 10, 30, 0.95)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(147, 86, 160, 0.5)",
                boxShadow: "0 10px 30px -10px rgba(147, 86, 160, 0.3)"
            }}>
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9356A0] opacity-20 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors text-gray-400 hover:text-white"
                    aria-label="Cerrar"
                >
                    <X size={14} />
                </button>

                <div className="flex gap-3 items-start mb-3">
                    <div className="p-2 rounded-lg bg-[rgba(147,86,160,0.2)] text-[#DCCAE9] shrink-0">
                        <Mail size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#DCCAE9] text-sm leading-tight mb-1">
                            ¿Te gustaría una web tan genial como esta?
                        </h4>
                        <p className="text-xs text-[rgba(220,202,233,0.7)] leading-relaxed">
                            Diseño y desarrollo tiendas online, portafolios y aplicaciones a medida.
                        </p>
                    </div>
                </div>

                <a
                    href="mailto:jorgeb2123@gmail.com?subject=Consulta sobre desarrollo web&body=Hola Jorge, vi la página de Eryó y me gustaría consultarte sobre..."
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-xs font-semibold mt-2 transition-all group"
                    style={{
                        background: "linear-gradient(135deg, #9356A0 0%, #724C9D 100%)",
                        color: "white"
                    }}
                >
                    ¡Contáctame!
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}
