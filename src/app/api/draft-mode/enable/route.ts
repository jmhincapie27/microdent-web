import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { previewClient } from "@/sanity/client";

/**
 * Activa la vista previa de borradores. Lo llama el panel (pestaña «Presentación»),
 * que firma la solicitud: nadie más puede activarla.
 */
export const { GET } = defineEnableDraftMode({ client: previewClient });
