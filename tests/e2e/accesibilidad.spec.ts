import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const PAGES = [
  "/",
  "/productos",
  "/productos?q=zzzz",
  "/productos/implante-de-ejemplo-a-demo-imp-001",
  "/asesores?departamento=05&municipio=05615",
  "/asesores?departamento=91&municipio=91001",
  "/nosotros",
  "/legal/cookies",
];

for (const path of PAGES) {
  test(`WCAG 2.1 AA sin errores: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      // @ts-expect-error axe se inyecta en la página
      const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] });
      return r.violations.map((v: { id: string; nodes: unknown[] }) => `${v.id} (${v.nodes.length})`);
    });
    expect(violations).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, "sin desplazamiento horizontal").toBe(false);
  });
}
