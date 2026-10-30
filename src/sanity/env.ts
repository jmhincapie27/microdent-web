/**
 * Configuración de Sanity. El Project ID y el dataset son públicos por diseño
 * (el navegador los necesita para el Studio); los tokens nunca van aquí.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "u536aqfy";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-02-19";

/**
 * Origen del contenido del sitio público:
 * - "mock": datos ficticios del prototipo (por defecto).
 * - "sanity": contenido real publicado en el CMS.
 * Se cambia en Vercel con NEXT_PUBLIC_CONTENT_SOURCE=sanity cuando el contenido real esté cargado.
 */
export const contentSource: "mock" | "sanity" =
  process.env.NEXT_PUBLIC_CONTENT_SOURCE === "sanity" ? "sanity" : "mock";
