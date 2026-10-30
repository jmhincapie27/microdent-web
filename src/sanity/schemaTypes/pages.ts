import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { HomeIcon } from "@sanity/icons/Home";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { imageWithAlt, whatsappValidation } from "./shared";

export const homePage = defineType({
  name: "homePage",
  title: "Página de inicio",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({ name: "heroEyebrow", title: "Antetítulo", type: "string", initialValue: "Microdent Implant System" }),
    defineField({
      name: "heroTitle",
      title: "Título principal",
      description: "Corto: idealmente menos de 6 palabras.",
      type: "string",
      initialValue: "Sistemas de implantes Microdent",
      validation: (r) => r.required().max(60),
    }),
    defineField({ name: "heroSubtitle", title: "Subtítulo", type: "text", rows: 2, validation: (r) => r.required().max(180) }),
    imageWithAlt("heroImage", "Fotografía principal", true),
    defineField({
      name: "featuredCategories",
      title: "Categorías destacadas",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "productCategory" }] })],
      validation: (r) => r.max(8).unique(),
    }),
    defineField({
      name: "featuredProducts",
      title: "Productos destacados",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (r) => r.max(8).unique(),
    }),
    defineField({
      name: "about",
      title: "Presentación institucional breve",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Título", type: "string", initialValue: "Sobre Microdent" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 3, validation: (r) => r.max(300) }),
      ],
    }),
    defineField({
      name: "advisorTeaser",
      title: "Bloque de asesores",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Título", type: "string", initialValue: "Encuentre a su asesor" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 2 }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Página de inicio" }) },
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Nosotros",
  type: "document",
  icon: InfoOutlineIcon,
  fields: [
    defineField({ name: "title", title: "Título", type: "string", initialValue: "Nosotros", validation: (r) => r.required() }),
    defineField({ name: "intro", title: "Introducción", type: "text", rows: 3, validation: (r) => r.required() }),
    imageWithAlt("image", "Imagen"),
    defineField({
      name: "sections",
      title: "Secciones",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Texto", type: "text", rows: 4, validation: (r) => r.required() }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Nosotros" }) },
});

export const legalPage = defineType({
  name: "legalPage",
  title: "Página legal",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Identificador en la URL", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "updatedAt", title: "Fecha de actualización", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "body",
      title: "Contenido",
      description: "Un párrafo por elemento.",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (r) => r.min(1),
    }),
  ],
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Ajustes del sitio",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "fallbackContact",
      title: "Contacto general (sin cobertura o fuera de Colombia)",
      type: "object",
      validation: (r) => r.required(),
      fields: [
        defineField({ name: "name", title: "Nombre o área", type: "string", initialValue: "Dirección Comercial y Administrativa", validation: (r) => r.required() }),
        defineField({ name: "role", title: "Descripción", type: "string", initialValue: "Atención nacional e internacional" }),
        defineField({ name: "whatsapp", title: "WhatsApp", type: "string", validation: whatsappValidation }),
      ],
    }),
    defineField({
      name: "whatsappTemplates",
      title: "Mensajes de WhatsApp",
      description:
        "Marcadores disponibles: {asesor} {municipio} {producto} {referencia} {url}. Se reemplazan automáticamente.",
      type: "object",
      fields: [
        defineField({
          name: "general",
          title: "Mensaje general",
          type: "text",
          rows: 3,
          initialValue: "Hola {asesor}, le escribo desde {municipio}. Quisiera recibir asesoría sobre productos Microdent.",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "product",
          title: "Mensaje desde un producto",
          type: "text",
          rows: 3,
          initialValue: "Hola {asesor}, le escribo desde {municipio}. Me interesa el producto {producto} (Ref. {referencia}): {url}",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({ name: "email", title: "Correo de contacto", type: "string", validation: (r) => r.email() }),
    defineField({
      name: "social",
      title: "Redes sociales",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({ name: "label", title: "Red", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", title: "Enlace", type: "url", validation: (r) => r.required() }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Ajustes del sitio" }) },
});
