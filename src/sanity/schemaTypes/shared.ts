import { defineField, type StringRule } from "sanity";

/** Imagen con texto alternativo obligatorio. Sin recorte (hotspot) para no alterar las fotos. */
export const imageWithAlt = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: false },
    fields: [
      defineField({
        name: "alt",
        title: "Texto alternativo",
        description: "Describa la imagen para personas con lector de pantalla. Ej.: «Implante con cuello dorado, vista frontal».",
        type: "string",
        validation: (r) => r.required().error("El texto alternativo es obligatorio."),
      }),
    ],
    validation: required ? (r) => r.required().error("Agregue una imagen.") : undefined,
  });

export const activeField = defineField({
  name: "active",
  title: "Activo",
  description: "Si se desactiva, deja de mostrarse en el sitio aunque esté publicado.",
  type: "boolean",
  initialValue: true,
});

/** Número de WhatsApp colombiano en formato internacional. */
export const whatsappValidation = (r: StringRule) =>
  r
    .required()
    .regex(/^\+573\d{9}$/, { name: "celular colombiano" })
    .error("Use el formato +573001234567 (sin espacios): +57 y el celular de 10 dígitos.");
