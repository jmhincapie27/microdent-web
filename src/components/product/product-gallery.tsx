"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/lib/content/types";
import { ProductImage } from "./product-image";
import { cn } from "@/lib/utils";

/** Galería manual: imagen principal + miniaturas. Sin reproducción automática. */
export function ProductGallery({ images, productName }: { images: ImageAsset[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div>
      <ProductImage
        image={current}
        priority
        sizes="(min-width: 1024px) 560px, 100vw"
        className="border border-line"
      />
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2" aria-label={`Fotografías de ${productName}`}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                aria-label={`Ver fotografía ${i + 1} de ${images.length}`}
                className={cn(
                  "relative block size-18 cursor-pointer overflow-hidden rounded-md border bg-white sm:size-20",
                  i === index ? "border-antracita ring-1 ring-antracita" : "border-line hover:border-antracita/50",
                )}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
