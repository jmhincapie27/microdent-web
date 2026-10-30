import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "server-only" lanza un error fuera de Next.js; en pruebas se reemplaza por un módulo vacío.
      "server-only": fileURLToPath(new URL("./tests/empty.ts", import.meta.url)),
    },
  },
  test: { include: ["tests/unit/**/*.test.ts"] },
});
