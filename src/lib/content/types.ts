/**
 * Tipos de contenido. Reflejan uno a uno los modelos que tendrá Sanity (Fase 3),
 * así el cambio de datos ficticios a CMS no toca los componentes.
 */

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  /** Texto alternativo obligatorio. */
  alt: string;
}

export interface ProductCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: ImageAsset;
  featured: boolean;
  order: number;
  active: boolean;
}

export interface ProductLine {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  active: boolean;
}

export type DocumentType = "ficha-tecnica" | "ifu" | "catalogo" | "certificado" | "otro";

export interface ProductDocument {
  id: string;
  title: string;
  type: DocumentType;
  url: string;
  /** Tamaño en bytes, para mostrar "PDF, 1,2 MB". */
  size: number;
  language: "es" | "en" | "otro";
  version?: string;
  active: boolean;
}

export interface ProductFeature {
  text: string;
  /** Fuente interna que respalda el dato. Nunca se muestra en la web. */
  source: string;
}

export interface ProductSpec {
  label: string;
  value: string;
  unit?: string;
}

export interface ProductVariant {
  reference: string;
  attributes: { label: string; value: string }[];
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  reference: string;
  slug: string;
  categoryId: string;
  lineId?: string;
  images: ImageAsset[];
  shortDescription: string;
  features: ProductFeature[];
  specs: ProductSpec[];
  variants: ProductVariant[];
  documentIds: string[];
  relatedIds: string[];
  regulatory?: { sanitaryRegistration?: string; notes?: string };
  featured: boolean;
  order: number;
  active: boolean;
  /** Fecha ISO de publicación; se usa para ordenar por "Recientes". */
  publishedAt: string;
  seo?: { title?: string; description?: string };
  /** Solo en el prototipo: marca el producto como dato de ejemplo. */
  isMock?: boolean;
}

/** Producto con sus relaciones ya resueltas, listo para la ficha. */
export interface ProductDetail extends Product {
  category: ProductCategory;
  line?: ProductLine;
  documents: ProductDocument[];
  related: Product[];
}

export interface Advisor {
  id: string;
  publicName: string;
  role: string;
  photo?: ImageAsset;
  /** Número corporativo en formato E.164 (+57XXXXXXXXXX). No se muestra en pantalla. */
  whatsapp: string;
  consent: { authorized: boolean; date: string };
  active: boolean;
  isMock?: boolean;
}

/**
 * Cobertura comercial (modelo AdvisorCoverage).
 * Una cobertura agrupa territorios (departamentos y/o municipios) y la lista
 * ordenada de asesores que los atienden. Ej.: "Eje Cafetero" → Caldas, Risaralda, Quindío.
 */
export interface AdvisorCoverage {
  id: string;
  /** Nombre de la zona comercial, p. ej. "Medellín" o "Costa". */
  zoneName: string;
  /** Ciudad sede desde donde se atiende la zona. */
  hubCity: string;
  departmentCodes: string[];
  municipalityCodes: string[];
  /** Asesores en orden comercial (el primero se muestra primero). */
  advisors: { advisorId: string; priority: number }[];
  validFrom?: string;
  validUntil?: string;
  active: boolean;
}

export interface FallbackContact {
  name: string;
  role: string;
  whatsapp: string;
  isMock?: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  /** Contacto cuando no hay cobertura o el visitante está fuera de Colombia. */
  fallbackContact: FallbackContact;
  whatsappTemplates: {
    general: string;
    product: string;
  };
  email?: string;
  address?: string;
  social: { label: string; url: string }[];
}

export interface HomePage {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: ImageAsset;
  featuredCategoryIds: string[];
  featuredProductIds: string[];
  about: { title: string; text: string };
  advisorTeaser: { title: string; text: string };
}

export interface AboutPage {
  title: string;
  intro: string;
  sections: { title: string; text: string }[];
  image?: ImageAsset;
}

export interface LegalPage {
  slug: string;
  title: string;
  updatedAt: string;
  body: string[];
}

export interface Department {
  code: string;
  name: string;
}

export interface Municipality {
  code: string;
  name: string;
  officialName?: string;
  departmentCode: string;
}
