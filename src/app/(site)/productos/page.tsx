import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { createLoader } from "nuqs/server";
import { MessageCircle } from "lucide-react";
import { catalogParsers } from "@/lib/search-params";
import { queryCatalog } from "@/lib/catalog";
import { getCategories, getLines, getProducts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { CatalogSearchBox } from "@/components/catalog/search-box";
import { ActiveFilters, FilterSheet, FilterSidebar, SortSelect } from "@/components/catalog/filters";
import { ProductCard } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { TrackEvent } from "@/components/analytics/track-event";
import { Button } from "@/components/ui/button";

const loadParams = createLoader(catalogParsers);

export async function generateMetadata({ searchParams }: PageProps<"/productos">): Promise<Metadata> {
  const params = await loadParams(searchParams);
  const categories = await getCategories();
  const onlyOneCategory =
    params.categoria.length === 1 && params.linea.length === 0 && !params.q && params.orden === "relevancia";
  const category = onlyOneCategory ? categories.find((c) => c.slug === params.categoria[0]) : undefined;

  if (category) {
    return buildMetadata({
      title: `${category.title} | Productos`,
      description: `${category.title} Microdent: fotografías, referencias y especificaciones. Consulte con un asesor de su ciudad.`,
      path: `/productos?categoria=${category.slug}`,
    });
  }
  const hasFilters = params.q || params.categoria.length || params.linea.length || params.orden !== "relevancia";
  return buildMetadata({
    title: "Productos",
    description:
      "Catálogo de productos Microdent. Busque por nombre o referencia y filtre por categoría y línea de producto.",
    path: "/productos",
    // Las combinaciones de filtros y búsquedas no se indexan; su canonical es /productos.
    noindex: Boolean(hasFilters),
  });
}

export default function ProductsPage({ searchParams }: PageProps<"/productos">) {
  return (
    <div className="container-page py-8 sm:py-12">
      <header className="max-w-3xl">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Productos</h1>
      </header>
      {/* La búsqueda y los filtros dependen de la URL: se resuelven por solicitud. */}
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-hidden className="mt-6">
      <div className="h-12 max-w-3xl rounded-md bg-surface-alt" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:ml-[288px] xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}

async function Catalog({ searchParams }: Pick<PageProps<"/productos">, "searchParams">) {
  const params = await loadParams(searchParams);
  const [products, categories, lines] = await Promise.all([getProducts(), getCategories(), getLines()]);
  const result = queryCatalog(products, categories, lines, {
    q: params.q,
    categorias: params.categoria,
    lineas: params.linea,
    orden: params.orden,
  });
  const catTitle = new Map(categories.map((c) => [c.id, c.title]));
  const hasFilters = params.categoria.length > 0 || params.linea.length > 0;

  return (
    <>
      <div className="mt-6 max-w-3xl">
        <CatalogSearchBox />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <FilterSidebar facets={result.facets} />

        <section aria-labelledby="resultados">
          <h2 id="resultados" className="sr-only">
            Resultados
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FilterSheet facets={result.facets} total={result.total} />
              <p className="text-sm text-ink-muted" role="status" aria-live="polite" aria-atomic="true">
                <strong className="font-semibold text-ink tabular-nums">{result.total}</strong>{" "}
                {result.total === 1 ? "producto" : "productos"}
                {params.q && (
                  <>
                    {" "}para «<span className="text-ink">{params.q}</span>»
                  </>
                )}
              </p>
            </div>
            <SortSelect />
          </div>

          <div className="mt-4">
            <ActiveFilters facets={result.facets} />
          </div>

          {result.total > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p, i) => (
                <li key={p.id}>
                  <ProductCard
                    product={p}
                    categoryTitle={catTitle.get(p.categoryId)}
                    highlight={p.id === result.exactMatchId ? "Coincidencia exacta" : undefined}
                    priority={i < 4}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState title={params.q ? `No encontramos «${params.q}»` : "No hay productos con estos filtros"}>
                <ul className="space-y-1">
                  {params.q && <li>Revise la referencia o pruebe con una parte del nombre.</li>}
                  {hasFilters && <li>Quite alguno de los filtros activos.</li>}
                </ul>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link href="/productos">Ver todo el catálogo</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/asesores">
                      <MessageCircle aria-hidden />
                      Preguntar a un asesor
                    </Link>
                  </Button>
                </div>
              </EmptyState>
            </div>
          )}
        </section>
      </div>

      {params.q && (
        <TrackEvent
          name="search_products"
          params={{ query: params.q, results_count: result.total, category: params.categoria, line: params.linea }}
        />
      )}
    </>
  );
}
