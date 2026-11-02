/**
 * Con Cache Components, `generateStaticParams` debe devolver al menos un valor.
 * Mientras el CMS no tenga contenido (p. ej. aún no hay páginas legales), se devuelve
 * un identificador de relleno que la página responde con 404.
 */
export const PLACEHOLDER_SLUG = "__sin-contenido__";

export function atLeastOne(params: { slug: string }[]): { slug: string }[] {
  return params.length > 0 ? params : [{ slug: PLACEHOLDER_SLUG }];
}
