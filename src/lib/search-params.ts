import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { SORT_OPTIONS } from "@/lib/catalog";

/**
 * Parámetros de URL compartidos entre servidor y cliente.
 * /productos?q=hex&categoria=implantes,aditamentos-protesicos&linea=linea-a&orden=nombre
 */
export const catalogParsers = {
  q: parseAsString.withDefault(""),
  categoria: parseAsArrayOf(parseAsString).withDefault([]),
  linea: parseAsArrayOf(parseAsString).withDefault([]),
  orden: parseAsStringLiteral(SORT_OPTIONS.map((o) => o.value)).withDefault("relevancia"),
};

export const serializeCatalog = createSerializer(catalogParsers);

/** /asesores?departamento=05&municipio=05001&producto=slug */
export const advisorParsers = {
  departamento: parseAsString.withDefault(""),
  municipio: parseAsString.withDefault(""),
  producto: parseAsString.withDefault(""),
};

export const serializeAdvisors = createSerializer(advisorParsers);
