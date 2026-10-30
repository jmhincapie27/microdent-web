import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentPdfIcon } from "@sanity/icons/DocumentPdf";
import { PackageIcon } from "@sanity/icons/Package";
import { TagIcon } from "@sanity/icons/Tag";
import { ThListIcon } from "@sanity/icons/ThList";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { apiVersion } from "../env";
import { activeField, imageWithAlt } from "./shared";

export const productCategory = defineType({
  name: "productCategory",
  title: "Categoría",
  type: "document",
  icon: TagIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({ name: "title", title: "Nombre", type: "string", validation: (r) => r.required().max(60) }),
    defineField({
      name: "slug",
      title: "Identificador en la URL",
      description: "Se genera desde el nombre. Ej.: implantes → /productos?categoria=implantes",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "Descripción breve", type: "text", rows: 2, validation: (r) => r.max(200) }),
    imageWithAlt("image", "Imagen"),
    defineField({ name: "featured", title: "Destacar en el inicio", type: "boolean", initialValue: false }),
    activeField,
    orderRankField({ type: "productCategory" }),
  ],
  preview: { select: { title: "title", media: "image", active: "active" }, prepare: ({ title, media, active }) => ({ title, media, subtitle: active === false ? "Inactiva" : undefined }) },
});

export const productLine = defineType({
  name: "productLine",
  title: "Línea de producto",
  type: "document",
  icon: ThListIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({ name: "title", title: "Nombre", type: "string", validation: (r) => r.required().max(60) }),
    defineField({
      name: "slug",
      title: "Identificador en la URL",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "Descripción breve", type: "text", rows: 2, validation: (r) => r.max(200) }),
    activeField,
    orderRankField({ type: "productLine" }),
  ],
  preview: { select: { title: "title", active: "active" }, prepare: ({ title, active }) => ({ title, subtitle: active === false ? "Inactiva" : undefined }) },
});

export const productDocument = defineType({
  name: "productDocument",
  title: "Documento",
  type: "document",
  icon: DocumentPdfIcon,
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "type",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Ficha técnica", value: "ficha-tecnica" },
          { title: "Instrucciones de uso (IFU)", value: "ifu" },
          { title: "Catálogo", value: "catalogo" },
          { title: "Certificado", value: "certificado" },
          { title: "Otro", value: "otro" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "file",
      title: "Archivo PDF",
      type: "file",
      options: { accept: "application/pdf" },
      validation: (r) => r.required().error("Suba el archivo PDF."),
    }),
    defineField({
      name: "language",
      title: "Idioma",
      type: "string",
      options: { list: [{ title: "Español", value: "es" }, { title: "Inglés", value: "en" }, { title: "Otro", value: "otro" }], layout: "radio" },
      initialValue: "es",
    }),
    defineField({ name: "version", title: "Versión", type: "string", description: "Opcional. Ej.: Rev. 03 — 2026" }),
    activeField,
  ],
  preview: { select: { title: "title", subtitle: "type" } },
});

export const product = defineType({
  name: "product",
  title: "Producto",
  type: "document",
  icon: PackageIcon,
  orderings: [orderRankOrdering, { title: "Referencia", name: "ref", by: [{ field: "reference", direction: "asc" }] }],
  groups: [
    { name: "basico", title: "Básico", default: true },
    { name: "tecnico", title: "Información técnica" },
    { name: "relaciones", title: "Documentos y relacionados" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "name", title: "Nombre", type: "string", group: "basico", validation: (r) => r.required().max(90) }),
    defineField({
      name: "reference",
      title: "Referencia",
      description: "Código único del producto. Mayúsculas, números, guiones o puntos.",
      type: "string",
      group: "basico",
      validation: (r) =>
        r
          .required()
          .regex(/^[A-Z0-9][A-Z0-9.\-/]*$/, { name: "referencia" })
          .error("Use solo MAYÚSCULAS, números, guiones (-), puntos o barras, sin espacios.")
          .custom(async (value, context) => {
            if (!value) return true;
            const id = (context.document?._id ?? "").replace(/^drafts\./, "");
            const client = context.getClient({ apiVersion });
            const count = await client.fetch<number>(
              `count(*[_type == "product" && reference == $ref && !(_id in [$id, "drafts." + $id])])`,
              { ref: value, id },
            );
            return count === 0 ? true : "Ya existe otro producto con esta referencia.";
          }),
    }),
    defineField({
      name: "slug",
      title: "Identificador en la URL",
      description: "Pulse «Generate». Se arma con el nombre y la referencia.",
      type: "slug",
      group: "basico",
      options: {
        source: (doc) => `${(doc as { name?: string }).name ?? ""} ${(doc as { reference?: string }).reference ?? ""}`,
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      to: [{ type: "productCategory" }],
      group: "basico",
      validation: (r) => r.required(),
    }),
    defineField({ name: "line", title: "Línea de producto", type: "reference", to: [{ type: "productLine" }], group: "basico" }),
    defineField({
      name: "images",
      title: "Fotografías",
      description: "La primera es la principal. Suba las fotos originales; el sitio no las recorta ni modifica.",
      type: "array",
      group: "basico",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: false },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
              validation: (r) => r.required().error("El texto alternativo es obligatorio."),
            }),
          ],
        }),
      ],
      validation: (r) => r.min(1).error("Agregue al menos una fotografía."),
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta",
      type: "text",
      rows: 3,
      group: "basico",
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: "features",
      title: "Características verificadas",
      description: "Solo datos respaldados por documentación oficial. Indique la fuente de cada uno (no se muestra en el sitio).",
      type: "array",
      group: "tecnico",
      of: [
        defineArrayMember({
          type: "object",
          name: "feature",
          fields: [
            defineField({ name: "text", title: "Característica", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "source",
              title: "Fuente (uso interno)",
              description: "Ej.: Ficha técnica Rev. 03, pág. 2",
              type: "string",
              validation: (r) => r.required().error("Indique la fuente que respalda este dato."),
            }),
          ],
          preview: { select: { title: "text", subtitle: "source" } },
        }),
      ],
    }),
    defineField({
      name: "specs",
      title: "Especificaciones técnicas",
      type: "array",
      group: "tecnico",
      of: [
        defineArrayMember({
          type: "object",
          name: "spec",
          fields: [
            defineField({ name: "label", title: "Especificación", type: "string", validation: (r) => r.required() }),
            defineField({ name: "value", title: "Valor", type: "string", validation: (r) => r.required() }),
            defineField({ name: "unit", title: "Unidad", type: "string" }),
          ],
          preview: {
            select: { label: "label", value: "value", unit: "unit" },
            prepare: ({ label, value, unit }) => ({ title: `${label}: ${value}${unit ? ` ${unit}` : ""}` }),
          },
        }),
      ],
    }),
    defineField({
      name: "variants",
      title: "Variantes",
      description: "Ej.: cada combinación de diámetro y longitud con su propia referencia.",
      type: "array",
      group: "tecnico",
      of: [
        defineArrayMember({
          type: "object",
          name: "variant",
          fields: [
            defineField({ name: "reference", title: "Referencia", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "attributes",
              title: "Atributos",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "attribute",
                  fields: [
                    defineField({ name: "label", title: "Atributo", description: "Ej.: Diámetro", type: "string", validation: (r) => r.required() }),
                    defineField({ name: "value", title: "Valor", description: "Ej.: 3,5 mm", type: "string", validation: (r) => r.required() }),
                  ],
                  preview: { select: { title: "label", subtitle: "value" } },
                }),
              ],
            }),
            activeField,
          ],
          preview: { select: { title: "reference", active: "active" }, prepare: ({ title, active }) => ({ title, subtitle: active === false ? "Inactiva" : undefined }) },
        }),
      ],
      validation: (r) =>
        r.custom((variants?: { reference?: string }[]) => {
          const refs = (variants ?? []).map((v) => v.reference).filter(Boolean);
          return new Set(refs).size === refs.length ? true : "Hay referencias de variante repetidas.";
        }),
    }),
    defineField({
      name: "regulatory",
      title: "Información regulatoria",
      type: "object",
      group: "tecnico",
      fields: [
        defineField({ name: "sanitaryRegistration", title: "Registro sanitario INVIMA", type: "string" }),
        defineField({ name: "notes", title: "Notas", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "documents",
      title: "Documentos descargables",
      type: "array",
      group: "relaciones",
      of: [defineArrayMember({ type: "reference", to: [{ type: "productDocument" }] })],
    }),
    defineField({
      name: "related",
      title: "Productos relacionados",
      type: "array",
      group: "relaciones",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
          options: { filter: ({ document }) => ({ filter: "!(_id in [$id, 'drafts.' + $id])", params: { id: document._id.replace(/^drafts\./, "") } }) },
        }),
      ],
      validation: (r) => r.max(8).unique(),
    }),
    defineField({ name: "featured", title: "Destacar en el inicio", type: "boolean", group: "basico", initialValue: false }),
    { ...activeField, group: "basico" },
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      description: "Se usa para el orden «Más recientes».",
      type: "date",
      group: "basico",
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      description: "Opcional. Si se deja vacío se usan el nombre y la descripción corta.",
      fields: [
        defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.max(65) }),
        defineField({ name: "description", title: "Descripción", type: "text", rows: 2, validation: (r) => r.max(160) }),
      ],
    }),
    orderRankField({ type: "product" }),
  ],
  preview: {
    select: { title: "name", ref: "reference", media: "images.0", active: "active" },
    prepare: ({ title, ref, media, active }) => ({
      title,
      subtitle: `${ref ?? "Sin referencia"}${active === false ? " · Inactivo" : ""}`,
      media,
    }),
  },
});
