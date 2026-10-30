export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/asesores", label: "Asesores" },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** En una ficha de producto, el contacto lleva el producto como contexto. */
export function contactHref(pathname: string) {
  const match = pathname.match(/^\/productos\/([^/]+)$/);
  return match ? `/asesores?producto=${encodeURIComponent(match[1])}` : "/asesores";
}
