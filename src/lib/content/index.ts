import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import * as mock from "@/mocks/content";
import { contentSource } from "@/sanity/env";
import { sanityClient } from "@/sanity/client";
import {
  ABOUT_QUERY,
  ADVISORS_QUERY,
  CATEGORIES_QUERY,
  COVERAGES_QUERY,
  DOCUMENTS_QUERY,
  HOME_QUERY,
  LEGAL_QUERY,
  LINES_QUERY,
  PRODUCTS_QUERY,
  SETTINGS_QUERY,
} from "@/sanity/queries";
import {
  normalizeAdvisors,
  normalizeCategories,
  normalizeCoverages,
  normalizeLines,
  normalizeProducts,
  type RawCoverage,
} from "./normalize";
import type {
  AboutPage,
  Advisor,
  AdvisorCoverage,
  HomePage,
  LegalPage,
  Product,
  ProductCategory,
  ProductDetail,
  ProductDocument,
  ProductLine,
  SiteSettings,
} from "./types";

/**
 * Punto único de acceso al contenido.
 *
 * - NEXT_PUBLIC_CONTENT_SOURCE=sanity → contenido publicado en Sanity.
 * - Sin la variable → datos ficticios del prototipo (`src/mocks`).
 *
 * Cada función se cachea ("use cache") con una etiqueta. Al publicar en Sanity,
 * el webhook /api/revalidate invalida solo las etiquetas afectadas.
 */

export const IS_PROTOTYPE = contentSource === "mock";
const useSanity = contentSource === "sanity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchSanity = <T,>(query: string, params: Record<string, unknown> = {}) => sanityClient.fetch<T>(query, params as any);

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/* ---------- Valores por defecto si un documento único aún no existe en el CMS ---------- */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const defaultSettings: SiteSettings = {
  siteName: "Microdent Implant System",
  siteUrl,
  fallbackContact: { name: "Dirección Comercial y Administrativa", role: "Atención nacional e internacional", whatsapp: "" },
  whatsappTemplates: mock.siteSettings.whatsappTemplates,
  social: [],
};

const defaultHome: HomePage = { ...mock.homePage, featuredCategoryIds: [], featuredProductIds: [] };

/* ---------- Ajustes y páginas ---------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  if (!useSanity) return mock.siteSettings;
  const s = await fetchSanity<Partial<SiteSettings> | null>(SETTINGS_QUERY);
  return {
    ...defaultSettings,
    fallbackContact: { ...defaultSettings.fallbackContact, ...(s?.fallbackContact ?? {}) },
    whatsappTemplates: { ...defaultSettings.whatsappTemplates, ...(s?.whatsappTemplates ?? {}) },
    email: s?.email ?? undefined,
    social: s?.social ?? [],
  };
}

export async function getHomePage(): Promise<HomePage> {
  "use cache";
  cacheLife("hours");
  cacheTag("home");
  if (!useSanity) return mock.homePage;
  const h = await fetchSanity<Partial<HomePage> | null>(HOME_QUERY);
  if (!h) return defaultHome;
  return {
    heroEyebrow: h.heroEyebrow ?? defaultHome.heroEyebrow,
    heroTitle: h.heroTitle ?? defaultHome.heroTitle,
    heroSubtitle: h.heroSubtitle ?? defaultHome.heroSubtitle,
    heroImage: h.heroImage ?? defaultHome.heroImage,
    featuredCategoryIds: h.featuredCategoryIds ?? [],
    featuredProductIds: h.featuredProductIds ?? [],
    about: { ...defaultHome.about, ...(h.about ?? {}) },
    advisorTeaser: { ...defaultHome.advisorTeaser, ...(h.advisorTeaser ?? {}) },
  };
}

export async function getAboutPage(): Promise<AboutPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("about");
  if (!useSanity) return mock.aboutPage;
  const a = await fetchSanity<(Omit<AboutPage, "image"> & { image: AboutPage["image"] | null }) | null>(ABOUT_QUERY);
  return a ? { ...a, image: a.image ?? undefined } : { title: "Nosotros", intro: "", sections: [] };
}

export async function getLegalPages(): Promise<LegalPage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  if (!useSanity) return mock.legalPages;
  return fetchSanity<LegalPage[]>(LEGAL_QUERY);
}

export async function getLegalPage(slug: string): Promise<LegalPage | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  return (await getLegalPages()).find((p) => p.slug === slug);
}

/* ---------- Catálogo ---------- */

export async function getCategories(): Promise<ProductCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  if (!useSanity) return mock.categories.filter((c) => c.active).sort(byOrder);
  return normalizeCategories(await fetchSanity(CATEGORIES_QUERY));
}

export async function getLines(): Promise<ProductLine[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("lines");
  if (!useSanity) return mock.lines.filter((l) => l.active).sort(byOrder);
  return normalizeLines(await fetchSanity(LINES_QUERY));
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  if (!useSanity) return mock.products.filter((p) => p.active).sort(byOrder);
  return normalizeProducts(await fetchSanity(PRODUCTS_QUERY));
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const all = await getProducts();
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}

async function getDocuments(ids: string[]): Promise<ProductDocument[]> {
  if (ids.length === 0) return [];
  if (!useSanity) return mock.documents.filter((d) => d.active && ids.includes(d.id));
  const docs = await fetchSanity<ProductDocument[]>(DOCUMENTS_QUERY, { ids });
  return docs.filter((d) => d.url);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "categories", "lines");
  const [products, categories, lines] = await Promise.all([getProducts(), getCategories(), getLines()]);
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  const category = categories.find((c) => c.id === product.categoryId);
  if (!category) return undefined;
  const documents = await getDocuments(product.documentIds);
  return {
    ...product,
    category,
    line: lines.find((l) => l.id === product.lineId),
    // Respeta el orden definido en el producto.
    documents: product.documentIds
      .map((id) => documents.find((d) => d.id === id))
      .filter((d): d is ProductDocument => Boolean(d)),
    related: await getProductsByIds(product.relatedIds),
    variants: product.variants.filter((v) => v.active),
  };
}

/* ---------- Asesores ---------- */

export async function getAdvisorsAndCoverages(): Promise<{
  advisors: Advisor[];
  coverages: AdvisorCoverage[];
}> {
  "use cache";
  cacheLife("hours");
  cacheTag("advisors");
  if (!useSanity) return { advisors: mock.advisors, coverages: mock.coverages };
  const [advisors, coverages] = await Promise.all([
    fetchSanity<Parameters<typeof normalizeAdvisors>[0]>(ADVISORS_QUERY),
    fetchSanity<RawCoverage[]>(COVERAGES_QUERY),
  ]);
  return { advisors: normalizeAdvisors(advisors), coverages: normalizeCoverages(coverages) };
}

/** Zonas regionales (por departamento), para textos como «Presencia: Medellín, Bogotá…». */
export async function getHubCities(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("advisors");
  const { coverages } = await getAdvisorsAndCoverages();
  return [...new Set(coverages.filter((c) => c.active && c.departmentCodes.length > 0).map((c) => c.zoneName))];
}
