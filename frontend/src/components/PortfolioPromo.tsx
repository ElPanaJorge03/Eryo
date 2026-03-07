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
        <div ref={promoRef} className="fixed bottom-24 md:bottom-6 right-4 z-50 transition-all duration-500 w-full max-w-[240px]" style={{
            transform: isVisible ? "translateX(0)" : "translateX(120%)",
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? "auto" : "none"
        }}>
            <div className="relative p-4 rounded-xl shadow-2xl border overflow-hidden" style={{
                background: "rgba(20, 10, 30, 0.95)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(147, 86, 160, 0.5)",
                boxShadow: "0 10px 30px -10px rgba(147, 86, 160, 0.3)"
            }}>
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#9356A0] opacity-20 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-1 right-1 p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors text-gray-400 hover:text-white"
                    aria-label="Cerrar"
                >
                    <X size={14} />
                </button>

                <div className="flex flex-col gap-2 mb-2 mt-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-[rgba(147,86,160,0.2)] text-[#DCCAE9] shrink-0">
                            <Mail size={14} />
                        </div>
                        <h4 className="font-bold text-[#DCCAE9] text-[13px] leading-tight">
                            ¿Te gusta esta web?
                        </h4>
                    </div>
                    <p className="text-[11px] text-[rgba(220,202,233,0.7)] leading-snug">
                        Diseño y desarrollo tiendas online y apliciones web.
                    </p>
                </div>

                <a
                    href="mailto:jorgejimmartinez333@gmail.com?subject=Consulta sobre desarrollo web&body=Hola Jorge, vi la página de Eryó y me gustaría consultarte sobre..."
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold mt-2 transition-all group"
                    style={{
                        background: "linear-gradient(135deg, #9356A0 0%, #724C9D 100%)",
                        color: "white"
                    }}
                >
                    ¡Contáctame!
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}
