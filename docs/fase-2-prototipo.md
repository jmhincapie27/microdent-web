# Fase 2 — Prototipo visual navegable

> Estado: **listo para revisión** · 30-oct-2026
> Datos: **ficticios** (productos, especificaciones, asesores). Reales: fotografías y logotipo.

## Qué incluye

| Página | Qué probar |
|---|---|
| `/` | Hero con buscador, categorías, destacados, presentación breve y selector de departamento |
| `/productos` | Búsqueda por nombre o referencia (también referencias de variantes, sin importar guiones ni mayúsculas), filtros combinables por categoría y línea con conteos, orden, chips de filtros activos, estado vacío, filtros en panel inferior en móvil. Todo queda en la URL |
| `/productos/[slug]` | Galería manual, referencia con botón copiar, características, especificaciones, variantes, documentos descargables, relacionados, "Consultar con un asesor" |
| `/asesores` | Departamento → municipio (1.122 municipios con código DIVIPOLA), asesores del municipio y de la región en orden comercial, contacto general sin cobertura, opción "fuera de Colombia", recuerda la última ubicación, conserva el producto consultado |
| `/nosotros`, `/legal/*` | Contenido de ejemplo editable |

Casos de ejemplo para revisar el localizador:

- **Rionegro (Antioquia)**: asesor asignado al municipio + asesor regional.
- **Medellín**: dos asesores regionales en orden comercial.
- **Ibagué (Tolima)**, **Quibdó (Chocó)**, **Arauca → Cúcuta**: zonas propias.
- **Jamundí (Valle)**: zona Cali.
- **Leticia (Amazonas)**: sin cobertura → Dirección Comercial.
- **Fuera de Colombia**: atención internacional.

En el prototipo, el botón de WhatsApp abre WhatsApp **sin destinatario**, solo con el mensaje prellenado, para no escribir a ningún número real.

## Calidad verificada

- TypeScript y ESLint sin errores; compilación de producción correcta.
- 22 pruebas unitarias (cobertura de asesores, enlaces de WhatsApp, búsqueda y filtros, datos DIVIPOLA).
- Auditoría axe-core (WCAG 2.1 A/AA) en 8 páginas, móvil y escritorio: sin errores.
- Sin desplazamiento horizontal a 390 px.
- Flujos probados en navegador: filtros, búsqueda, limpiar, localizador, ubicación recordada, botón Atrás.

## Cómo ejecutarlo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas unitarias
npm run build      # compilación de producción
```

Variable de entorno en Vercel: `NEXT_PUBLIC_SITE_URL` (URL pública, se usa en canonical, Open Graph, sitemap y en el enlace del producto dentro del mensaje de WhatsApp).

## Pendientes conocidos (fases siguientes)

- **Fase 3 (CMS)**: esquemas Sanity, Studio en `/studio`, importación DIVIPOLA desde el archivo oficial del DANE (en el prototipo se usó un cruce de dos paquetes npm porque el portal del DANE no era accesible desde el entorno), reemplazo de `src/mocks`.
- **Fase 4**: banner de cookies + GTM (los eventos ya se envían a `dataLayer`), pruebas e2e en CI, Lighthouse. Nota: con streaming, una ficha inexistente responde 200 con `noindex` en vez de 404; se revisará en esta fase.
- **Contenido real**: textos institucionales, productos verificados, asesores con autorización de datos, contacto de la Dirección Comercial.
