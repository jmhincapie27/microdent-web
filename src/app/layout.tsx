import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

// Montserrat: tipografía oficial del manual de marca (títulos).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Inter: complementaria para texto corrido, muy legible en tamaños pequeños.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description:
    "Catálogo digital de productos Microdent: implantes, aditamentos e instrumental. Encuentre al asesor comercial de su ciudad.",
  applicationName: SITE_NAME,
  icons: { icon: "/brand/microdent-isotipo.svg" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${montserrat.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
