import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript, productJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ReferenceCopy } from "@/components/product/reference-copy";
import { SpecTable, VariantTable } from "@/components/product/product-sections";
import { DocumentList } from "@/components/product/document-list";
import { ProductCard } from "@/components/catalog/product-card";
import { TrackEvent } from "@/components/analytics/track-event";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return buildMetadata({
    title: p.seo?.title ?? `${p.name} (Ref. ${p.reference})`,
    description: p.seo?.description ?? p.shortDescription,
    path: `/productos/${p.slug}`,
    image: p.images[0],
  });
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10">
      <h2 id={id} className="mb-6 text-xl font-semibold sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ProductPage({ params }: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const contactUrl = `/asesores?producto=${encodeURIComponent(p.slug)}`;
  const crumbs = [
    { name: "Inicio", path: "/" },
    { name: "Productos", path: "/productos" },
    { name: p.category.title, path: `/productos?categoria=${p.category.slug}` },
    { name: p.name, path: `/productos/${p.slug}` },
  ];

  return (
    <article className="container-page py-6 sm:py-10">
      <Breadcrumbs items={crumbs.map((c, i) => ({ name: c.name, href: i < crumbs.length - 1 ? c.path : undefined }))} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={p.images} productName={p.name} />

        <div className="flex flex-col">
          <p className="eyebrow">
            {p.category.title}
            {p.line && <> · {p.line.title}</>}
          </p>
          <h1 className="mt-2 text-2xl leading-tight font-bold sm:text-4xl">{p.name}</h1>
          <div className="mt-2">
            <ReferenceCopy reference={p.reference} />
          </div>
          {p.isMock && (
            <p className="mt-3 w-fit rounded-sm bg-glauco px-2 py-1 text-xs font-semibold text-black">
              Producto de ejemplo — datos ficticios
            </p>
          )}

          <p className="mt-5 text-base leading-relaxed text-ink-muted">{p.shortDescription}</p>

          {p.features.length > 0 && (
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f.text} className="flex gap-3 text-sm text-ink">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-antracita" />
                  {f.text}
                </li>
              ))}
            </ul>
          )}

          {p.regulatory?.sanitaryRegistration && (
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
              <ShieldCheck className="size-4" aria-hidden />
              Registro sanitario INVIMA: <span className="text-ink">{p.regulatory.sanitaryRegistration}</span>
            </p>
          )}

          <div className="mt-8 hidden md:block">
            <Button asChild size="lg">
              <Link href={contactUrl}>
                <MessageCircle aria-hidden />
                Consultar con un asesor
              </Link>
            </Button>
            <p className="mt-2 text-xs text-ink-subtle">
              Le mostraremos los asesores de su ciudad. El mensaje incluirá este producto y su referencia.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        {p.specs.length > 0 && (
          <Section id="especificaciones" title="Especificaciones técnicas">
            <div className="max-w-2xl">
              <SpecTable specs={p.specs} />
            </div>
          </Section>
        )}

        {p.variants.length > 0 && (
          <Section id="variantes" title={`Variantes (${p.variants.length})`}>
            <VariantTable variants={p.variants} />
          </Section>
        )}

        {p.documents.length > 0 && (
          <Section id="documentos" title="Documentos">
            <DocumentList documents={p.documents} productRef={p.reference} />
          </Section>
        )}

        {p.related.length > 0 && (
          <Section id="relacionados" title="Productos relacionados">
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {p.related.map((r) => (
                <li key={r.id}>
                  <ProductCard product={r} />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <TrackEvent
        name="view_item"
        params={{ product_ref: p.reference, product_slug: p.slug, category: p.category.slug, line: p.line?.slug }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([productJsonLd(p), breadcrumbJsonLd(crumbs)]) }}
      />
    </article>
  );
}
