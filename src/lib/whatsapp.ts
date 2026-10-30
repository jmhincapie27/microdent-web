/**
 * Enlaces de WhatsApp (wa.me) con mensaje prellenado.
 * La plantilla viene del CMS (SiteSettings) y admite estos marcadores:
 * {asesor} {municipio} {producto} {referencia} {url}
 */

export interface WhatsAppContext {
  asesor?: string;
  municipio?: string;
  producto?: string;
  referencia?: string;
  url?: string;
}

const MAX_MESSAGE_LENGTH = 700;

export function fillTemplate(template: string, ctx: WhatsAppContext): string {
  const filled = template.replace(/\{(asesor|municipio|producto|referencia|url)\}/g, (_, key) => {
    const value = ctx[key as keyof WhatsAppContext];
    return value ? value.trim() : "";
  });
  // Limpia restos de marcadores vacíos: "desde ." o espacios dobles.
  return filled
    .replace(/\s+([.,:])/g, "$1")
    .replace(/\(\s*Ref\.\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

/** Deja solo dígitos: "+57 300 123 4567" → "573001234567". */
export function toWaNumber(e164: string): string {
  return e164.replace(/\D/g, "");
}

/** Número móvil colombiano válido: +57 seguido de 10 dígitos que empiezan por 3. */
export function isValidColombianMobile(e164: string): boolean {
  return /^\+573\d{9}$/.test(e164.replace(/\s/g, ""));
}

/**
 * En el prototipo los números son ficticios: el enlace abre WhatsApp sin destinatario
 * (el visitante elige el contacto), así nunca se escribe a un teléfono real por error.
 */
export function buildWhatsAppLink(number: string, message: string, opts?: { safeMode?: boolean }) {
  const text = encodeURIComponent(message);
  if (opts?.safeMode || !isValidColombianMobile(number)) {
    return `https://wa.me/?text=${text}`;
  }
  return `https://wa.me/${toWaNumber(number)}?text=${text}`;
}
