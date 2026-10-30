import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createLoader } from "nuqs/server";
import { Building2, Globe, MapPin, X } from "lucide-react";
import { advisorParsers } from "@/lib/search-params";
import { IS_PROTOTYPE, getAdvisorsAndCoverages, getHubCities, getProductBySlug, getSiteSettings } from "@/lib/content";
import {
  OUTSIDE_COLOMBIA,
  departments,
  getDepartment,
  getMunicipalitiesByDepartment,
  getMunicipality,
} from "@/lib/territories";
import { resolveCoverage, type CoveredAdvisor } from "@/lib/coverage";
import { buildWhatsAppLink, fillTemplate } from "@/lib/whatsapp";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { RememberLocation, TerritoryPicker } from "@/components/advisors/territory-picker";
import { WhatsAppButton } from "@/components/advisors/whatsapp-button";
import { TrackEvent } from "@/components/analytics/track-event";
import type { FallbackContact } from "@/lib/content/types";

const loadParams = createLoader(advisorParsers);

export async function generateMetadata({ searchParams }: PageProps<"/asesores">): Promise<Metadata> {
  const p = await loadParams(searchParams);
  return buildMetadata({
    title: "Asesores comerciales",
    description:
      "Encuentre al asesor comercial Microdent de su ciudad y escríbale por WhatsApp. Atención en Medellín, Eje Cafetero, Bogotá, Cali, Costa, Neiva, Santander, Ibagué, Quibdó y Cúcuta.",
    path: "/asesores",
    noindex: Boolean(p.departamento || p.municipio || p.producto),
  });
}

export default function AdvisorsPage({ searchParams }: PageProps<"/asesores">) {
  return (
    <div className="container-page py-8 sm:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Asesoría comercial</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Encuentre a su asesor</h1>
        <p className="mt-3 text-ink-muted">
          Elija su departamento y municipio. Le mostraremos los asesores que atienden su zona para que les
          escriba por WhatsApp. No necesitamos su ubicación.
        </p>
      </header>
      <Suspense fallback={<div aria-hidden className="mt-6 h-36 max-w-3xl rounded-lg bg-surface-alt" />}>
        <Locator searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Locator({ searchParams }: Pick<PageProps<"/asesores">, "searchParams">) {
  const params = await loadParams(searchParams);
  const [settings, { advisors, coverages }, hubs, product] = await Promise.all([
    getSiteSettings(),
    getAdvisorsAndCoverages(),
    getHubCities(),
    params.producto ? getProductBySlug(params.producto) : Promise.resolve(undefined),
  ]);

  const outside = params.departamento === OUTSIDE_COLOMBIA;
  const department = getDepartment(params.departamento);
  const municipality = getMunicipality(params.municipio);
  const validSelection = municipality && department && municipality.departmentCode === department.code;

  const result = validSelection
    ? resolveCoverage({
        municipalityCode: municipality.code,
        departmentCode: department.code,
        advisors,
        coverages,
        fallback: settings.fallbackContact,
      })
    : outside
      ? { local: [], regional: [], fallback: settings.fallbackContact }
      : undefined;

  const placeLabel = outside
    ? "fuera de Colombia"
    : validSelection
      ? `${municipality.name} (${department.name})`
      : "";

  const message = (name: string) =>
    fillTemplate(product ? settings.whatsappTemplates.product : settings.whatsappTemplates.general, {
      asesor: name,
      municipio: placeLabel,
      producto: product?.name,
      referencia: product?.reference,
      url: product ? absoluteUrl(`/productos/${product.slug}`) : undefined,
    });

  const source = product ? "ficha" : "localizador";
  const removeProductHref = (() => {
    const sp = new URLSearchParams();
    if (params.departamento) sp.set("departamento", params.departamento);
    if (params.municipio) sp.set("municipio", params.municipio);
    const qs = sp.toString();
    return qs ? `/asesores?${qs}` : "/asesores";
  })();

  const total = result ? result.local.length + result.regional.length : 0;

  return (
    <>
      {product && (
        <div className="mt-6 flex max-w-3xl items-center gap-3 rounded-lg border border-glauco bg-glauco-50 p-3 pl-4">
          <div className="flex-1 text-sm">
            <span className="text-ink-muted">Consultando: </span>
            <Link href={`/productos/${product.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
              {product.name}
            </Link>{" "}
            <span className="text-ink-muted tabular-nums">· Ref. {product.reference}</span>
          </div>
          <Link
            href={removeProductHref}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-ink"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Quitar el producto de la consulta</span>
          </Link>
        </div>
      )}

      <div className="mt-6 max-w-3xl rounded-lg border border-line bg-white p-4 sm:p-6">
        <TerritoryPicker
          departments={departments}
          municipalities={department ? getMunicipalitiesByDepartment(department.code) : []}
          departamento={params.departamento}
          municipio={validSelection ? municipality.code : ""}
          producto={product ? product.slug : ""}
        />
      </div>

      <section aria-labelledby="resultados-asesores" className="mt-10" aria-live="polite">
        <h2 id="resultados-asesores" className="sr-only">
          Resultados
        </h2>

        {!result && (
          <div className="max-w-3xl rounded-lg bg-glauco-50 p-6">
            <p className="flex items-center gap-2 font-display font-semibold">
              <MapPin className="size-5" aria-hidden /> Tenemos presencia en
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {hubs.map((h) => (
                <li key={h} className="rounded-full border border-glauco bg-white px-3 py-1 text-sm">
                  {h}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-muted">
              Si su municipio está cerca de una de estas zonas, lo atiende el equipo de la sede más cercana.
            </p>
          </div>
        )}

        {result && total > 0 && validSelection && (
          <>
            {result.local.length > 0 && (
              <AdvisorGroup
                title={`Asesores en ${municipality.name}`}
                items={result.local}
                message={message}
                municipalityCode={municipality.code}
                productRef={product?.reference}
                source={source}
              />
            )}
            {result.regional.length > 0 && (
              <AdvisorGroup
                title={
                  result.local.length > 0
                    ? `También atienden ${department.name}`
                    : `Asesores que atienden ${municipality.name}`
                }
                items={result.regional}
                message={message}
                municipalityCode={municipality.code}
                productRef={product?.reference}
                source={source}
              />
            )}
          </>
        )}

        {result?.fallback && (
          <FallbackCard
            contact={result.fallback}
            place={outside ? "fuera de Colombia" : (municipality?.name ?? "")}
            outside={outside}
            href={buildWhatsAppLink(result.fallback.whatsapp, message(result.fallback.name), { safeMode: IS_PROTOTYPE })}
            municipalityCode={outside ? OUTSIDE_COLOMBIA : (municipality?.code ?? "")}
            productRef={product?.reference}
            source={source}
          />
        )}

        {IS_PROTOTYPE && result && (
          <p className="mt-6 max-w-3xl text-xs text-ink-subtle">
            Prototipo: los asesores son ficticios y el botón abre WhatsApp sin destinatario, solo con el mensaje
            prellenado, para que pueda revisar el texto.
          </p>
        )}
      </section>

      {result && (
        <TrackEvent
          name="advisor_search"
          params={{
            department_code: params.departamento,
            municipality_code: outside ? OUTSIDE_COLOMBIA : (municipality?.code ?? ""),
            results_count: total,
            coverage_level: result.fallback ? "fallback" : result.local.length > 0 ? "municipality" : "department",
          }}
        />
      )}
      {validSelection && (
        <RememberLocation
          departamento={department.code}
          municipio={municipality.code}
          label={`${municipality.name}, ${department.name}`}
        />
      )}
    </>
  );
}

function AdvisorGroup({
  title,
  items,
  message,
  municipalityCode,
  productRef,
  source,
}: {
  title: string;
  items: CoveredAdvisor[];
  message: (name: string) => string;
  municipalityCode: string;
  productRef?: string;
  source: "localizador" | "ficha";
}) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold sm:text-xl">
        {title} <span className="font-normal text-ink-muted">({items.length})</span>
      </h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ advisor, zoneName, hubCity }) => (
          <li key={advisor.id} className="flex flex-col rounded-lg border border-line bg-white p-5">
            <div className="flex items-center gap-4">
              {advisor.photo ? (
                <Image
                  src={advisor.photo.src}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-glauco-100 font-display text-lg font-semibold text-ink"
                >
                  {advisor.publicName
                    .split(" ")
                    .filter((w) => /^[A-ZÁÉÍÓÚÑ0-9]/.test(w))
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
              )}
              <div>
                <p className="font-display font-semibold">{advisor.publicName}</p>
                <p className="text-sm text-ink-muted">{advisor.role}</p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="size-4 shrink-0" aria-hidden />
              Zona {zoneName} · sede {hubCity}
            </p>
            <div className="mt-5 pt-1">
              <WhatsAppButton
                href={buildWhatsAppLink(advisor.whatsapp, message(advisor.publicName), { safeMode: IS_PROTOTYPE })}
                advisorName={advisor.publicName}
                tracking={{ advisor_id: advisor.id, municipality_code: municipalityCode, product_ref: productRef, source }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FallbackCard({
  contact,
  place,
  outside,
  href,
  municipalityCode,
  productRef,
  source,
}: {
  contact: FallbackContact;
  place: string;
  outside: boolean;
  href: string;
  municipalityCode: string;
  productRef?: string;
  source: "localizador" | "ficha";
}) {
  return (
    <div className="max-w-xl rounded-lg border border-line bg-white p-6">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-glauco-100 text-ink">
        {outside ? <Globe className="size-6" aria-hidden /> : <Building2 className="size-6" aria-hidden />}
      </span>
      <h3 className="mt-4 text-lg font-semibold">
        {outside ? "Atención internacional" : `Aún no tenemos asesor asignado en ${place}`}
      </h3>
      <p className="mt-2 text-sm text-ink-muted">
        Le atiende directamente la <strong className="font-semibold text-ink">{contact.name}</strong>
        {outside ? "." : " y le pondrá en contacto con el equipo más cercano."}
      </p>
      <div className="mt-5">
        <WhatsAppButton
          href={href}
          advisorName={contact.name}
          tracking={{ advisor_id: "direccion-comercial", municipality_code: municipalityCode, product_ref: productRef, source }}
        />
      </div>
    </div>
  );
}
