import Link from "next/link";
import type { Product } from "@/lib/content/types";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  categoryTitle,
  highlight,
  priority,
  headingLevel = "h3",
}: {
  product: Product;
  categoryTitle?: string;
  highlight?: string;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-line bg-white p-2 transition-shadow hover:shadow-[0_6px_24px_-12px_rgb(0_0_0/0.25)] focus-within:shadow-[0_6px_24px_-12px_rgb(0_0_0/0.25)]",
        highlight && "border-antracita ring-1 ring-antracita",
      )}
    >
      <ProductImage
        image={product.images[0]}
        sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 50vw"
        priority={priority}
      />
      <div className="flex flex-1 flex-col gap-1 px-2 pt-3 pb-2">
        {highlight && (
          <span className="mb-1 inline-flex w-fit rounded-sm bg-glauco px-2 py-0.5 text-xs font-semibold text-black">
            {highlight}
          </span>
        )}
        {categoryTitle && <span className="text-xs text-ink-subtle">{categoryTitle}</span>}
        <Heading className="font-display text-sm leading-snug font-semibold sm:text-base">
          <Link href={`/productos/${product.slug}`} className="after:absolute after:inset-0 after:rounded-lg">
            {product.name}
          </Link>
        </Heading>
        <p className="mt-auto pt-1 text-xs text-ink-muted tabular-nums">
          <span className="sr-only">Referencia: </span>
          Ref. {product.reference}
        </p>
      </div>
    </article>
  );
}
