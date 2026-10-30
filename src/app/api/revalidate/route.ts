import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Webhook de Sanity: al publicar o despublicar, invalida solo el contenido afectado.
 * Configuración en sanity.io/manage → API → Webhooks (ver docs/fase-3-cms.md).
 */
const TAGS_BY_TYPE: Record<string, string[]> = {
  product: ["products"],
  productCategory: ["categories", "products"],
  productLine: ["lines", "products"],
  productDocument: ["products"],
  advisor: ["advisors"],
  advisorCoverage: ["advisors"],
  territory: ["advisors"],
  homePage: ["home"],
  aboutPage: ["about"],
  legalPage: ["legal"],
  siteSettings: ["settings"],
};

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Falta SANITY_REVALIDATE_SECRET" }, { status: 500 });
  }
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
    if (!isValidSignature) {
      return NextResponse.json({ message: "Firma inválida" }, { status: 401 });
    }
    const tags = body?._type ? TAGS_BY_TYPE[body._type] : undefined;
    if (!tags) {
      return NextResponse.json({ message: "Tipo sin etiquetas", type: body?._type }, { status: 400 });
    }
    // expire: 0 → la siguiente visita ya ve el contenido nuevo (sin servir la versión anterior).
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: tags });
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
