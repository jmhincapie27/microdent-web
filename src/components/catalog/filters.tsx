"use client";

import { useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { catalogParsers } from "@/lib/search-params";
import { SORT_OPTIONS, type SortValue } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface Facets {
  categories: { slug: string; title: string; count: number }[];
  lines: { slug: string; title: string; count: number }[];
}

function useCatalogParams() {
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useQueryStates(catalogParsers, { shallow: false, startTransition, scroll: false });
  return { params, setParams, isPending };
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FacetGroup({
  legend,
  name,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  name: string;
  options: Facets["categories"];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0 last:border-0">
      <legend className="eyebrow mb-3">{legend}</legend>
      <ul className="space-y-1">
        {options.map((o) => {
          const checked = selected.includes(o.slug);
          const disabled = o.count === 0 && !checked;
          return (
            <li key={o.slug}>
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-surface-alt",
                  disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
                )}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={o.slug}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(o.slug)}
                  className="size-5 shrink-0 cursor-pointer rounded-sm accent-antracita disabled:cursor-not-allowed"
                />
                <span className="flex-1 text-ink">{o.title}</span>
                <span className="text-xs text-ink-subtle tabular-nums" aria-label={`${o.count} productos`}>
                  {o.count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function FilterGroups({ facets }: { facets: Facets }) {
  const { params, setParams } = useCatalogParams();
  return (
    <div>
      <FacetGroup
        legend="Categoría"
        name="categoria"
        options={facets.categories}
        selected={params.categoria}
        onToggle={(s) => setParams({ categoria: toggle(params.categoria, s) })}
      />
      <FacetGroup
        legend="Línea de producto"
        name="linea"
        options={facets.lines}
        selected={params.linea}
        onToggle={(s) => setParams({ linea: toggle(params.linea, s) })}
      />
    </div>
  );
}

/** Columna lateral de filtros (escritorio). */
export function FilterSidebar({ facets }: { facets: Facets }) {
  return (
    <aside aria-label="Filtros" className="hidden lg:block">
      <h2 className="sr-only">Filtros</h2>
      <FilterGroups facets={facets} />
    </aside>
  );
}

/** Botón + panel desplegable de filtros (móvil y tablet). */
export function FilterSheet({ facets, total }: { facets: Facets; total: number }) {
  const { params } = useCatalogParams();
  const active = params.categoria.length + params.linea.length;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal aria-hidden />
          Filtros{active > 0 && ` (${active})`}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterGroups facets={facets} />
        </div>
        <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SheetClose asChild>
            <Button size="lg" className="w-full">
              Ver {total} {total === 1 ? "resultado" : "resultados"}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SortSelect() {
  const { params, setParams } = useCatalogParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-muted">Ordenar</span>
      <select
        value={params.orden}
        onChange={(e) => setParams({ orden: e.target.value as SortValue })}
        className="h-11 cursor-pointer rounded-md border border-antracita/40 bg-white pr-8 pl-3 text-sm text-ink hover:border-antracita"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Chips de filtros activos con opción de quitar cada uno o todos. */
export function ActiveFilters({ facets }: { facets: Facets }) {
  const { params, setParams } = useCatalogParams();
  const chips = [
    ...params.categoria.map((slug) => ({
      key: `c-${slug}`,
      label: facets.categories.find((c) => c.slug === slug)?.title ?? slug,
      remove: () => setParams({ categoria: params.categoria.filter((s) => s !== slug) }),
    })),
    ...params.linea.map((slug) => ({
      key: `l-${slug}`,
      label: facets.lines.find((l) => l.slug === slug)?.title ?? slug,
      remove: () => setParams({ linea: params.linea.filter((s) => s !== slug) }),
    })),
  ];
  if (chips.length === 0 && !params.q) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-glauco bg-glauco-100 py-1 pr-2 pl-3 text-sm text-ink hover:border-antracita"
        >
          {c.label}
          <X className="size-4" aria-hidden />
          <span className="sr-only">Quitar filtro</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setParams({ categoria: null, linea: null, q: null })}
        className="min-h-9 cursor-pointer px-2 text-sm text-ink underline decoration-glauco decoration-2 underline-offset-4 hover:decoration-antracita"
      >
        Limpiar todo
      </button>
    </div>
  );
}
