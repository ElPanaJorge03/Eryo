"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotifications() {
    const [permitido, setPermitido] = useState(false);

    useEffect(() => {
        if ("Notification" in window && "serviceWorker" in navigator) {
            if (Notification.permission === "granted") {
                setPermitido(true);
                // Asegurar que el SW está registrado
                registrarSW();
            } else if (Notification.permission === "default") {
                // Pedimos permiso suave: podemos no hacerlo automático, o sí. En este caso sí (o al menos lo intentamos)
            }
        }

        const handleUpdateEmail = (e: CustomEvent<string>) => {
            const correo = e.detail;
            if (Notification.permission === "granted") {
                registrarSW(correo);
            }
        };

        window.addEventListener("update-push-email", handleUpdateEmail as EventListener);
        return () => window.removeEventListener("update-push-email", handleUpdateEmail as EventListener);
    }, []);

    const registrarSW = async (correo?: string) => {
        try {
            const swRegistration = await navigator.serviceWorker.register("/sw.js");
            // Esperar a que el SW esté activo
            await navigator.serviceWorker.ready;

            suscribir(swRegistration, correo);
        } catch (error) {
            console.error("Error al registrar SW:", error);
        }
    };

    const suscribir = async (swRegistration: ServiceWorkerRegistration, correo?: string) => {
        try {
            let subscription = await swRegistration.pushManager.getSubscription();
            if (!subscription) {
                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicKey) return;

                subscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
            }

            // Enviar al backend
            const subData = JSON.parse(JSON.stringify(subscription));

            const token = localStorage.getItem("token_admin");
            const esAdmin = !!token;

            await api.post("/api/notifications/subscribe", {
                endpoint: subData.endpoint,
                keys: subData.keys,
                is_admin: esAdmin,
                cliente_correo: correo || null // el checkout puede actualizar esto luego
            });
        } catch (error) {
            console.error("Error al suscribirse:", error);
        }
    };

    const solicitarPermiso = async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setPermitido(true);
            registrarSW();
        }
    };

    if (permitido) return null;

    return (
        <div className="fixed bottom-4 right-4 max-w-sm p-4 rounded-xl shadow-lg border z-50 animate-in fade-in slide-in-from-bottom-4" style={{ background: "rgba(20,10,30,0.95)", borderColor: "#9356A0" }}>
            <h4 className="font-bold text-[#DCCAE9] mb-2 text-sm">Notificaciones</h4>
            <p className="text-xs text-[rgba(220,202,233,0.7)] mb-3">
                Activa las notificaciones para enterarte del estado de tu pedido (o nuevos pedidos si eres vendedor).
            </p>
            <div className="flex gap-2">
                <button onClick={solicitarPermiso} className="btn btn-primary btn-sm flex-1">
                    Activar
                </button>
                <button onClick={() => setPermitido(true)} className="btn btn-ghost btn-sm">
                    No, gracias
                </button>
            </div>
        </div>
    );
}
