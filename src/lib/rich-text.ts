import type { RichText } from "@/lib/content/types";

let counter = 0;
const key = () => `k${(counter++).toString(36)}`;

/** Convierte párrafos de texto plano en bloques de texto enriquecido (datos antiguos y de ejemplo). */
export function textToBlocks(paragraphs: string[]): RichText {
  return paragraphs
    .filter((p) => p && p.trim())
    .map((text) => ({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    }));
}

/** Texto plano de un contenido enriquecido (para descripciones SEO). */
export function richTextToPlain(blocks: RichText | undefined, max = 160): string {
  const text = (blocks ?? [])
    .filter((b) => b._type === "block")
    .map((b) => ((b.children as { text?: string }[] | undefined) ?? []).map((c) => c.text ?? "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
