import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-ink-muted">
        {items.map((it, i) => (
          <li key={it.name} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-4 text-ink-subtle" aria-hidden />}
            {it.href ? (
              <Link href={it.href} className="inline-flex min-h-9 items-center hover:text-ink hover:underline">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
