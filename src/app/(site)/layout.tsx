import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileContactBar } from "@/components/layout/mobile-contact-bar";
import { PrototypeBanner } from "@/components/layout/prototype-banner";
import { IS_PROTOTYPE, getHubCities, getLegalPages, getSiteSettings } from "@/lib/content";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, legal, hubs] = await Promise.all([getSiteSettings(), getLegalPages(), getHubCities()]);

  return (
    <NuqsAdapter>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-antracita px-4 py-3 font-display text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      {IS_PROTOTYPE && <PrototypeBanner />}
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter settings={settings} legal={legal} hubs={hubs} />
      <MobileContactBar />
      {/* Espacio para que la barra fija de móvil no tape el pie de página. */}
      <div aria-hidden className="h-20 bg-antracita-900 md:hidden" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
      />
    </NuqsAdapter>
  );
}
