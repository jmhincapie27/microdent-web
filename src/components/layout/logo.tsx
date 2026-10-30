import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logotipo oficial (manual de marca 2025), extraído en vector del PDF sin redibujar.
 * Responsive según la página 06 del manual: isotipo en móvil, isologo completo desde tablet.
 */
export function Logo({ variant = "positivo", className }: { variant?: "positivo" | "negativo"; className?: string }) {
  if (variant === "negativo") {
    return (
      <Image
        src="/brand/microdent-logo-negativo.svg"
        alt="Microdent"
        width={309}
        height={158}
        unoptimized
        className={cn("h-16 w-auto", className)}
      />
    );
  }
  return (
    <span className={cn("flex items-center", className)}>
      <Image
        src="/brand/microdent-isotipo.svg"
        alt="Microdent"
        width={160}
        height={103}
        priority
        unoptimized
        className="h-9 w-auto sm:hidden"
      />
      <Image
        src="/brand/microdent-logo.svg"
        alt="Microdent"
        width={309}
        height={158}
        priority
        unoptimized
        className="hidden h-12 w-auto sm:block"
      />
    </span>
  );
}
