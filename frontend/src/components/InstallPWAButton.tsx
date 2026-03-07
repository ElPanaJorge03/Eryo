"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

/**
 * Botón "Instalar" para PWA. Solo se muestra cuando el navegador
 * dispara beforeinstallprompt (HTTPS, criterios de instalabilidad).
 */
export function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.matchMedia("(display-mode: standalone)").matches || (window as Window & { standalone?: boolean }).standalone) {
            setInstalled(true);
        }
    }, []);

    async function handleInstall() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setInstalled(true);
        }
    }

    if (installed || !deferredPrompt) return null;

    return (
        <button
            type="button"
            onClick={handleInstall}
            className="btn btn-secondary btn-sm flex items-center gap-2"
            aria-label="Instalar aplicación"
        >
            <Download size={16} />
            Instalar app
        </button>
    );
}

// Tipo para el evento de instalación PWA (no está en todos los tipos de DOM)
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
