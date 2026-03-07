import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PublicMobileNav } from "@/components/PublicMobileNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Eryó",
    default: "Eryó — Bisutería Artesanal",
  },
  description:
    "Tienda en línea de bisutería artesanal en Barranquilla. Manillas, anillos, collares y pedidos personalizados.",
  keywords: ["bisutería", "manillas", "artesanal", "Barranquilla", "accesorios"],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased pb-20 md:pb-0">
        <Providers>
          {children}
          <PublicMobileNav />
        </Providers>
      </body>
    </html>
  );
}
