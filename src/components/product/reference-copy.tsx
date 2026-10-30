"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ReferenceCopy({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <p className="flex items-center gap-2 text-sm text-ink-muted">
      <span>
        Ref. <span className="font-semibold text-ink tabular-nums">{reference}</span>
      </span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* El portapapeles puede no estar disponible; no es crítico. */
          }
        }}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-surface-alt hover:text-ink"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span className="sr-only">{copied ? "Referencia copiada" : "Copiar referencia"}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Referencia copiada" : ""}
      </span>
    </p>
  );
}
