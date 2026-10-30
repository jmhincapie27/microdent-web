import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, fillTemplate, isValidColombianMobile } from "@/lib/whatsapp";

const template = "Hola {asesor}, le escribo desde {municipio}. Me interesa el producto {producto} (Ref. {referencia}): {url}";

describe("fillTemplate", () => {
  it("reemplaza todos los marcadores", () => {
    expect(
      fillTemplate(template, {
        asesor: "Ana",
        municipio: "Medellín (Antioquia)",
        producto: "Implante X",
        referencia: "MD-1",
        url: "https://ejemplo.com/p",
      }),
    ).toBe("Hola Ana, le escribo desde Medellín (Antioquia). Me interesa el producto Implante X (Ref. MD-1): https://ejemplo.com/p");
  });

  it("limpia marcadores vacíos sin dejar signos sueltos", () => {
    const out = fillTemplate("Hola {asesor}, le escribo desde {municipio}. Gracias", { asesor: "Ana" });
    expect(out).toBe("Hola Ana, le escribo desde. Gracias");
  });
});

describe("buildWhatsAppLink", () => {
  it("codifica el mensaje y usa solo dígitos del número", () => {
    const link = buildWhatsAppLink("+57 300 123 4567", "Hola & adiós?");
    expect(link).toBe("https://wa.me/573001234567?text=Hola%20%26%20adi%C3%B3s%3F");
  });

  it("en modo seguro o con número inválido no incluye destinatario", () => {
    expect(buildWhatsAppLink("+573001234567", "x", { safeMode: true })).toBe("https://wa.me/?text=x");
    expect(buildWhatsAppLink("+570000000001", "x")).toBe("https://wa.me/?text=x");
  });

  it("valida móviles colombianos", () => {
    expect(isValidColombianMobile("+573001234567")).toBe(true);
    expect(isValidColombianMobile("+576041234567")).toBe(false);
    expect(isValidColombianMobile("3001234567")).toBe(false);
  });
});
