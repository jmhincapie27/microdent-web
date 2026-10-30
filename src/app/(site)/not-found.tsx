import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">No encontramos esta página</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        Es posible que el producto ya no esté disponible o que el enlace haya cambiado.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/productos">Ir al catálogo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
