import { describe, expect, it } from "vitest";
import { normalizeCoverages, normalizeProducts } from "@/lib/content/normalize";
import { queryCatalog } from "@/lib/catalog";
import { resolveCoverage } from "@/lib/coverage";

describe("normalizeProducts (datos de Sanity)", () => {
  const raw = [
    {
      id: "p1",
      name: "Producto",
      reference: "MD-1",
      slug: "producto-md-1",
      categoryId: "c1",
      lineId: null,
      images: [
        { src: "https://cdn.sanity.io/images/x/production/a-100x100.webp", width: 100, height: 100, alt: "Foto" },
        { src: null, width: null, height: null, alt: "" },
      ],
      shortDescription: "Corta",
      features: null,
      specs: [{ label: "Material", value: "X", unit: null }],
      variants: null,
      documentIds: null,
      relatedIds: ["p2"],
      regulatory: null,
      seo: null,
      featured: true,
      publishedAt: "2026-10-30T10:00:00Z",
    },
  ];

  it("convierte null en vacío y descarta imágenes sin archivo", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [p] = normalizeProducts(raw as any);
    expect(p.lineId).toBeUndefined();
    expect(p.images).toHaveLength(1);
    expect(p.features).toEqual([]);
    expect(p.variants).toEqual([]);
    expect(p.specs[0].unit).toBeUndefined();
    expect(p.publishedAt).toBe("2026-10-30");
    expect(p.order).toBe(0);
  });

  it("el resultado funciona con el buscador del catálogo", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = normalizeProducts(raw as any);
    const r = queryCatalog(products, [{ id: "c1", title: "Cat", slug: "cat", featured: false, order: 0, active: true }], [], {
      q: "md1",
      categorias: [],
      lineas: [],
      orden: "relevancia",
    });
    expect(r.exactMatchId).toBe("p1");
  });
});

describe("normalizeCoverages (datos de Sanity)", () => {
  it("el orden de la lista de asesores es la prioridad comercial", () => {
    const [c] = normalizeCoverages([
      { id: "z", zoneName: "Zona", hubCity: "Sede", departmentCodes: ["05"], municipalityCodes: null, advisorIds: ["b", "a"], validFrom: null, validUntil: null, active: true },
    ]);
    expect(c.advisors).toEqual([
      { advisorId: "b", priority: 1 },
      { advisorId: "a", priority: 2 },
    ]);
    const r = resolveCoverage({
      municipalityCode: "05001",
      departmentCode: "05",
      coverages: [c],
      advisors: ["a", "b"].map((id) => ({ id, publicName: id, role: "", whatsapp: "", consent: { authorized: true, date: "" }, active: true })),
      fallback: { name: "", role: "", whatsapp: "" },
      today: "2026-10-30",
    });
    expect(r.regional.map((x) => x.advisor.id)).toEqual(["b", "a"]);
  });
});
