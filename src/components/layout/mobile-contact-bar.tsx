"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactHref } from "./nav-links";

/** Botón de contacto persistente en móvil. En la ficha de producto cambia su texto. */
export function MobileContactBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/asesores")) return null;
  const isProduct = /^\/productos\/[^/]+$/.test(pathname);

  return (
    <nav aria-label="Contacto rápido" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <Button asChild size="lg" className="w-full">
        <Link href={contactHref(pathname)}>
          <MessageCircle aria-hidden />
          {isProduct ? "Consultar con un asesor" : "Contactar asesor"}
        </Link>
      </Button>
    </nav>
  );
}
