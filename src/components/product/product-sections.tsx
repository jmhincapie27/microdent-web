import type { ProductSpec, ProductVariant } from "@/lib/content/types";

export function SpecTable({ specs }: { specs: ProductSpec[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">Especificaciones técnicas</caption>
      <tbody>
        {specs.map((s) => (
          <tr key={s.label} className="border-b border-line last:border-0">
            <th scope="row" className="w-2/5 py-3 pr-4 text-left align-top font-medium text-ink-muted">
              {s.label}
            </th>
            <td className="py-3 text-ink">
              {s.value}
              {s.unit && ` ${s.unit}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function VariantTable({ variants }: { variants: ProductVariant[] }) {
  const columns = [...new Set(variants.flatMap((v) => v.attributes.map((a) => a.label)))];
  return (
    <div
      className="overflow-x-auto rounded-md border border-line"
      role="region"
      aria-label="Tabla de variantes (desplazable)"
      tabIndex={0}
    >
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <caption className="sr-only">Variantes disponibles</caption>
        <thead className="bg-surface-alt">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-display text-xs font-semibold tracking-wide uppercase">
              Referencia
            </th>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 text-left font-display text-xs font-semibold tracking-wide uppercase">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.reference} className="border-t border-line">
              <th scope="row" className="px-4 py-3 text-left font-semibold tabular-nums">
                {v.reference}
              </th>
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 text-ink">
                  {v.attributes.find((a) => a.label === c)?.value ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
