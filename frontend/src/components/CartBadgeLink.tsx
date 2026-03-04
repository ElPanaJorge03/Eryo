"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";

export function CartBadgeLink() {
    const { totalItems } = useCart();
    return (
        <Link href="/carrito" className="btn btn-secondary btn-sm relative">
            <ShoppingBag size={15} />
            Carrito
            {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                </span>
            )}
        </Link>
    );
}
