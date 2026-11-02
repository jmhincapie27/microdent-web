/**
 * ⚠️ DATOS FICTICIOS — SOLO PARA EL PROTOTIPO (Fase 2)
 *
 * Nada de este archivo es información real de productos ni de asesores Microdent.
 * - Nombres de producto: "… de ejemplo", referencias con prefijo DEMO-.
 * - Especificaciones y variantes: valores de relleno, sin datos técnicos ni clínicos.
 * - Asesores: nombres genéricos y números de WhatsApp inválidos a propósito.
 * - Fotografías: las únicas piezas reales (enviadas por Microdent), usadas sin modificar.
 *
 * En la Fase 3 este archivo se reemplaza por consultas a Sanity CMS.
 */
import type {
  AboutPage,
  Advisor,
  AdvisorCoverage,
  HomePage,
  ImageAsset,
  LegalPage,
  Product,
  ProductCategory,
  ProductDocument,
  ProductLine,
  SiteSettings,
} from "@/lib/content/types";
import { textToBlocks } from "@/lib/rich-text";

/* ---------- Fotografías reales (sin modificar) ---------- */

const photos = {
  gama5: {
    src: "/productos/implantes-gama-5.webp",
    width: 2000,
    height: 1000,
    alt: "Cinco implantes dentales de cuerpo gris oscuro y cuello dorado, de menor a mayor diámetro",
  },
  coronaPilar: {
    src: "/productos/implante-corona-pilar.webp",
    width: 1883,
    height: 835,
    alt: "Corona dental sobre pilar dorado junto a un implante de cuerpo gris oscuro",
  },
  parA: {
    src: "/productos/implantes-par-a.webp",
    width: 2000,
    height: 1837,
    alt: "Dos implantes dentales, uno con cuello plateado y otro con cuello dorado",
  },
  parB: {
    src: "/productos/implantes-par-b.webp",
    width: 2000,
    height: 2000,
    alt: "Dos implantes dentales vistos desde arriba, con conexión interna, cuello plateado y dorado",
  },
} satisfies Record<string, ImageAsset>;

/* ---------- Catálogo ---------- */

export const categories: ProductCategory[] = [
  { id: "cat-implantes", title: "Implantes", slug: "implantes", description: "Categoría de ejemplo.", image: photos.parB, featured: true, order: 1, active: true },
  { id: "cat-aditamentos", title: "Aditamentos protésicos", slug: "aditamentos-protesicos", description: "Categoría de ejemplo.", image: photos.coronaPilar, featured: true, order: 2, active: true },
  { id: "cat-instrumental", title: "Instrumental", slug: "instrumental", description: "Categoría de ejemplo.", featured: true, order: 3, active: true },
  { id: "cat-kits", title: "Kits quirúrgicos", slug: "kits-quirurgicos", description: "Categoría de ejemplo.", featured: true, order: 4, active: true },
];

export const lines: ProductLine[] = [
  { id: "line-a", title: "Línea de ejemplo A", slug: "linea-a", order: 1, active: true },
  { id: "line-b", title: "Línea de ejemplo B", slug: "linea-b", order: 2, active: true },
  { id: "line-c", title: "Línea de ejemplo C", slug: "linea-c", order: 3, active: true },
];

export const documents: ProductDocument[] = [
  { id: "doc-ficha", title: "Ficha técnica (documento de ejemplo)", type: "ficha-tecnica", url: "/docs/documento-de-ejemplo.pdf", size: 738, language: "es", version: "v0 — ejemplo", active: true },
  { id: "doc-ifu", title: "Instrucciones de uso (documento de ejemplo)", type: "ifu", url: "/docs/documento-de-ejemplo.pdf", size: 738, language: "es", version: "v0 — ejemplo", active: true },
  { id: "doc-catalogo", title: "Catálogo general (documento de ejemplo)", type: "catalogo", url: "/docs/documento-de-ejemplo.pdf", size: 738, language: "es", active: true },
];

const pendingSource = "Pendiente: ficha técnica oficial";

const exampleFeatures = [
  { text: "Característica de ejemplo 1. Se reemplaza por un dato verificado en la ficha técnica.", source: pendingSource },
  { text: "Característica de ejemplo 2. Se reemplaza por un dato verificado en la ficha técnica.", source: pendingSource },
];

const implantSpecs = [
  { label: "Material", value: "Valor de ejemplo" },
  { label: "Tratamiento de superficie", value: "Valor de ejemplo" },
  { label: "Tipo de conexión", value: "Valor de ejemplo" },
  { label: "Plataforma", value: "Valor de ejemplo" },
];

function implantVariants(prefix: string) {
  const out = [];
  for (const d of ["D1", "D2"]) {
    for (const l of ["L1", "L2", "L3"]) {
      out.push({
        reference: `${prefix}-${d}${l}`,
        attributes: [
          { label: "Diámetro", value: `${d} (ejemplo)` },
          { label: "Longitud", value: `${l} (ejemplo)` },
        ],
        active: true,
      });
    }
  }
  return out;
}

const base = {
  features: exampleFeatures,
  specs: [] as Product["specs"],
  variants: [] as Product["variants"],
  documentIds: [] as string[],
  relatedIds: [] as string[],
  featured: false,
  active: true,
  isMock: true,
};

export const products: Product[] = [
  {
    ...base,
    id: "p-imp-001",
    name: "Implante de ejemplo A",
    reference: "DEMO-IMP-001",
    slug: "implante-de-ejemplo-a-demo-imp-001",
    categoryId: "cat-implantes",
    lineId: "line-a",
    images: [photos.parB, photos.parA],
    // Ejemplo de descripción con formato (texto enriquecido del panel).
    description: [
      { _type: "block", _key: "d1", style: "lead", markDefs: [], children: [{ _type: "span", _key: "d1a", text: "Texto de ejemplo con formato: así se verá la descripción detallada que se escribe en el panel.", marks: [] }] },
      { _type: "block", _key: "d2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "d2a", text: "Subtítulo de ejemplo", marks: [] }] },
      {
        _type: "block", _key: "d3", style: "normal", markDefs: [],
        children: [
          { _type: "span", _key: "d3a", text: "Párrafo con ", marks: [] },
          { _type: "span", _key: "d3b", text: "negrita", marks: ["strong"] },
          { _type: "span", _key: "d3c", text: " y ", marks: [] },
          { _type: "span", _key: "d3d", text: "cursiva", marks: ["em"] },
          { _type: "span", _key: "d3e", text: ".", marks: [] },
        ],
      },
      { _type: "block", _key: "d4", style: "normal", listItem: "bullet", level: 1, markDefs: [], children: [{ _type: "span", _key: "d4a", text: "Viñeta de ejemplo 1", marks: [] }] },
      { _type: "block", _key: "d5", style: "normal", listItem: "bullet", level: 1, markDefs: [], children: [{ _type: "span", _key: "d5a", text: "Viñeta de ejemplo 2", marks: [] }] },
      { _type: "callout", _key: "d6", title: "Nota destacada de ejemplo", text: "Los elementos se insertan desde el editor del panel." },
      { _type: "ctaButton", _key: "d7", label: "Ver asesores", href: "/asesores" },
    ],
    shortDescription: "Descripción corta de ejemplo. Aquí irá el texto aprobado por Microdent para este producto.",
    specs: implantSpecs,
    variants: implantVariants("DEMO-IMP-001"),
    documentIds: ["doc-ficha", "doc-ifu"],
    relatedIds: ["p-imp-002", "p-adt-001", "p-adt-002", "p-kit-001"],
    featured: true,
    order: 1,
    publishedAt: "2026-09-01",
  },
  {
    ...base,
    id: "p-imp-002",
    name: "Implante de ejemplo B",
    reference: "DEMO-IMP-002",
    slug: "implante-de-ejemplo-b-demo-imp-002",
    categoryId: "cat-implantes",
    lineId: "line-b",
    images: [photos.gama5],
    shortDescription: "Descripción corta de ejemplo. Aquí irá el texto aprobado por Microdent para este producto.",
    specs: implantSpecs,
    variants: implantVariants("DEMO-IMP-002"),
    documentIds: ["doc-ficha"],
    relatedIds: ["p-imp-001", "p-imp-003", "p-adt-001"],
    featured: true,
    order: 2,
    publishedAt: "2026-09-15",
  },
  {
    ...base,
    id: "p-imp-003",
    name: "Implante de ejemplo C",
    reference: "DEMO-IMP-003",
    slug: "implante-de-ejemplo-c-demo-imp-003",
    categoryId: "cat-implantes",
    lineId: "line-a",
    images: [photos.parA],
    shortDescription: "Descripción corta de ejemplo. Aquí irá el texto aprobado por Microdent para este producto.",
    specs: implantSpecs,
    variants: implantVariants("DEMO-IMP-003"),
    documentIds: ["doc-ficha"],
    relatedIds: ["p-imp-001", "p-imp-002"],
    order: 3,
    publishedAt: "2026-07-20",
  },
  {
    ...base,
    id: "p-imp-004",
    name: "Implante de ejemplo D",
    reference: "DEMO-IMP-004",
    slug: "implante-de-ejemplo-d-demo-imp-004",
    categoryId: "cat-implantes",
    lineId: "line-c",
    images: [photos.gama5],
    shortDescription: "Descripción corta de ejemplo. Aquí irá el texto aprobado por Microdent para este producto.",
    variants: implantVariants("DEMO-IMP-004"),
    relatedIds: ["p-imp-002"],
    order: 4,
    publishedAt: "2026-10-10",
  },
  {
    ...base,
    id: "p-adt-001",
    name: "Pilar protésico de ejemplo",
    reference: "DEMO-ADT-001",
    slug: "pilar-protesico-de-ejemplo-demo-adt-001",
    categoryId: "cat-aditamentos",
    lineId: "line-a",
    images: [photos.coronaPilar],
    shortDescription: "Descripción corta de ejemplo. Aquí irá el texto aprobado por Microdent para este producto.",
    specs: [
      { label: "Material", value: "Valor de ejemplo" },
      { label: "Compatibilidad", value: "Valor de ejemplo" },
    ],
    documentIds: ["doc-ficha"],
    relatedIds: ["p-imp-001", "p-adt-002", "p-adt-003"],
    featured: true,
    order: 5,
    publishedAt: "2026-08-05",
  },
  {
    ...base,
    id: "p-adt-002",
    name: "Pilar de cicatrización de ejemplo",
    reference: "DEMO-ADT-002",
    slug: "pilar-de-cicatrizacion-de-ejemplo-demo-adt-002",
    categoryId: "cat-aditamentos",
    lineId: "line-b",
    images: [],
    shortDescription: "Descripción corta de ejemplo. Producto sin fotografía para mostrar cómo se ve el espacio reservado.",
    relatedIds: ["p-adt-001"],
    order: 6,
    publishedAt: "2026-06-11",
  },
  {
    ...base,
    id: "p-adt-003",
    name: "Tornillo protésico de ejemplo",
    reference: "DEMO-ADT-003",
    slug: "tornillo-protesico-de-ejemplo-demo-adt-003",
    categoryId: "cat-aditamentos",
    lineId: "line-a",
    images: [],
    shortDescription: "Descripción corta de ejemplo. Producto sin fotografía para mostrar cómo se ve el espacio reservado.",
    order: 7,
    publishedAt: "2026-05-02",
  },
  {
    ...base,
    id: "p-adt-004",
    name: "Análogo de laboratorio de ejemplo",
    reference: "DEMO-ADT-004",
    slug: "analogo-de-laboratorio-de-ejemplo-demo-adt-004",
    categoryId: "cat-aditamentos",
    lineId: "line-c",
    images: [],
    shortDescription: "Descripción corta de ejemplo.",
    order: 8,
    publishedAt: "2026-04-18",
  },
  {
    ...base,
    id: "p-ins-001",
    name: "Fresa quirúrgica de ejemplo",
    reference: "DEMO-INS-001",
    slug: "fresa-quirurgica-de-ejemplo-demo-ins-001",
    categoryId: "cat-instrumental",
    lineId: "line-a",
    images: [],
    shortDescription: "Descripción corta de ejemplo.",
    order: 9,
    publishedAt: "2026-03-01",
  },
  {
    ...base,
    id: "p-ins-002",
    name: "Llave de torque de ejemplo",
    reference: "DEMO-INS-002",
    slug: "llave-de-torque-de-ejemplo-demo-ins-002",
    categoryId: "cat-instrumental",
    lineId: "line-b",
    images: [],
    shortDescription: "Descripción corta de ejemplo.",
    order: 10,
    publishedAt: "2026-02-14",
  },
  {
    ...base,
    id: "p-kit-001",
    name: "Kit quirúrgico de ejemplo",
    reference: "DEMO-KIT-001",
    slug: "kit-quirurgico-de-ejemplo-demo-kit-001",
    categoryId: "cat-kits",
    lineId: "line-a",
    images: [],
    shortDescription: "Descripción corta de ejemplo.",
    documentIds: ["doc-catalogo"],
    relatedIds: ["p-ins-001", "p-ins-002"],
    featured: true,
    order: 11,
    publishedAt: "2026-10-01",
  },
];

/* ---------- Asesores (ficticios) ---------- */

function advisor(id: string, n: number): Advisor {
  return {
    id,
    publicName: `Asesor de ejemplo ${n}`,
    role: "Asesor comercial",
    // Número inválido a propósito: el prototipo nunca escribe a un teléfono real.
    whatsapp: `+5700000000${String(n).padStart(2, "0")}`,
    consent: { authorized: true, date: "2026-10-30" },
    active: true,
    isMock: true,
  };
}

export const advisors: Advisor[] = [
  advisor("adv-med-1", 1),
  advisor("adv-med-2", 2),
  advisor("adv-eje-1", 3),
  advisor("adv-bog-1", 4),
  advisor("adv-bog-2", 5),
  advisor("adv-cal-1", 6),
  advisor("adv-cos-1", 7),
  advisor("adv-cos-2", 8),
  advisor("adv-nei-1", 9),
  advisor("adv-san-1", 10),
  advisor("adv-iba-1", 12),
  advisor("adv-qui-1", 13),
  advisor("adv-cuc-1", 14),
  { ...advisor("adv-inactivo", 11), active: false },
];

/**
 * Propuesta inicial de zonas comerciales (editable en el CMS).
 * Cada departamento se asigna a la sede más cercana. Departamentos sin zona
 * (Amazonas, Guainía, Guaviare, Vaupés, Vichada) y visitantes fuera de Colombia
 * van a la Dirección Comercial y Administrativa.
 */
export const coverages: AdvisorCoverage[] = [
  {
    id: "cov-medellin",
    zoneName: "Medellín",
    hubCity: "Medellín",
    departmentCodes: ["05"], // Antioquia
    municipalityCodes: [],
    advisors: [
      { advisorId: "adv-med-1", priority: 1 },
      { advisorId: "adv-med-2", priority: 2 },
    ],
    active: true,
  },
  {
    // Ejemplo de cobertura por municipio: el asesor 2 es el primero en el Oriente antioqueño.
    id: "cov-medellin-oriente",
    zoneName: "Oriente antioqueño",
    hubCity: "Medellín",
    departmentCodes: [],
    municipalityCodes: ["05615", "05376", "05148"], // Rionegro, La Ceja, El Carmen de Viboral
    advisors: [{ advisorId: "adv-med-2", priority: 1 }],
    active: true,
  },
  {
    id: "cov-eje",
    zoneName: "Eje Cafetero",
    hubCity: "Pereira",
    departmentCodes: ["17", "66", "63"], // Caldas, Risaralda, Quindío
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-eje-1", priority: 1 }],
    active: true,
  },
  {
    id: "cov-bogota",
    zoneName: "Bogotá",
    hubCity: "Bogotá",
    departmentCodes: ["11", "25", "15", "50", "85"], // Bogotá, Cundinamarca, Boyacá, Meta, Casanare
    municipalityCodes: [],
    advisors: [
      { advisorId: "adv-bog-1", priority: 1 },
      { advisorId: "adv-bog-2", priority: 2 },
    ],
    active: true,
  },
  {
    id: "cov-cali",
    zoneName: "Cali",
    hubCity: "Cali",
    departmentCodes: ["76", "19", "52"], // Valle, Cauca, Nariño
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-cal-1", priority: 1 }],
    active: true,
  },
  {
    id: "cov-costa-norte",
    zoneName: "Costa",
    hubCity: "Barranquilla",
    departmentCodes: ["08", "47", "44", "20"], // Atlántico, Magdalena, La Guajira, Cesar
    municipalityCodes: [],
    advisors: [
      { advisorId: "adv-cos-1", priority: 1 },
      { advisorId: "adv-cos-2", priority: 2 },
    ],
    active: true,
  },
  {
    id: "cov-costa-sur",
    zoneName: "Costa",
    hubCity: "Cartagena",
    departmentCodes: ["13", "23", "70", "88"], // Bolívar, Córdoba, Sucre, San Andrés
    municipalityCodes: [],
    advisors: [
      { advisorId: "adv-cos-2", priority: 1 },
      { advisorId: "adv-cos-1", priority: 2 },
    ],
    active: true,
  },
  {
    id: "cov-neiva",
    zoneName: "Neiva",
    hubCity: "Neiva",
    departmentCodes: ["41", "18", "86"], // Huila, Caquetá, Putumayo
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-nei-1", priority: 1 }],
    active: true,
  },
  {
    id: "cov-santander",
    zoneName: "Santander",
    hubCity: "Bucaramanga",
    departmentCodes: ["68"], // Santander
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-san-1", priority: 1 }],
    active: true,
  },
  {
    id: "cov-ibague",
    zoneName: "Ibagué",
    hubCity: "Ibagué",
    departmentCodes: ["73"], // Tolima
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-iba-1", priority: 1 }],
    active: true,
  },
  {
    id: "cov-quibdo",
    zoneName: "Quibdó",
    hubCity: "Quibdó",
    departmentCodes: ["27"], // Chocó
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-qui-1", priority: 1 }],
    active: true,
  },
  {
    id: "cov-cucuta",
    zoneName: "Cúcuta",
    hubCity: "Cúcuta",
    departmentCodes: ["54", "81"], // Norte de Santander, Arauca
    municipalityCodes: [],
    advisors: [{ advisorId: "adv-cuc-1", priority: 1 }],
    active: true,
  },
];

/* ---------- Páginas y ajustes ---------- */

export const siteSettings: SiteSettings = {
  siteName: "Microdent Implant System",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  fallbackContact: {
    name: "Dirección Comercial y Administrativa",
    role: "Atención nacional e internacional",
    whatsapp: "+570000000000",
    isMock: true,
  },
  whatsappTemplates: {
    general:
      "Hola {asesor}, le escribo desde {municipio}. Quisiera recibir asesoría sobre productos Microdent.",
    product:
      "Hola {asesor}, le escribo desde {municipio}. Me interesa el producto {producto} (Ref. {referencia}): {url}",
  },
  email: "contacto@ejemplo.com",
  social: [],
};

export const homePage: HomePage = {
  heroEyebrow: "Microdent Implant System",
  heroTitle: "Sistemas de implantes Microdent",
  heroSubtitle:
    "Consulte el catálogo, revise las especificaciones y hable directamente con el asesor de su ciudad.",
  heroImage: photos.gama5,
  featuredCategoryIds: ["cat-implantes", "cat-aditamentos", "cat-instrumental", "cat-kits"],
  featuredProductIds: ["p-imp-001", "p-imp-002", "p-adt-001", "p-kit-001"],
  about: {
    title: "Sobre Microdent",
    text: "Texto institucional de ejemplo. Aquí irá una presentación breve de Microdent aprobada por la marca.",
  },
  advisorTeaser: {
    title: "Encuentre a su asesor",
    text: "Tenemos asesores en Medellín, Eje Cafetero, Bogotá, Cali, la Costa, Neiva, Santander, Ibagué, Quibdó y Cúcuta.",
  },
};

export const aboutPage: AboutPage = {
  title: "Nosotros",
  intro:
    "Texto de ejemplo. Esta página se edita desde el CMS con el contenido institucional aprobado por Microdent.",
  sections: [
    { title: "Quiénes somos", body: textToBlocks(["Contenido de ejemplo pendiente de aprobación."]) },
    {
      title: "Presencia en Colombia",
      body: textToBlocks(["Medellín, Eje Cafetero, Bogotá, Cali, Costa, Neiva, Santander, Ibagué, Quibdó y Cúcuta."]),
    },
    { title: "Compromiso con el profesional", body: textToBlocks(["Contenido de ejemplo pendiente de aprobación."]) },
  ],
  image: photos.coronaPilar,
};

export const legalPages: LegalPage[] = [
  {
    slug: "politica-de-privacidad",
    title: "Política de privacidad",
    updatedAt: "2026-10-30",
    body: textToBlocks([
      "Contenido de ejemplo. El texto definitivo lo debe redactar o aprobar el área legal de Microdent.",
      "Este sitio no solicita registro ni datos personales a los visitantes. El contacto con asesores se hace por WhatsApp, por iniciativa del visitante.",
    ]),
  },
  {
    slug: "tratamiento-de-datos",
    title: "Política de tratamiento de datos personales",
    updatedAt: "2026-10-30",
    body: textToBlocks([
      "Contenido de ejemplo. Debe cumplir la Ley 1581 de 2012 y el Decreto 1377 de 2013.",
      "Los datos de los asesores publicados en el sitio cuentan con su autorización previa.",
    ]),
  },
  {
    slug: "terminos-de-uso",
    title: "Términos de uso",
    updatedAt: "2026-10-30",
    body: textToBlocks(["Contenido de ejemplo pendiente de revisión legal."]),
  },
  {
    slug: "cookies",
    title: "Política de cookies",
    updatedAt: "2026-10-30",
    body: textToBlocks([
      "Contenido de ejemplo. La analítica solo se activará con el consentimiento del visitante.",
    ]),
  },
];
