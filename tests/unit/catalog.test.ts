import { describe, expect, it } from "vitest";
import { queryCatalog, type CatalogQuery } from "@/lib/catalog";
import { categories, lines, products } from "@/mocks/content";

const q = (partial: Partial<CatalogQuery>) =>
  queryCatalog(products, categories, lines, { q: "", categorias: [], lineas: [], orden: "relevancia", ...partial });

describe("queryCatalog", () => {
  it("sin filtros devuelve todos los productos activos", () => {
    expect(q({}).total).toBe(products.filter((p) => p.active).length);
  });

  it("encuentra por referencia exacta aunque cambien guiones y mayúsculas", () => {
    const r = q({ q: "demo imp 002" });
    expect(r.items[0].reference).toBe("DEMO-IMP-002");
    expect(r.exactMatchId).toBe("p-imp-002");
  });

  it("encuentra por referencia de variante", () => {
    const r = q({ q: "DEMO-IMP-001-D2L3" });
    expect(r.items[0].id).toBe("p-imp-001");
    expect(r.exactMatchId).toBe("p-imp-001");
  });

  it("busca por nombre sin importar tildes", () => {
    expect(q({ q: "analogo" }).items.map((p) => p.id)).toContain("p-adt-004");
  });

  it("combina categoría y línea", () => {
    const r = q({ categorias: ["implantes"], lineas: ["linea-a"] });
    expect(r.items.every((p) => p.categoryId === "cat-implantes" && p.lineId === "line-a")).toBe(true);
    expect(r.total).toBeGreaterThan(0);
  });

  it("los conteos de categoría respetan el filtro de línea", () => {
    const r = q({ lineas: ["linea-c"] });
    const total = r.facets.categories.reduce((n, c) => n + c.count, 0);
    expect(total).toBe(r.total);
  });

  it("devuelve vacío cuando no hay coincidencias", () => {
    expect(q({ q: "zzzz-no-existe" }).total).toBe(0);
  });

  it("ordena por nombre", () => {
    const names = q({ orden: "nombre" }).items.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "es")));
  });
});
