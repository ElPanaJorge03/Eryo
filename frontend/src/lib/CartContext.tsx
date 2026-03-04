"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import toast from "react-hot-toast";

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    foto: string | null;
}

interface CartContextProps {
    cart: CartItem[];
    addToCart: (producto: CartItem, configCantidad?: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextProps>({
    cart: [],
    addToCart: () => { },
    updateQuantity: () => { },
    removeItem: () => { },
    clearCart: () => { },
    totalItems: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem("eryo_carrito");
        if (raw) setCart(JSON.parse(raw));
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("eryo_carrito", JSON.stringify(cart));
        }
    }, [cart, mounted]);

    const addToCart = (producto: CartItem, configCantidad: number = 1) => {
        setCart((prev) => {
            const index = prev.findIndex((item) => item.id === producto.id);
            if (index !== -1) {
                const newCart = [...prev];
                newCart[index].cantidad += configCantidad;
                return newCart;
            }
            return [...prev, { ...producto, cantidad: configCantidad }];
        });
        toast.success(`${configCantidad > 1 ? `${configCantidad}x ` : ""}${producto.nombre} agregado al carrito`);
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart((prev) => prev.map((item) => {
            if (item.id === id) {
                const newQty = item.cantidad + delta;
                return { ...item, cantidad: newQty < 1 ? 1 : newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
        toast.success("Producto removido del carrito");
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
