import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { ImageAsset } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * Fotografía de producto sin recortes ni filtros: `object-contain` sobre fondo blanco.
 * Si el producto aún no tiene foto, muestra un espacio reservado neutro.
 */
export function ProductImage({
  image,
  sizes,
  priority,
  className,
}: {
  image?: ImageAsset;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-white", className)}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-4"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-surface-alt text-ink-subtle">
          <ImageOff className="size-8" aria-hidden />
          <span className="text-xs font-medium">Fotografía pendiente</span>
        </div>
      )}
    </div>
  );
}
