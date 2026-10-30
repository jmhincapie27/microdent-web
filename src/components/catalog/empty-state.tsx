import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  children,
  icon,
}: {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-antracita/30 bg-glauco-50 px-6 py-14 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-white text-ink-muted">
        {icon ?? <SearchX className="size-7" aria-hidden />}
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {children && <div className="mt-3 max-w-md text-sm text-ink-muted">{children}</div>}
    </div>
  );
}
