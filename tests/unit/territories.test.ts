import { describe, expect, it } from "vitest";
import { departments, getMunicipalitiesByDepartment, getMunicipality } from "@/lib/territories";
import { coverages } from "@/mocks/content";

describe("DIVIPOLA", () => {
  it("tiene 33 departamentos (32 + Bogotá D.C.) y 1.122 municipios", () => {
    expect(departments).toHaveLength(33);
    const total = departments.reduce((n, d) => n + getMunicipalitiesByDepartment(d.code).length, 0);
    expect(total).toBe(1122);
  });

  it("resuelve códigos oficiales", () => {
    expect(getMunicipality("05001")?.name).toBe("Medellín");
    expect(getMunicipality("11001")?.departmentCode).toBe("11");
    expect(getMunicipality("76364")?.name).toBe("Jamundí");
  });

  it("todos los códigos usados en las coberturas existen", () => {
    for (const c of coverages) {
      for (const code of c.municipalityCodes) expect(getMunicipality(code), code).toBeDefined();
      for (const code of c.departmentCodes) expect(departments.some((d) => d.code === code), code).toBe(true);
    }
  });
});
