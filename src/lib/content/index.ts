import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import * as mock from "@/mocks/content";
import type {
  AboutPage,
  Advisor,
  AdvisorCoverage,
  HomePage,
  LegalPage,
  Product,
  ProductCategory,
  ProductDetail,
  ProductLine,
  SiteSettings,
} from "./types";

/**
 * Punto único de acceso al contenido.
 *
 * Fase 2 (prototipo): lee los datos ficticios de `src/mocks`.
 * Fase 3: cada función se reemplaza por una consulta GROQ a Sanity con la misma firma,
 * sin cambios en páginas ni componentes.
 *
 * Cada función se cachea ("use cache") con una etiqueta. En la Fase 3, al publicar en
 * Sanity, un webhook invalidará solo la etiqueta afectada (p. ej. "products").
 */

export const IS_PROTOTYPE = true;

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  return mock.siteSettings;
}

export async function getHomePage(): Promise<HomePage> {
  "use cache";
  cacheLife("hours");
  cacheTag("home");
  return mock.homePage;
}

export async function getAboutPage(): Promise<AboutPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("about");
  return mock.aboutPage;
}

export async function getLegalPages(): Promise<LegalPage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  return mock.legalPages;
}

export async function getLegalPage(slug: string): Promise<LegalPage | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  return mock.legalPages.find((p) => p.slug === slug);
}

export async function getCategories(): Promise<ProductCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return mock.categories.filter((c) => c.active).sort(byOrder);
}

export async function getLines(): Promise<ProductLine[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("lines");
  return mock.lines.filter((l) => l.active).sort(byOrder);
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return mock.products.filter((p) => p.active).sort(byOrder);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const all = await getProducts();
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const product = mock.products.find((p) => p.slug === slug && p.active);
  if (!product) return undefined;
  const category = mock.categories.find((c) => c.id === product.categoryId);
  if (!category) return undefined;
  return {
    ...product,
    category,
    line: mock.lines.find((l) => l.id === product.lineId),
    documents: product.documentIds
      .map((id) => mock.documents.find((d) => d.id === id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d?.active)),
    related: await getProductsByIds(product.relatedIds),
    variants: product.variants.filter((v) => v.active),
  };
}

export async function getAdvisorsAndCoverages(): Promise<{
  advisors: Advisor[];
  coverages: AdvisorCoverage[];
}> {
  "use cache";
  cacheLife("hours");
  cacheTag("advisors");
  return { advisors: mock.advisors, coverages: mock.coverages };
}

/** Ciudades sede, para textos como "Asesores en Medellín, Bogotá…". */
export async function getHubCities(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("advisors");
  // Solo zonas regionales (por departamento); las sub-zonas por municipio no son sedes.
  const set = new Set(
    mock.coverages.filter((c) => c.active && c.departmentCodes.length > 0).map((c) => c.zoneName),
  );
  return [...set];
}
