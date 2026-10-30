import type { MetadataRoute } from "next";
import { getCategories, getLegalPages, getProducts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, legal] = await Promise.all([getProducts(), getCategories(), getLegalPages()]);
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/productos"), changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/productos?categoria=${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/productos/${p.slug}`),
      lastModified: p.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/nosotros"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/asesores"), changeFrequency: "monthly", priority: 0.7 },
    ...legal.map((l) => ({ url: absoluteUrl(`/legal/${l.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
