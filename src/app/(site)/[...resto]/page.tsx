import { notFound } from "next/navigation";

// Cualquier ruta inexistente muestra el 404 con encabezado y pie del sitio.
export default function CatchAll() {
  notFound();
}
