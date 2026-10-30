import { describe, expect, it } from "vitest";
import { resolveCoverage } from "@/lib/coverage";
import type { Advisor, AdvisorCoverage, FallbackContact } from "@/lib/content/types";

const adv = (id: string, extra: Partial<Advisor> = {}): Advisor => ({
  id,
  publicName: `Asesor ${id}`,
  role: "Asesor comercial",
  whatsapp: "+573000000000",
  consent: { authorized: true, date: "2026-01-01" },
  active: true,
  ...extra,
});

const fallback: FallbackContact = { name: "Dirección Comercial", role: "", whatsapp: "+573000000000" };

const coverages: AdvisorCoverage[] = [
  {
    id: "dep-antioquia",
    zoneName: "Medellín",
    hubCity: "Medellín",
    departmentCodes: ["05"],
    municipalityCodes: [],
    advisors: [
      { advisorId: "a", priority: 1 },
      { advisorId: "b", priority: 2 },
    ],
    active: true,
  },
  {
    id: "mun-rionegro",
    zoneName: "Oriente",
    hubCity: "Medellín",
    departmentCodes: [],
    municipalityCodes: ["05615"],
    advisors: [{ advisorId: "b", priority: 1 }],
    active: true,
  },
];

const run = (municipalityCode: string, departmentCode: string, opts: Partial<Parameters<typeof resolveCoverage>[0]> = {}) =>
  resolveCoverage({
    municipalityCode,
    departmentCode,
    advisors: [adv("a"), adv("b")],
    coverages,
    fallback,
    today: "2026-10-30",
    ...opts,
  });

describe("resolveCoverage", () => {
  it("muestra a todos los asesores del departamento en orden comercial", () => {
    const r = run("05001", "05");
    expect(r.local).toHaveLength(0);
    expect(r.regional.map((x) => x.advisor.id)).toEqual(["a", "b"]);
    expect(r.fallback).toBeUndefined();
  });

  it("la cobertura por municipio va primero y no repite asesores", () => {
    const r = run("05615", "05");
    expect(r.local.map((x) => x.advisor.id)).toEqual(["b"]);
    expect(r.regional.map((x) => x.advisor.id)).toEqual(["a"]);
  });

  it("sin cobertura devuelve el contacto general", () => {
    const r = run("91001", "91");
    expect(r.local).toHaveLength(0);
    expect(r.regional).toHaveLength(0);
    expect(r.fallback).toEqual(fallback);
  });

  it("omite asesores inactivos o sin autorización de datos", () => {
    const r = run("05001", "05", {
      advisors: [adv("a", { active: false }), adv("b", { consent: { authorized: false, date: "" } })],
    });
    expect(r.regional).toHaveLength(0);
    expect(r.fallback).toBeDefined();
  });

  it("respeta las fechas de vigencia de la cobertura", () => {
    const vencida = coverages.map((c) => ({ ...c, validUntil: "2026-01-01" }));
    expect(run("05001", "05", { coverages: vencida }).fallback).toBeDefined();
  });

  it("desempata por nombre cuando la prioridad es igual", () => {
    const r = run("05001", "05", {
      advisors: [adv("a", { publicName: "Zuluaga" }), adv("b", { publicName: "Álvarez" })],
      coverages: [{ ...coverages[0], advisors: [{ advisorId: "a", priority: 1 }, { advisorId: "b", priority: 1 }] }],
    });
    expect(r.regional.map((x) => x.advisor.publicName)).toEqual(["Álvarez", "Zuluaga"]);
  });
});
