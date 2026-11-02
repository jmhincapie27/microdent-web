import { defineArrayMember, defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons/Image";
import { LinkIcon } from "@sanity/icons/Link";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";

/**
 * Texto enriquecido (editor tipo procesador de texto) reutilizable.
 *
 * Los tamaños de texto se manejan con estilos predefinidos (Título, Subtítulo, Texto grande,
 * Normal, Texto pequeño) para que todo el sitio mantenga la tipografía de la marca.
 * Dentro del texto se pueden insertar elementos: imagen, botón y nota destacada.
 */
export const richText = defineType({
  name: "richText",
  title: "Texto enriquecido",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Título", value: "h2" },
        { title: "Subtítulo", value: "h3" },
        { title: "Texto grande", value: "lead" },
        { title: "Texto pequeño", value: "small" },
        { title: "Cita", value: "blockquote" },
      ],
      lists: [
        { title: "Viñetas", value: "bullet" },
        { title: "Numerada", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Negrita", value: "strong" },
          { title: "Cursiva", value: "em" },
          { title: "Subrayado", value: "underline" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Enlace",
            icon: LinkIcon,
            fields: [
              defineField({
                name: "href",
                title: "Dirección",
                description: "Página del sitio (ej.: /productos) o dirección completa (https://…).",
                type: "string",
                validation: (r) =>
                  r.required().custom((v?: string) =>
                    !v || /^(\/|https?:\/\/|mailto:|tel:)/.test(v) ? true : "Empiece con /, https://, mailto: o tel:",
                  ),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      name: "richImage",
      type: "image",
      title: "Imagen",
      icon: ImageIcon,
      options: { hotspot: false },
      fields: [
        defineField({ name: "alt", title: "Texto alternativo", type: "string", validation: (r) => r.required() }),
        defineField({ name: "caption", title: "Pie de foto", type: "string" }),
        defineField({
          name: "size",
          title: "Tamaño",
          type: "string",
          options: {
            list: [
              { title: "Mediano", value: "medium" },
              { title: "Ancho completo", value: "full" },
            ],
            layout: "radio",
            direction: "horizontal",
          },
          initialValue: "medium",
        }),
      ],
    }),
    defineArrayMember({
      name: "ctaButton",
      type: "object",
      title: "Botón",
      icon: LinkIcon,
      fields: [
        defineField({ name: "label", title: "Texto del botón", type: "string", validation: (r) => r.required().max(40) }),
        defineField({
          name: "href",
          title: "Enlace",
          description: "Ej.: /asesores, /productos?categoria=implantes o https://…",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
      preview: { select: { title: "label", subtitle: "href" }, prepare: ({ title, subtitle }) => ({ title: `Botón: ${title ?? ""}`, subtitle }) },
    }),
    defineArrayMember({
      name: "callout",
      type: "object",
      title: "Nota destacada",
      icon: BulbOutlineIcon,
      fields: [
        defineField({ name: "title", title: "Título", type: "string" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 3, validation: (r) => r.required() }),
      ],
      preview: { select: { title: "title", subtitle: "text" }, prepare: ({ title, subtitle }) => ({ title: `Nota: ${title ?? ""}`, subtitle }) },
    }),
  ],
});
