"use client";

import { Download, FileText } from "lucide-react";
import type { DocumentType, ProductDocument } from "@/lib/content/types";
import { track } from "@/lib/analytics";

const TYPE_LABEL: Record<DocumentType, string> = {
  "ficha-tecnica": "Ficha técnica",
  ifu: "Instrucciones de uso",
  catalogo: "Catálogo",
  certificado: "Certificado",
  otro: "Documento",
};

const LANG: Record<ProductDocument["language"], string> = { es: "Español", en: "Inglés", otro: "Otro idioma" };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("es-CO", { maximumFractionDigits: 1 })} MB`;
}

export function DocumentList({ documents, productRef }: { documents: ProductDocument[]; productRef: string }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {documents.map((d) => (
        <li key={d.id}>
          <a
            href={d.url}
            target="_blank"
            rel="noopener"
            onClick={() =>
              track("file_download", { document_type: d.type, product_ref: productRef, file_name: d.url.split("/").pop() ?? d.url })
            }
            className="flex min-h-16 items-center gap-4 rounded-lg border border-line bg-white p-4 hover:border-antracita"
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-glauco-100 text-ink">
              <FileText className="size-5" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink">{d.title}</span>
              <span className="block text-xs text-ink-muted">
                {TYPE_LABEL[d.type]} · PDF, {formatSize(d.size)} · {LANG[d.language]}
                {d.version && ` · ${d.version}`}
              </span>
            </span>
            <Download className="size-5 shrink-0 text-ink-muted" aria-hidden />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
