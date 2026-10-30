"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import type { Department, Municipality } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OUTSIDE = "EXT";
const STORAGE_KEY = "microdent:ubicacion";

interface SavedLocation {
  departamento: string;
  municipio: string;
  label: string;
}

function readSavedLocation(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // almacenamiento no disponible (modo privado, bloqueado)
  }
}

function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function buildUrl(dep: string, mun: string, producto: string) {
  const sp = new URLSearchParams();
  if (dep) sp.set("departamento", dep);
  if (mun) sp.set("municipio", mun);
  if (producto) sp.set("producto", producto);
  const qs = sp.toString();
  return qs ? `/asesores?${qs}` : "/asesores";
}

/**
 * Selector de departamento y municipio (códigos DIVIPOLA).
 * Es un formulario GET normal: funciona sin JavaScript. Con JavaScript,
 * cada cambio actualiza la URL y los resultados sin recargar la página.
 */
export function TerritoryPicker({
  departments,
  municipalities,
  departamento,
  municipio,
  producto,
  compact = false,
  navigation = "replace",
}: {
  departments: Department[];
  municipalities: Municipality[];
  departamento: string;
  municipio: string;
  producto: string;
  compact?: boolean;
  /** "push" cuando el selector está fuera de /asesores (p. ej. en el inicio). */
  navigation?: "replace" | "push";
}) {
  const router = useRouter();
  const depId = useId();
  const munId = useId();
  const [isPending, startTransition] = useTransition();
  const [dep, setDep] = useState(departamento);
  // Si la URL cambia desde fuera (Atrás/Adelante), sincronizar el selector.
  const [prevDepartamento, setPrevDepartamento] = useState(departamento);
  if (departamento !== prevDepartamento) {
    setPrevDepartamento(departamento);
    setDep(departamento);
  }

  const savedRaw = useSyncExternalStore(subscribeStorage, readSavedLocation, () => null);
  const saved = useMemo<SavedLocation | null>(() => {
    if (!savedRaw || departamento || municipio) return null;
    try {
      return JSON.parse(savedRaw) as SavedLocation;
    } catch {
      return null;
    }
  }, [savedRaw, departamento, municipio]);

  const go = (url: string) =>
    startTransition(() => (navigation === "push" ? router.push(url) : router.replace(url, { scroll: false })));
  const loadingMunicipalities = isPending && dep !== departamento;
  const munDisabled = !dep || dep === OUTSIDE || dep !== departamento;

  return (
    <div>
      <form
        method="get"
        action="/asesores"
        className={cn("grid gap-4", compact ? "sm:grid-cols-[1fr_1fr_auto]" : "md:grid-cols-[1fr_1fr_auto]")}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          go(buildUrl(String(fd.get("departamento") ?? ""), String(fd.get("municipio") ?? ""), producto));
        }}
      >
        {producto && <input type="hidden" name="producto" value={producto} />}
        <div>
          <label htmlFor={depId} className="mb-1.5 block text-sm font-medium text-ink">
            Departamento
          </label>
          <select
            id={depId}
            name="departamento"
            value={dep}
            onChange={(e) => {
              setDep(e.target.value);
              go(buildUrl(e.target.value, "", producto));
            }}
            className="h-12 w-full cursor-pointer rounded-md border border-antracita/40 bg-white px-3 text-base text-ink hover:border-antracita"
          >
            <option value="">Seleccione…</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
            <option value={OUTSIDE}>Estoy fuera de Colombia</option>
          </select>
        </div>

        <div>
          <label htmlFor={munId} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
            Municipio
            {loadingMunicipalities && <Loader2 className="size-4 animate-spin" aria-label="Cargando municipios" />}
          </label>
          <select
            id={munId}
            name="municipio"
            value={munDisabled ? "" : municipio}
            disabled={munDisabled}
            onChange={(e) => go(buildUrl(dep, e.target.value, producto))}
            className="h-12 w-full cursor-pointer rounded-md border border-antracita/40 bg-white px-3 text-base text-ink hover:border-antracita disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-subtle"
          >
            <option value="">
              {dep === OUTSIDE ? "No aplica" : dep ? "Seleccione…" : "Primero elija el departamento"}
            </option>
            {!munDisabled &&
              municipalities.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-end">
          {/* Sin JavaScript, este botón envía el formulario. Con JavaScript, los resultados se actualizan solos. */}
          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <MapPin aria-hidden />}
            Ver asesores
          </Button>
        </div>
      </form>

      {saved && !departamento && (
        <p className="mt-4 text-sm text-ink-muted">
          <button
            type="button"
            onClick={() => go(buildUrl(saved.departamento, saved.municipio, producto))}
            className="cursor-pointer text-ink underline decoration-glauco decoration-2 underline-offset-4 hover:decoration-antracita"
          >
            Usar mi última ubicación: {saved.label}
          </button>
        </p>
      )}
    </div>
  );
}

/** Guarda la última ubicación consultada, solo en el navegador del visitante. */
export function RememberLocation({ departamento, municipio, label }: SavedLocation) {
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ departamento, municipio, label }));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [departamento, municipio, label]);
  return null;
}
