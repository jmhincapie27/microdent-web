import { expect, test } from "@playwright/test";

/* Estas pruebas usan los datos del prototipo (src/mocks). */

test("catálogo: filtros combinables, búsqueda por referencia y limpiar", async ({ page, isMobile }) => {
  await page.goto("/productos");
  if (isMobile) {
    await page.getByRole("button", { name: /Filtros/ }).click();
    await page.getByRole("dialog").getByLabel(/Implantes/).check();
    await expect(page).toHaveURL(/categoria=implantes/);
    await page.getByRole("dialog").getByRole("button", { name: /^Ver \d+/ }).click();
  } else {
    await page.getByRole("complementary", { name: "Filtros" }).getByLabel(/Implantes/).check();
    await expect(page).toHaveURL(/categoria=implantes/);
  }
  await page.getByRole("searchbox").fill("demo-imp-003");
  await expect(page).toHaveURL(/q=demo-imp-003/);
  await expect(page.getByText("Coincidencia exacta")).toBeVisible();
  await page.getByRole("button", { name: "Limpiar todo" }).click();
  await expect(page).toHaveURL(/\/productos$/);
  await expect(page.getByRole("searchbox")).toHaveValue("");
});

test("catálogo: estado vacío", async ({ page }) => {
  await page.goto("/productos?q=zzzz-no-existe");
  await expect(page.getByRole("heading", { name: /No encontramos/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Preguntar a un asesor/ })).toBeVisible();
});

test("ficha → asesor: conserva producto, referencia y URL en el mensaje", async ({ page }) => {
  await page.goto("/productos/implante-de-ejemplo-a-demo-imp-001");
  await page.getByRole("link", { name: "Consultar con un asesor" }).first().click();
  await expect(page).toHaveURL(/producto=implante-de-ejemplo-a-demo-imp-001/);
  await page.getByLabel("Departamento").selectOption("05");
  await expect(page).toHaveURL(/departamento=05/);
  await page.getByLabel("Municipio").selectOption({ label: "Rionegro" });
  await expect(page.getByRole("heading", { name: /Asesores en Rionegro/ })).toBeVisible();
  const href = await page.getByRole("link", { name: /Escribir por WhatsApp/ }).first().getAttribute("href");
  const text = decodeURIComponent(href!.split("text=")[1]);
  expect(text).toContain("Rionegro (Antioquia)");
  expect(text).toContain("Ref. DEMO-IMP-001");
  expect(text).toContain("/productos/implante-de-ejemplo-a-demo-imp-001");
});

test("asesores: sin cobertura y fuera de Colombia → contacto general", async ({ page }) => {
  await page.goto("/asesores?departamento=91&municipio=91001");
  await expect(page.getByRole("heading", { name: /Aún no tenemos asesor asignado en Leticia/ })).toBeVisible();
  await page.goto("/asesores?departamento=EXT");
  await expect(page.getByRole("heading", { name: "Atención internacional" })).toBeVisible();
});

test("navegación por teclado: saltar al contenido", async ({ page, isMobile }) => {
  test.skip(isMobile, "Solo escritorio");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
});

test("404 con encabezado del sitio", async ({ page }) => {
  await page.goto("/esta-pagina-no-existe");
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Microdent — Inicio/ })).toBeVisible();
});
