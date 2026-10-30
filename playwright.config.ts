import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas en navegador sobre la compilación de producción.
 * Ejecutar: npm run build && npm run test:e2e
 * En entornos con Chromium preinstalado, definir PW_CHROMIUM_PATH.
 */
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3200", trace: "retain-on-failure", launchOptions: { executablePath } },
  projects: [
    { name: "movil", use: { ...devices["Pixel 7"], launchOptions: { executablePath } } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { executablePath } } },
  ],
  webServer: { command: "npm run start -- -p 3200", url: "http://localhost:3200", reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
