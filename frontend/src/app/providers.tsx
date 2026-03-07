"use client";

import { Toaster } from "react-hot-toast";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { CartProvider } from "@/lib/CartContext";
import { PushNotifications } from "@/components/PushNotifications";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <CartProvider>
                {children}
                <PushNotifications />
            </CartProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#2C1B47",
                        color: "#DCCAE9",
                        border: "1px solid rgba(114,76,157,0.4)",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                    },
                    success: { iconTheme: { primary: "#34d399", secondary: "#0B0205" } },
                    error: { iconTheme: { primary: "#f87171", secondary: "#0B0205" } },
                }}
            />
        </QueryClientProvider>
    );
}
