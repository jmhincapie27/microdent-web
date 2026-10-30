import type { Product, ProductCategory, ProductLine } from "@/lib/content/types";
import { normalize, normalizeReference } from "@/lib/utils";

export const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "nombre", label: "Nombre (A–Z)" },
  { value: "referencia", label: "Referencia" },
  { value: "recientes", label: "Más recientes" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface CatalogQuery {
  q: string;
  categorias: string[];
  lineas: string[];
  orden: SortValue;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  /** Producto cuya referencia (o la de una variante) coincide exactamente con la búsqueda. */
  exactMatchId?: string;
  facets: {
    categories: { slug: string; title: string; count: number }[];
    lines: { slug: string; title: string; count: number }[];
  };
}

function score(p: Product, q: string): number {
  if (!q) return 0;
  const nq = normalize(q);
  const rq = normalizeReference(q);
  const ref = normalizeReference(p.reference);
  const variantRefs = p.variants.map((v) => normalizeReference(v.reference));
  if (rq && (ref === rq || variantRefs.includes(rq))) return 100;
  if (rq.length >= 3 && (ref.startsWith(rq) || variantRefs.some((r) => r.startsWith(rq)))) return 80;
  const name = normalize(p.name);
  if (name.startsWith(nq)) return 60;
  const words = nq.split(" ").filter(Boolean);
  if (words.every((w) => name.includes(w))) return 40;
  if (rq.length >= 3 && (ref.includes(rq) || variantRefs.some((r) => r.includes(rq)))) return 30;
  if (words.every((w) => normalize(p.shortDescription).includes(w))) return 10;
  return 0;
}

export function queryCatalog(
  products: Product[],
  categories: ProductCategory[],
  lines: ProductLine[],
  query: CatalogQuery,
): CatalogResult {
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const lineBySlug = new Map(lines.map((l) => [l.slug, l]));
  const catIds = new Set(query.categorias.map((s) => catBySlug.get(s)?.id).filter(Boolean));
  const lineIds = new Set(query.lineas.map((s) => lineBySlug.get(s)?.id).filter(Boolean));
  const q = query.q.trim();

  const scored = products
    .filter((p) => p.active)
    .map((p) => ({ p, s: score(p, q) }))
    .filter(({ s }) => !q || s > 0);

  // Conteos por faceta: cada grupo se cuenta aplicando los filtros de los otros grupos.
  const inCat = (p: Product) => catIds.size === 0 || catIds.has(p.categoryId);
  const inLine = (p: Product) => lineIds.size === 0 || (p.lineId ? lineIds.has(p.lineId) : false);

  const facets = {
    categories: categories
      .filter((c) => c.active)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        count: scored.filter(({ p }) => p.categoryId === c.id && inLine(p)).length,
      })),
    lines: lines
      .filter((l) => l.active)
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        slug: l.slug,
        title: l.title,
        count: scored.filter(({ p }) => p.lineId === l.id && inCat(p)).length,
      })),
  };

  const filtered = scored.filter(({ p }) => inCat(p) && inLine(p));

  const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });
  filtered.sort((a, b) => {
    switch (query.orden) {
      case "nombre":
        return collator.compare(a.p.name, b.p.name);
      case "referencia":
        return collator.compare(a.p.reference, b.p.reference);
      case "recientes":
        return b.p.publishedAt.localeCompare(a.p.publishedAt);
      default:
        return b.s - a.s || a.p.order - b.p.order;
    }
  });

  const exact = filtered.find(({ s }) => s === 100);
  return {
    items: filtered.map(({ p }) => p),
    total: filtered.length,
    exactMatchId: exact?.p.id,
    facets,
  };
}
