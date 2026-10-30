/**
 * Analítica: una sola función `track()` con eventos tipados.
 * Envía a `window.dataLayer` (Google Tag Manager / GA4). GTM solo se carga
 * cuando el visitante acepta cookies (Fase 4); mientras tanto los eventos quedan en
 * la capa de datos y, en desarrollo, se muestran en la consola.
 *
 * Importante: `whatsapp_click` mide intención de contacto, NO una venta.
 */

export type AnalyticsEvent =
  | { name: "view_item"; params: { product_ref: string; product_slug: string; category: string; line?: string } }
  | { name: "search_products"; params: { query: string; results_count: number; category: string[]; line: string[] } }
  | { name: "advisor_search"; params: { department_code: string; municipality_code: string; results_count: number; coverage_level: "municipality" | "department" | "fallback" } }
  | { name: "whatsapp_click"; params: { advisor_id: string; municipality_code: string; product_ref?: string; source: "localizador" | "ficha" | "general" } }
  | { name: "file_download"; params: { document_type: string; product_ref: string; file_name: string } };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track<E extends AnalyticsEvent>(event: E["name"], params: E["params"]): void;
export function track(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, params);
  }
}
