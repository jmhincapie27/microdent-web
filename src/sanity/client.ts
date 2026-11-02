import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Cliente de solo lectura del contenido publicado (sin borradores).
 * Sin CDN de Sanity: el sitio ya guarda en caché cada consulta y la refresca con el webhook.
 * Con CDN, al publicar podía leerse la copia anterior y quedar guardada hasta 1 hora.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

/**
 * Token de lectura (rol Viewer) para la vista previa de borradores.
 * Solo existe en el servidor; nunca se envía al navegador.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN;

/** Cliente de vista previa: lee borradores por encima de lo publicado, sin CDN. */
export const previewClient = sanityClient.withConfig({
  token: readToken,
  useCdn: false,
  perspective: "drafts",
});
