import { defineArrayMember, defineField, defineType } from "sanity";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { PinIcon } from "@sanity/icons/Pin";
import { UserIcon } from "@sanity/icons/User";
import { activeField, imageWithAlt, whatsappValidation } from "./shared";

/**
 * Territorio DIVIPOLA (DANE). Se carga con la herramienta «Territorios» del Studio;
 * no se crea a mano. El código es la clave: 05 = Antioquia, 05001 = Medellín.
 */
export const territory = defineType({
  name: "territory",
  title: "Territorio",
  type: "document",
  icon: PinIcon,
  readOnly: true,
  fields: [
    defineField({
      name: "kind",
      title: "Tipo",
      type: "string",
      options: { list: [{ title: "Departamento", value: "department" }, { title: "Municipio", value: "municipality" }] },
    }),
    defineField({ name: "code", title: "Código DIVIPOLA", type: "string" }),
    defineField({ name: "name", title: "Nombre", type: "string" }),
    defineField({ name: "officialName", title: "Nombre oficial", type: "string" }),
    defineField({ name: "department", title: "Departamento", type: "reference", to: [{ type: "territory" }] }),
  ],
  preview: {
    select: { name: "name", code: "code", kind: "kind", dep: "department.name" },
    prepare: ({ name, code, kind, dep }) => ({
      title: name,
      subtitle: kind === "department" ? `Departamento · ${code}` : `${dep ?? ""} · ${code}`,
    }),
  },
});

export const advisor = defineType({
  name: "advisor",
  title: "Asesor",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "publicName",
      title: "Nombre público",
      description: "Tal como el asesor autoriza que aparezca en el sitio.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "role", title: "Cargo", type: "string", initialValue: "Asesor comercial", validation: (r) => r.required() }),
    imageWithAlt("photo", "Foto (opcional, solo con autorización)"),
    defineField({
      name: "whatsapp",
      title: "WhatsApp corporativo",
      description: "Formato +573001234567. El número no se muestra en el sitio: solo se usa en el botón.",
      type: "string",
      validation: whatsappValidation,
    }),
    defineField({
      name: "consent",
      title: "Autorización de datos personales",
      description: "Ley 1581 de 2012. Sin autorización, el asesor no aparece en el sitio.",
      type: "object",
      fields: [
        defineField({ name: "authorized", title: "El asesor autorizó publicar su nombre, cargo y foto", type: "boolean", initialValue: false }),
        defineField({ name: "date", title: "Fecha de la autorización", type: "date" }),
      ],
      validation: (r) =>
        r.custom((v?: { authorized?: boolean; date?: string }) =>
          v?.authorized && !v.date ? "Indique la fecha de la autorización." : true,
        ),
    }),
    activeField,
  ],
  preview: {
    select: { title: "publicName", role: "role", media: "photo", active: "active", ok: "consent.authorized" },
    prepare: ({ title, role, media, active, ok }) => ({
      title,
      media,
      subtitle: [role, active === false && "Inactivo", !ok && "Sin autorización"].filter(Boolean).join(" · "),
    }),
  },
});

/**
 * Zona comercial (cobertura). Agrupa departamentos y/o municipios y la lista
 * ORDENADA de asesores que los atienden: el orden de la lista es el orden comercial.
 */
export const advisorCoverage = defineType({
  name: "advisorCoverage",
  title: "Zona comercial",
  type: "document",
  icon: EarthGlobeIcon,
  fields: [
    defineField({ name: "zoneName", title: "Nombre de la zona", description: "Ej.: Eje Cafetero", type: "string", validation: (r) => r.required() }),
    defineField({ name: "hubCity", title: "Ciudad sede", description: "Ej.: Pereira", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "departments",
      title: "Departamentos completos",
      description: "Todos los municipios de estos departamentos quedan cubiertos por la zona.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "territory" }], options: { filter: 'kind == "department"', disableNew: true } })],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: "municipalities",
      title: "Municipios específicos",
      description: "Opcional. Para asignar asesores a municipios puntuales; aparecen primero en esos municipios.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "territory" }], options: { filter: 'kind == "municipality"', disableNew: true } })],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: "advisors",
      title: "Asesores (en orden comercial)",
      description: "Arrastre para ordenar: el primero de la lista se muestra primero.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "advisor" }] })],
      validation: (r) => r.required().min(1).unique(),
    }),
    defineField({ name: "validFrom", title: "Vigente desde", type: "date", description: "Opcional." }),
    defineField({ name: "validUntil", title: "Vigente hasta", type: "date", description: "Opcional. Útil para reemplazos temporales." }),
    activeField,
  ],
  validation: (r) =>
    r.custom((doc) => {
      const d = doc as { departments?: unknown[]; municipalities?: unknown[] } | undefined;
      return (d?.departments?.length ?? 0) + (d?.municipalities?.length ?? 0) > 0
        ? true
        : "Agregue al menos un departamento o un municipio.";
    }),
  preview: {
    select: { title: "zoneName", hub: "hubCity", a0: "advisors.0.publicName", active: "active" },
    prepare: ({ title, hub, a0, active }) => ({
      title,
      subtitle: [`Sede ${hub ?? "—"}`, a0 && `1.º ${a0}`, active === false && "Inactiva"].filter(Boolean).join(" · "),
    }),
  },
});
