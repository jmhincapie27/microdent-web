/** Aviso visible en todas las páginas mientras se usan datos ficticios. */
export function PrototypeBanner() {
  return (
    <aside aria-label="Aviso de prototipo" className="bg-glauco text-black">
      <p className="container-page py-2 text-center text-xs font-medium sm:text-sm">
        <strong className="font-semibold">Prototipo:</strong> los productos, especificaciones y asesores
        son datos de ejemplo. Solo las fotografías y el logotipo son reales.
      </p>
    </aside>
  );
}
