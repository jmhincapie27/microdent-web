"use client";

import { usePathname } from "next/navigation";

export function PreviewExitLink() {
  const pathname = usePathname();
  return (
    <a
      href={`/api/draft-mode/disable?volver=${encodeURIComponent(pathname)}`}
      className="inline-flex min-h-9 items-center rounded-md bg-white px-3 font-semibold text-black hover:bg-glauco-100"
    >
      Salir de la vista previa
    </a>
  );
}
