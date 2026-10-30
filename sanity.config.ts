"use client";

/**
 * Configuración del panel de administración (Sanity Studio), servido en /studio.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { esESLocale } from "@sanity/locale-es-es";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, SINGLETONS } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { divipolaTool } from "./src/sanity/plugins/divipola-tool";

const singletons = new Set<string>(SINGLETONS);

export default defineConfig({
  name: "microdent",
  title: "Microdent — Panel de contenido",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Los documentos únicos (Inicio, Nosotros, Ajustes) no aparecen en «Crear nuevo».
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
  document: {
    // En documentos únicos solo se permite publicar, descartar cambios y restaurar.
    actions: (actions, { schemaType }) =>
      singletons.has(schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
    newDocumentOptions: (prev) => prev.filter((item) => !singletons.has(item.templateId) && item.templateId !== "territory"),
  },
  plugins: [
    structureTool({ structure, title: "Contenido" }),
    divipolaTool(),
    visionTool({ defaultApiVersion: apiVersion, title: "Consultas (técnico)" }),
    esESLocale(),
  ],
});
