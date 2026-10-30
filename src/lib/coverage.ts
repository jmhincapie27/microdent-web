import type { Advisor, AdvisorCoverage, FallbackContact } from "@/lib/content/types";

export interface CoveredAdvisor {
  advisor: Advisor;
  zoneName: string;
  hubCity: string;
  priority: number;
  /** "municipality": asignado al municipio. "department": cobertura regional. */
  level: "municipality" | "department";
}

export interface CoverageResult {
  /** Asesores asignados directamente al municipio. */
  local: CoveredAdvisor[];
  /** Asesores que cubren el departamento completo (cobertura regional). */
  regional: CoveredAdvisor[];
  /** Contacto general cuando no hay ningún asesor. */
  fallback?: FallbackContact;
}

interface ResolveInput {
  municipalityCode: string;
  departmentCode: string;
  advisors: Advisor[];
  coverages: AdvisorCoverage[];
  fallback: FallbackContact;
  /** Fecha de referencia (ISO). Por defecto, hoy. */
  today?: string;
}

function isCurrent(c: AdvisorCoverage, today: string): boolean {
  if (c.validFrom && today < c.validFrom) return false;
  if (c.validUntil && today > c.validUntil) return false;
  return true;
}

/**
 * Resuelve qué asesores atienden un municipio.
 *
 * 1. Solo coberturas activas y vigentes, con asesores activos y con autorización de datos.
 * 2. Primero las coberturas por municipio, luego las del departamento.
 * 3. Orden: prioridad comercial y luego nombre.
 * 4. Un asesor aparece una sola vez (gana su coincidencia más específica).
 * 5. Sin resultados → contacto general (Dirección Comercial).
 */
export function resolveCoverage(input: ResolveInput): CoverageResult {
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  const advisorById = new Map(
    input.advisors.filter((a) => a.active && a.consent.authorized).map((a) => [a.id, a]),
  );

  const seen = new Set<string>();
  const collect = (level: CoveredAdvisor["level"]) => {
    const out: CoveredAdvisor[] = [];
    for (const c of input.coverages) {
      if (!c.active || !isCurrent(c, today)) continue;
      const matches =
        level === "municipality"
          ? c.municipalityCodes.includes(input.municipalityCode)
          : c.departmentCodes.includes(input.departmentCode);
      if (!matches) continue;
      for (const { advisorId, priority } of c.advisors) {
        const advisor = advisorById.get(advisorId);
        if (!advisor) continue;
        out.push({ advisor, zoneName: c.zoneName, hubCity: c.hubCity, priority, level });
      }
    }
    out.sort(
      (a, b) =>
        a.priority - b.priority || a.advisor.publicName.localeCompare(b.advisor.publicName, "es"),
    );
    // Quitar duplicados conservando el primero (mejor prioridad).
    return out.filter((x) => (seen.has(x.advisor.id) ? false : (seen.add(x.advisor.id), true)));
  };

  const local = collect("municipality");
  const regional = collect("department");
  return {
    local,
    regional,
    fallback: local.length + regional.length === 0 ? input.fallback : undefined,
  };
}
