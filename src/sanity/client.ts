import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/** Cliente de solo lectura del contenido publicado (sin borradores). */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
