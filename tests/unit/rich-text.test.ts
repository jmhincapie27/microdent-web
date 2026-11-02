import { describe, expect, it } from "vitest";
import { richTextToPlain, textToBlocks } from "@/lib/rich-text";

describe("texto enriquecido", () => {
  it("convierte párrafos planos (datos anteriores) en bloques", () => {
    const blocks = textToBlocks(["Uno", "", "Dos"]);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ _type: "block", style: "normal" });
  });

  it("obtiene texto plano para la descripción SEO, ignorando imágenes y botones", () => {
    const blocks = [...textToBlocks(["Primera frase.", "Segunda frase."]), { _type: "richImage", _key: "i" }];
    expect(richTextToPlain(blocks)).toBe("Primera frase. Segunda frase.");
    expect(richTextToPlain(textToBlocks(["a".repeat(300)]), 20)).toHaveLength(20);
  });
});
