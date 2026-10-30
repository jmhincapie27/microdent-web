import divipola from "@/data/divipola.json";
import type { Department, Municipality } from "@/lib/content/types";

/**
 * Departamentos y municipios con códigos DIVIPOLA (DANE).
 * Departamento: 2 dígitos (05 = Antioquia). Municipio: 5 dígitos (05001 = Medellín).
 */

const collator = new Intl.Collator("es", { sensitivity: "base" });

export const departments: Department[] = [...divipola.departments].sort((a, b) =>
  collator.compare(a.name, b.name),
);

const municipalities: Municipality[] = divipola.municipalities;

const byCode = new Map(municipalities.map((m) => [m.code, m]));
const deptByCode = new Map(departments.map((d) => [d.code, d]));

/** Código especial para visitantes fuera de Colombia. */
export const OUTSIDE_COLOMBIA = "EXT";

export function getDepartment(code: string | null | undefined): Department | undefined {
  return code ? deptByCode.get(code) : undefined;
}

export function getMunicipality(code: string | null | undefined): Municipality | undefined {
  return code ? byCode.get(code) : undefined;
}

export function getMunicipalitiesByDepartment(departmentCode: string): Municipality[] {
  return municipalities
    .filter((m) => m.departmentCode === departmentCode)
    .sort((a, b) => collator.compare(a.name, b.name));
}

export function isValidMunicipalityCode(code: string): boolean {
  return /^\d{5}$/.test(code) && byCode.has(code);
}
