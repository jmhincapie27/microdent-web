import Link from "next/link";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import type { LegalPage, SiteSettings } from "@/lib/content/types";
import { cacheLife } from "next/cache";

/** Año actual, cacheado para que la página pueda prerenderizarse. */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export function SiteFooter({
  settings,
  legal,
  hubs,
}: {
  settings: SiteSettings;
  legal: LegalPage[];
  hubs: string[];
}) {
  return (
    <footer className="on-dark bg-antracita-900 text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="negativo" />
          <p className="mt-4 max-w-xs text-sm text-white/85">
            Catálogo digital de productos Microdent para profesionales de la odontología en Colombia.
          </p>
        </div>

        <nav aria-label="Pie de página">
          <h2 className="font-display text-sm font-semibold tracking-wide text-glauco uppercase">Sitio</h2>
          <ul className="mt-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-white/90 hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold tracking-wide text-glauco uppercase">Presencia</h2>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            {hubs.map((h) => (
              <li key={h} className="min-h-7">{h}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold tracking-wide text-glauco uppercase">Contacto</h2>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            <li>
              <Link href="/asesores" className="inline-flex min-h-9 items-center hover:text-white hover:underline">
                Encontrar un asesor
              </Link>
            </li>
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex min-h-9 items-center hover:text-white hover:underline">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© <CurrentYear /> Microdent. Todos los derechos reservados.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legal.map((p) => (
              <li key={p.slug}>
                <Link href={`/legal/${p.slug}`} className="inline-flex min-h-9 items-center hover:text-white hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
