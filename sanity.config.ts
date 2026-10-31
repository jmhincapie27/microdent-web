"use client";

/**
 * Configuración del panel de administración (Sanity Studio), servido en /studio.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { defineLocations, presentationTool } from "sanity/presentation";
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
    // Vista previa: muestra el sitio con los borradores junto al formulario de edición.
    presentationTool({
      title: "Vista previa",
      previewUrl: { initial: "/", previewMode: { enable: "/api/draft-mode/enable" } },
      resolve: {
        locations: {
          product: defineLocations({
            select: { title: "name", slug: "slug.current" },
            resolve: (doc) => ({ locations: doc?.slug ? [{ title: doc.title ?? "Producto", href: `/productos/${doc.slug}` }] : [] }),
          }),
          homePage: defineLocations({ locations: [{ title: "Inicio", href: "/" }] }),
          aboutPage: defineLocations({ locations: [{ title: "Nosotros", href: "/nosotros" }] }),
          legalPage: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({ locations: doc?.slug ? [{ title: doc.title ?? "Página legal", href: `/legal/${doc.slug}` }] : [] }),
          }),
          productCategory: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({ locations: doc?.slug ? [{ title: doc.title ?? "Categoría", href: `/productos?categoria=${doc.slug}` }] : [] }),
          }),
          advisorCoverage: defineLocations({ locations: [{ title: "Asesores", href: "/asesores" }] }),
        },
      },
    }),
    divipolaTool(),
    visionTool({ defaultApiVersion: apiVersion, title: "Consultas (técnico)" }),
    esESLocale(),
  ],
});
