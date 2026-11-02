import type { Advisor, AdvisorCoverage, Product, ProductCategory, ProductLine } from "./types";

/**
 * Convierte lo que devuelve Sanity (con `null` en campos vacíos) a los tipos del sitio.
 * Funciones puras: se prueban sin conexión.
 */

type Nullable<T> = { [K in keyof T]?: T[K] | null };

const orUndef = <T,>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);

export function normalizeProducts(raw: Nullable<Product>[]): Product[] {
  return raw.map((p, i) => ({
    id: p.id!,
    name: p.name ?? "",
    reference: p.reference ?? "",
    slug: p.slug!,
    categoryId: p.categoryId!,
    lineId: orUndef(p.lineId),
    images: (p.images ?? []).filter((img) => img?.src && img.width && img.height),
    shortDescription: p.shortDescription ?? "",
    description: p.description?.length ? p.description : undefined,
    features: p.features ?? [],
    specs: (p.specs ?? []).map((s) => ({ ...s, unit: orUndef(s.unit) })),
    variants: p.variants ?? [],
    documentIds: p.documentIds ?? [],
    relatedIds: p.relatedIds ?? [],
    regulatory: orUndef(p.regulatory) ?? undefined,
    seo: orUndef(p.seo) ?? undefined,
    featured: Boolean(p.featured),
    order: i,
    active: true,
    publishedAt: (p.publishedAt ?? "").slice(0, 10),
  }));
}

export function normalizeCategories(raw: Nullable<ProductCategory>[]): ProductCategory[] {
  return raw.map((c, i) => ({
    id: c.id!,
    title: c.title ?? "",
    slug: c.slug!,
    description: orUndef(c.description),
    image: orUndef(c.image),
    featured: Boolean(c.featured),
    order: i,
    active: true,
  }));
}

export function normalizeLines(raw: Nullable<ProductLine>[]): ProductLine[] {
  return raw.map((l, i) => ({
    id: l.id!,
    title: l.title ?? "",
    slug: l.slug!,
    description: orUndef(l.description),
    order: i,
    active: true,
  }));
}

export function normalizeAdvisors(raw: Nullable<Advisor>[]): Advisor[] {
  return raw.map((a) => ({
    id: a.id!,
    publicName: a.publicName ?? "",
    role: a.role ?? "Asesor comercial",
    photo: orUndef(a.photo),
    whatsapp: a.whatsapp ?? "",
    consent: a.consent ?? { authorized: false, date: "" },
    active: a.active !== false,
  }));
}

export interface RawCoverage extends Omit<Nullable<AdvisorCoverage>, "advisors"> {
  advisorIds?: string[] | null;
}

/** El orden de la lista de asesores en el CMS es la prioridad comercial (1, 2, 3…). */
export function normalizeCoverages(raw: RawCoverage[]): AdvisorCoverage[] {
  return raw.map((c) => ({
    id: c.id!,
    zoneName: c.zoneName ?? "",
    hubCity: c.hubCity ?? "",
    departmentCodes: [...new Set((c.departmentCodes ?? []).filter((x): x is string => typeof x === "string" && x.length > 0))],
    municipalityCodes: (c.municipalityCodes ?? []).filter(Boolean),
    advisors: (c.advisorIds ?? []).map((advisorId, i) => ({ advisorId, priority: i + 1 })),
    validFrom: orUndef(c.validFrom),
    validUntil: orUndef(c.validUntil),
    active: c.active !== false,
  }));
}
