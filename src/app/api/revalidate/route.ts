import { revalidatePath, revalidateTag } from "next/cache";
import { connection, type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { contentSource } from "@/sanity/env";

/**
 * Webhook de Sanity: al publicar, despublicar o borrar cualquier documento,
 * el sitio completo se marca para actualizarse en la siguiente visita.
 * Configuración en sanity.io/manage → API → Webhooks (ver docs/fase-3-cms.md).
 */
const ALL_TAGS = ["products", "categories", "lines", "advisors", "home", "about", "legal", "settings"];

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Falta SANITY_REVALIDATE_SECRET en Vercel" }, { status: 500 });
  }
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
    if (!isValidSignature) {
      return NextResponse.json({ message: "Firma inválida: el secreto no coincide con el de Vercel" }, { status: 401 });
    }
    // expire: 0 → la siguiente visita ya ve el contenido nuevo (sin servir la versión anterior).
    for (const tag of ALL_TAGS) revalidateTag(tag, { expire: 0 });
    // Además invalida todas las páginas (inicio, catálogo, fichas, asesores, legales…).
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, type: body?._type ?? null, at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

/**
 * Diagnóstico: abrir /api/revalidate en el navegador muestra si la configuración es correcta.
 * No revela ningún secreto.
 */
export async function GET() {
  await connection(); // se calcula en cada visita, no al compilar
  return NextResponse.json({
    origenDelContenido: contentSource === "sanity" ? "sanity (contenido real del panel)" : "prototipo (datos de ejemplo)",
    secretoDelWebhookConfigurado: Boolean(process.env.SANITY_REVALIDATE_SECRET),
    tokenDeVistaPreviaConfigurado: Boolean(process.env.SANITY_API_READ_TOKEN),
    urlDelSitio: process.env.NEXT_PUBLIC_SITE_URL ?? "(sin configurar)",
  });
}
