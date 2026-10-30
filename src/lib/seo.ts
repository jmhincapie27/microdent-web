import type { Metadata } from "next";
import type { ProductDetail } from "@/lib/content/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Microdent Implant System";

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: { src: string; width: number; height: number; alt: string };
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: SITE_NAME,
      title: opts.title,
      description: opts.description,
      url,
      images: opts.image
        ? [{ url: absoluteUrl(opts.image.src), width: opts.image.width, height: opts.image.height, alt: opts.image.alt }]
        : undefined,
    },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/brand/microdent-logo.svg"),
  };
}

/** Producto sin precio ni oferta: es un catálogo, no una tienda. */
export function productJsonLd(p: ProductDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.reference,
    mpn: p.reference,
    description: p.shortDescription,
    brand: { "@type": "Brand", name: "Microdent" },
    category: p.category.title,
    image: p.images.map((i) => absoluteUrl(i.src)),
    url: absoluteUrl(`/productos/${p.slug}`),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Serializa JSON-LD escapando "<" para evitar inyección de etiquetas. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
