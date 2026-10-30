"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { debounce, defaultRateLimit, useQueryState } from "nuqs";
import { catalogParsers } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "Buscar por nombre o referencia";

/**
 * Buscador del catálogo. Actualiza ?q= en la URL con 300 ms de espera,
 * así los resultados se pueden compartir y el botón Atrás funciona.
 */
export function CatalogSearchBox({ className }: { className?: string }) {
  const id = useId();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useQueryState(
    "q",
    catalogParsers.q.withOptions({ shallow: false, startTransition, limitUrlUpdates: debounce(300) }),
  );
  const [value, setValue] = useState(q);
  const [prevQ, setPrevQ] = useState(q);

  // Si ?q= cambia desde fuera (Atrás, "Limpiar todo"), sincronizar el campo.
  if (q !== prevQ) {
    setPrevQ(q);
    if (q !== value.trim()) setValue(q);
  }

  const update = (next: string) => {
    setValue(next);
    void setQ(next.trim() || null);
  };

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        void setQ(value.trim() || null, { limitUrlUpdates: defaultRateLimit });
      }}
    >
      <label htmlFor={id} className="sr-only">
        {PLACEHOLDER}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder={PLACEHOLDER}
        className="h-12 w-full rounded-md border border-antracita/40 bg-white pr-12 pl-12 text-base text-ink placeholder:text-ink-subtle hover:border-antracita [&::-webkit-search-cancel-button]:hidden"
      />
      {isPending ? (
        <Loader2 className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-ink-muted" aria-label="Buscando" />
      ) : (
        value && (
          <button
            type="button"
            onClick={() => update("")}
            className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:text-ink"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Borrar búsqueda</span>
          </button>
        )
      )}
    </form>
  );
}

/** Buscador del inicio: envía a /productos?q=… (funciona también sin JavaScript). */
export function HeroSearchBox() {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState("");
  return (
    <form
      role="search"
      action="/productos"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
      }}
      className="flex w-full flex-col gap-2 sm:flex-row"
    >
      <label htmlFor={id} className="sr-only">
        {PLACEHOLDER}
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          id={id}
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDER}
          className="h-14 w-full rounded-md border border-antracita/40 bg-white pr-4 pl-12 text-base text-ink shadow-sm placeholder:text-ink-subtle hover:border-antracita"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-14 cursor-pointer items-center justify-center rounded-md bg-antracita px-7 font-display text-base font-semibold text-white hover:bg-antracita-900"
      >
        Buscar
      </button>
    </form>
  );
}
