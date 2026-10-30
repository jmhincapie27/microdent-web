# Microdent Implant System — Fase 1: Arquitectura y diseño

> Estado: **borrador para validación** · Fecha: 30-oct-2026
> Alcance: catálogo digital B2B (sin ecommerce) + localizador de asesores + CMS editable sin código.
> Este documento no contiene información técnica ni clínica de productos. Todo dato de producto que aparezca en el prototipo será **ficticio y marcado como tal**.

---

## ✅ Decisiones validadas (30-oct-2026) — prevalecen sobre el resto del documento

1. **Colores**: Glauco `#8BCED7`, Antracita `#575756`, blanco y negro (manual de marca 2025). Se descartan los tonos derivados de #1995AD.
   - Antracita sobre blanco: 7,23:1 → texto, botones primarios (texto blanco).
   - Glauco sobre blanco: 1,76:1 → **solo** fondos, bordes y acentos. Texto sobre glauco: negro (11,9:1).
   - Fondo oscuro del pie: `#2B2B2A`; glauco sobre él: 8,0:1.
   - ⚠️ El manual tiene una inconsistencia: el HEX dice `#8BCED7` pero el RGB 132/218/222 equivale a `#84DADE`, y el logotipo vectorial usa este último. Se usa `#8BCED7` en la interfaz y el logo se deja tal cual (no se modifica).
2. **Tipografías**: Montserrat (oficial, títulos) + Inter (complementaria, texto).
3. **Logotipo**: extraído en vector del PDF del manual, sin redibujar. Versión responsive según el manual: isotipo en móvil, isologo desde tablet; versión negativa en el pie.
4. **LegalPage y AboutPage**: aprobados como modelos editables.
5. **Orden comercial por cobertura**: aprobado.
6. **WhatsApp**: solo botón, el número del asesor nunca se muestra.
7. **Cobertura (cambio de modelo)**: Microdent atiende desde 10 zonas — Medellín, Eje Cafetero, Bogotá, Cali, Costa, Neiva, Santander, Ibagué, Quibdó y Cúcuta. Cada `AdvisorCoverage` es una **zona comercial**: nombre, ciudad sede, departamentos y/o municipios que cubre, y lista ordenada de asesores. Los municipios cercanos se asignan a la zona de la sede más cercana (asignación editable en el CMS). Sin zona o fuera de Colombia → **Dirección Comercial y Administrativa** (contacto en `SiteSettings`).
   Propuesta inicial de asignación (validada el 30-oct-2026; Tolima → Ibagué, Chocó → Quibdó, Arauca → Cúcuta):

   | Zona | Departamentos |
   |---|---|
   | Medellín | Antioquia |
   | Eje Cafetero | Caldas, Risaralda, Quindío |
   | Bogotá | Bogotá D.C., Cundinamarca, Boyacá, Meta, Casanare |
   | Cali | Valle del Cauca, Cauca, Nariño |
   | Costa | Atlántico, Magdalena, La Guajira, Cesar, Bolívar, Córdoba, Sucre, San Andrés |
   | Neiva | Huila, Caquetá, Putumayo |
   | Santander | Santander |
   | Ibagué | Tolima |
   | Quibdó | Chocó |
   | Cúcuta | Norte de Santander, Arauca |
   | Dirección Comercial | Amazonas, Guainía, Guaviare, Vaupés, Vichada y fuera de Colombia |
8. **Registro INVIMA**: lo cargan los administradores por producto (campo `regulatory.sanitaryRegistration`).
9. **Administradores**: 1 o 2 personas → el plan gratuito de Sanity es suficiente para empezar.
10. **Next.js 16.4 con Cache Components** (activado por defecto en proyectos nuevos): los datos se cachean con `"use cache"` + etiquetas; en la Fase 3 un webhook de Sanity invalida solo lo publicado.
11. **shadcn/ui**: el registro `ui.shadcn.com` está bloqueado en el entorno de desarrollo; los componentes se escribieron con las mismas bases (Radix, cva, tailwind-merge) y el mismo formato. `components.json` queda listo para usar el CLI desde otra máquina.

## Índice

1. Arquitectura técnica
2. Modelo de datos (Sanity)
3. Mapa del sitio
4. Flujos de usuario
5. Wireframes (escritorio y móvil)
6. Sistema de diseño
7. Componentes reutilizables
8. Plan de implementación
9. Riesgos y dependencias
10. Decisiones que necesitamos validar

---

## 1. Arquitectura técnica

### 1.1 Stack y versiones (verificadas en npm el 30-oct-2026)

| Pieza | Versión | Nota de compatibilidad |
|---|---|---|
| Node.js | ≥ 20.9 (recomendado 22 LTS) | Requisito de Next 16 |
| Next.js (App Router) | 16.4.x | Turbopack por defecto; `proxy.ts` reemplaza a `middleware.ts` |
| React / React DOM | 19.3.x | Cumple peer de Next 16 y Sanity 6 (`^19.2`) |
| TypeScript | **5.9.3 (fijado)** | La 7.0 (nativa) es la `latest`, pero aún no la adoptamos hasta confirmar soporte completo de Next/Sanity. Revisar en Fase 3 |
| Tailwind CSS | 4.3.x | Configuración CSS-first (`@theme`) |
| shadcn/ui (CLI) | 4.23.x | Componentes copiados al repo (sin dependencia en runtime) |
| Sanity Studio | 6.21.x | Embebido en `/studio` |
| next-sanity | 13.4.x | Peer: next ^16, sanity ^5 \|\| ^6, styled-components ^6.1 ✅ |
| @sanity/image-url | 2.1.x | URLs de imagen del CDN |
| @sanity/orderable-document-list | 2.0.x | Orden arrastrable en Studio; peer sanity ^6 ✅ |
| nuqs | 2.10.x | Estado de filtros sincronizado con la URL |
| zod | 4.x | Validación de parámetros de URL y formularios |

### 1.2 Vista general

```
                 ┌──────────────────────────────┐
  Administrador  │  Sanity Studio  (/studio)    │  ← edita productos, asesores,
  (sin código)   │  borradores · publicación    │    cobertura, home, ajustes
                 └──────────────┬───────────────┘
                                │ Content Lake (API + CDN de imágenes/archivos)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│ Next.js 16 en Vercel                                          │
│  • Server Components consultan Sanity con GROQ (defineLive)   │
│  • Páginas estáticas/ISR, se revalidan al publicar en Sanity  │
│  • Draft Mode + Presentation para previsualizar borradores    │
│  • Client Components solo donde hay interacción:              │
│    buscador, filtros, selector de municipio, galería          │
└───────────────┬───────────────────────────────┬───────────────┘
                │                               │
                ▼                               ▼
      Visitante (mobile-first)           Analítica (dataLayer → GA4/GTM,
      → clic WhatsApp (wa.me)            Vercel Analytics opcional)
```

### 1.3 Decisiones clave

- **Renderizado:** todo el contenido público se genera en servidor y se cachea. Al publicar en Sanity, `next-sanity` (`defineLive` / Live Content API) invalida solo lo que cambió. El editor ve el cambio en segundos, sin volver a desplegar.
- **Catálogo y búsqueda:** los filtros viven en la URL (`/productos?q=hex&categoria=implantes&linea=ici&orden=nombre`). El servidor resuelve la consulta GROQ con esos parámetros, así los resultados son indexables, compartibles y funcionan sin JavaScript. En cliente, `nuqs` actualiza la URL con *debounce* (300 ms) para que la búsqueda se sienta inmediata. Si el catálogo supera ~2.000 productos, se evalúa un índice dedicado (Algolia/Typesense); no es necesario al inicio.
- **Localizador de asesores:** los ~1.100 municipios y 33 departamentos se cargan **una vez** desde el listado oficial DIVIPOLA del DANE mediante un script de importación. Los asesores y su cobertura se editan en Studio. La resolución de "qué asesores atienden este municipio" se hace en servidor (ver 2.4).
- **WhatsApp:** enlaces `https://wa.me/57XXXXXXXXXX?text=...` construidos en servidor a partir de una plantilla editable en `SiteSettings`. No se usa la API de WhatsApp Business (no hace falta para enlaces de contacto).
- **Imágenes:** servidas desde el CDN de Sanity vía `next/image`, sin recorte forzado (`fit=max`, `object-contain` sobre fondo blanco). El original subido nunca se altera; solo se generan tamaños y formatos (AVIF/WebP) para rendimiento.
- **Acceso al CMS:** usuarios de Sanity con roles (Administrador, Editor). Studio en `/studio` con `noindex`. Se puede restringir por SSO en planes superiores.
- **Sin datos personales del visitante:** no hay formularios ni cuentas. La geolocalización no se pide; el visitante elige departamento y municipio. Opcionalmente se recuerda su última elección en `localStorage` (solo en su navegador).

### 1.4 Estructura del repositorio

```
microdent-web/
├─ docs/                         ← este documento y decisiones (ADR)
├─ src/
│  ├─ app/
│  │  ├─ (site)/
│  │  │  ├─ page.tsx                     /
│  │  │  ├─ productos/page.tsx           /productos
│  │  │  ├─ productos/[slug]/page.tsx    /productos/[slug]
│  │  │  ├─ nosotros/page.tsx
│  │  │  ├─ asesores/page.tsx
│  │  │  ├─ legal/[slug]/page.tsx        páginas legales
│  │  │  └─ layout.tsx                   header, footer, CTA persistente
│  │  ├─ studio/[[...tool]]/page.tsx     Sanity Studio embebido
│  │  ├─ api/draft-mode/{enable,disable}/route.ts
│  │  ├─ sitemap.ts  robots.ts  opengraph-image.tsx
│  │  └─ not-found.tsx
│  ├─ components/
│  │  ├─ ui/                     shadcn (button, sheet, select, command, …)
│  │  ├─ layout/                 Header, Footer, MobileContactBar, SkipLink
│  │  ├─ catalog/                SearchBox, FilterPanel, ProductCard, …
│  │  ├─ product/                Gallery, SpecTable, VariantTable, …
│  │  └─ advisors/               TerritoryPicker, AdvisorCard, …
│  ├─ lib/
│  │  ├─ whatsapp.ts             construcción y saneo de enlaces/mensajes
│  │  ├─ coverage.ts             resolución de cobertura (pura, testeada)
│  │  ├─ analytics.ts            track() tipado
│  │  ├─ seo.ts                  metadata, JSON-LD
│  │  └─ search-params.ts        esquemas zod + parsers nuqs
│  ├─ sanity/
│  │  ├─ schemaTypes/            un archivo por modelo
│  │  ├─ structure.ts            menú del Studio en español
│  │  ├─ queries.ts              GROQ tipado (TypeGen)
│  │  └─ live.ts  client.ts  image.ts
│  └─ mocks/                     datos ficticios de la Fase 2 (marcados)
├─ scripts/
│  ├─ import-divipola.ts         carga departamentos/municipios oficiales
│  └─ seed-mock.ts               carga datos ficticios al dataset "development"
├─ sanity.config.ts  sanity.cli.ts
└─ tests/                        unitarios (vitest) + e2e/a11y (playwright + axe)
```

### 1.5 Entornos

| Entorno | Dataset Sanity | URL |
|---|---|---|
| Desarrollo | `development` (datos ficticios) | local / preview de Vercel |
| Producción | `production` (datos reales) | dominio definitivo |

Los datos ficticios **nunca** se cargan en `production`.

---

## 2. Modelo de datos (Sanity)

Convenciones comunes a todos los documentos editables:

- `active` (booleano, por defecto `true`): si es `false`, no aparece en la web aunque esté publicado.
- `order` (número) o lista arrastrable con `@sanity/orderable-document-list`.
- Borradores y publicación: nativos de Sanity (cada documento tiene versión borrador y publicada; historial y restauración incluidos).
- Validaciones con mensajes en español.

### 2.1 Diagrama de relaciones

```
ProductCategory 1 ──< Product >── 1 ProductLine
                        │  │
                        │  └──< ProductDocument   (n:m)
                        └──< Product (relacionados, n:m)

Advisor 1 ──< AdvisorCoverage >── n Territory
                                    │
                    Territory(municipio) ── parent ──> Territory(departamento)

HomePage (singleton) ──> Product[], ProductCategory[]
SiteSettings (singleton): contacto general, plantillas WhatsApp, redes, SEO por defecto
```

### 2.2 Modelos de catálogo

**ProductCategory** — p. ej. "Implantes", "Aditamentos protésicos", "Instrumental".
| Campo | Tipo | Validación |
|---|---|---|
| title | string | requerido, ≤ 60 |
| slug | slug | requerido, único |
| description | text | ≤ 200 |
| image | image (+ alt requerido) | opcional |
| featured | boolean | para Home |
| order, active | | |

**ProductLine** — línea/sistema de producto Microdent.
| Campo | Tipo | Validación |
|---|---|---|
| title, slug, description, order, active | | igual que categoría |
| logo | image | opcional |

**Product**
| Campo | Tipo | Validación / nota |
|---|---|---|
| name | string | requerido, ≤ 90 |
| reference | string | requerido, **único**, normalizado en mayúsculas sin espacios |
| slug | slug | requerido, único, generado desde name + reference |
| category | reference → ProductCategory | requerido |
| line | reference → ProductLine | opcional |
| images | array<image> | mínimo 1; `alt` requerido; `hotspot` desactivado para no recortar |
| shortDescription | text | requerido, ≤ 240 |
| features | array<{ text, source }> | `source` (interno, no público): documento o ficha técnica que respalda el dato. Requerido |
| specs | array<{ label, value, unit? }> | tabla técnica; vacía = no se muestra |
| variants | array<{ reference, attributes: array<{label, value}>, active }> | p. ej. diámetro × longitud. Referencia única dentro del producto |
| documents | array<reference → ProductDocument> | |
| related | array<reference → Product> | máx. 8, no puede incluirse a sí mismo |
| regulatory | object { sanitaryRegistration?, notes? } | registro sanitario INVIMA si aplica (ver riesgos) |
| featured | boolean | |
| order, active | | |
| seo | object { title?, description?, ogImage? } | si vacío, se deriva del producto |

> Regla editorial: si un campo técnico está vacío, la web **no lo muestra** y no se rellena con texto genérico. Así se evita inventar información.

**ProductDocument**
| Campo | Tipo | Validación |
|---|---|---|
| title | string | requerido |
| type | lista: Ficha técnica · Instrucciones de uso (IFU) · Catálogo · Certificado · Otro | requerido |
| file | file (PDF) | requerido, ≤ 20 MB |
| language | lista: es · en · otro | |
| version, publishedAt | string, date | |
| active | boolean | |

### 2.3 Modelos de asesores y territorio

**Territory** (cargado desde DIVIPOLA; editable solo por Administrador)
| Campo | Tipo | Nota |
|---|---|---|
| kind | `department` \| `municipality` | |
| code | string | Código DIVIPOLA oficial: 2 dígitos departamento (p. ej. `05`), 5 dígitos municipio (p. ej. `05001`). Requerido, único, inmutable |
| name | string | nombre oficial |
| department | reference → Territory | solo para municipios |
| _id | `territory-05001` | id determinista = importación idempotente |

**Advisor**
| Campo | Tipo | Validación / privacidad |
|---|---|---|
| publicName | string | requerido; nombre que el asesor autoriza mostrar |
| role | string | p. ej. "Asesor comercial" |
| photo | image (+alt) | opcional, solo con autorización |
| whatsapp | string | requerido, número **corporativo** en formato E.164 (`+57` + 10 dígitos). Validación por regex |
| showPhoneNumber | boolean | si es `false`, se muestra solo el botón, no el número |
| email | string | opcional y oculto por defecto (`showEmail`) |
| consent | object { authorized: boolean, date, note } | **requerido `authorized = true` para poder publicarse** (Ley 1581 de 2012) |
| internalNotes | text | nunca se consulta desde la web |
| active | boolean | |

**AdvisorCoverage** — una fila de cobertura por asesor y alcance.
| Campo | Tipo | Nota |
|---|---|---|
| advisor | reference → Advisor | requerido |
| scope | `municipalities` \| `departments` \| `national` | |
| municipalities | array<reference → Territory(municipio)> | si scope = municipalities |
| departments | array<reference → Territory(departamento)> | si scope = departments (cobertura regional) |
| priority | número (1 = primero) | orden comercial dentro del municipio |
| validFrom / validUntil | date | opcional (vacaciones, cambios de zona) |
| active | boolean | |

Se usa un documento aparte (y no un campo dentro de Advisor) para que un asesor tenga varias coberturas con prioridades distintas, p. ej. prioridad 1 en Medellín y prioridad 3 como apoyo regional en todo Antioquia.

### 2.4 Regla de resolución de cobertura (`lib/coverage.ts`)

Dado un municipio `M` (código DIVIPOLA) de departamento `D`:

1. Tomar coberturas activas y vigentes (fecha de hoy dentro de `validFrom..validUntil`) cuyo asesor esté activo y autorizado.
2. Coincidencias por nivel: **municipio** (M en `municipalities`) → **departamento** (D en `departments`) → **nacional**.
3. Mostrar todos los asesores encontrados, agrupados: "Asesores en {municipio}" y, si existen, "También atienden tu región".
4. Ordenar por `priority` y luego por nombre. Un asesor aparece una sola vez (gana su coincidencia más específica).
5. Sin resultados → bloque de **contacto general** (`SiteSettings.generalContact`), con mensaje claro: "Aún no tenemos asesor asignado en {municipio}. Te atiende nuestro equipo central."

Esta lógica es una función pura con pruebas unitarias.

### 2.5 Singletons

**HomePage**: heroTitle, heroSubtitle, heroImage (foto real de producto), featuredCategories[], featuredProducts[], aboutTeaser { title, text ≤ 300, link }, advisorTeaser { title, text }.

**SiteSettings**: siteName, logo, generalContact { name, whatsapp, email, schedule }, whatsappTemplates { general, product }, social[], legalLinks[], defaultSeo, analytics { gtmId }.

Plantilla de WhatsApp editable, con marcadores:
```
Hola {asesor}, soy profesional de {municipio}. Me interesa el producto
{producto} (Ref. {referencia}): {url}. ¿Me pueden dar más información?
```
El texto final se recorta a un largo seguro y se codifica con `encodeURIComponent`.

### 2.6 Modelos adicionales propuestos (no estaban en la lista)

- **LegalPage**: título, slug, contenido enriquecido, fecha de actualización (privacidad, tratamiento de datos, términos, cookies).
- **AboutPage** (singleton): contenido de `/nosotros`.

Sin estos dos, esas páginas quedarían en código y no serían editables.

### 2.7 Estructura del Studio (lo que verá el administrador)

```
Microdent — Panel de contenido
├─ Inicio (página)
├─ Catálogo
│  ├─ Productos          (filtros: por categoría, por línea, inactivos)
│  ├─ Categorías         (arrastrar para ordenar)
│  ├─ Líneas             (arrastrar para ordenar)
│  └─ Documentos
├─ Asesores
│  ├─ Asesores
│  ├─ Coberturas         (vista por asesor y por departamento)
│  └─ Territorios        (solo lectura para Editores)
├─ Nosotros
├─ Páginas legales
└─ Ajustes del sitio
```

---

## 3. Mapa del sitio

```
/                               Inicio
├─ /productos                   Catálogo  (?q, ?categoria, ?linea, ?orden, ?pagina)
│  └─ /productos/[slug]         Ficha de producto
├─ /nosotros                    Institucional
├─ /asesores                    Localizador (?departamento=05&municipio=05001&producto=slug)
├─ /legal/politica-de-privacidad
├─ /legal/tratamiento-de-datos
├─ /legal/terminos-de-uso
├─ /legal/cookies
├─ /studio                      CMS (noindex, requiere sesión)
├─ /sitemap.xml  /robots.txt
└─ 404
```

Navegación principal: **Inicio · Productos · Nosotros · Asesores** + botón destacado **Contactar asesor** (en el header en escritorio; barra inferior fija en móvil).

Las páginas de categoría se resuelven como filtros (`/productos?categoria=implantes`) con canonical a sí mismas solo para filtros de una categoría; combinaciones de varios filtros llevan canonical a `/productos` para evitar contenido duplicado.

---

## 4. Flujos de usuario

### 4.1 Encontrar un producto por referencia (flujo principal)

```
Inicio → escribe "MD-1234" en buscador del hero
      → /productos?q=MD-1234
      ├─ 1 resultado exacto por referencia → se destaca arriba ("Coincidencia exacta")
      ├─ varios → lista + filtros
      └─ 0 → estado vacío: sugerencias, limpiar filtros, "Pregunta a un asesor"
      → ficha de producto
```
Evento: `search_products { query, results_count, filters }`.

### 4.2 Explorar el catálogo con filtros

```
/productos → abre "Filtros" (sheet en móvil / columna lateral en escritorio)
          → marca Categoría + Línea (combinables) → URL se actualiza
          → ordena (Relevancia · Nombre A–Z · Referencia · Recientes)
          → comparte o vuelve atrás con el navegador: el estado se conserva
```

### 4.3 Consultar un producto con un asesor

```
Ficha → "Consultar con un asesor"
     ├─ ya eligió municipio antes → abre panel con sus asesores directamente
     └─ no → panel/página /asesores?producto=slug
             → elige Departamento → Municipio (combobox con búsqueda)
             → lista de asesores (municipio + región) o contacto general
             → "Escribir por WhatsApp" → wa.me con mensaje que incluye
               producto, referencia y URL
```
Eventos: `advisor_search`, `whatsapp_click { advisor_id, product_ref?, municipality_code, source }`.

### 4.4 Contactar sin producto (botón persistente)

```
Cualquier página → "Contactar asesor" → panel de municipio → asesores → WhatsApp
                                      (mensaje plantilla "general")
```

### 4.5 Descargar documentación

```
Ficha → sección Documentos → clic en "Ficha técnica (PDF, 1,2 MB)"
     → se abre en nueva pestaña · evento file_download { doc_type, product_ref }
```

### 4.6 Flujo del administrador (sin código)

```
Entra a /studio → Productos → "Crear"
→ completa campos (las validaciones avisan lo que falta)
→ "Vista previa" (ve la ficha real como borrador)
→ "Publicar" → visible en la web en segundos
Para retirar: desmarcar "Activo" o "Despublicar".
Asesor nuevo: crear Asesor (con autorización de datos) → crear Cobertura → Publicar.
```

---

## 5. Wireframes

> Baja fidelidad, para validar estructura y jerarquía. La versión visual navegable de la Fase 2 los materializa.

### 5.1 Inicio — móvil (360–430 px)

```
┌──────────────────────────────┐
│ [Logo Microdent]        [☰]  │  header compacto, sticky
├──────────────────────────────┤
│                              │
│  Sistemas de implantes       │  H1 corto (≤ 6 palabras)
│  Microdent                   │
│  Subtítulo de una línea      │
│                              │
│ ┌──────────────────────────┐ │
│ │ 🔍 Nombre o referencia…  │ │  buscador destacado
│ └──────────────────────────┘ │
│ [ Ver catálogo ] [Asesoría ] │
│                              │
│ ┌──────────────────────────┐ │
│ │   FOTO REAL DE PRODUCTO  │ │  imagen LCP (priority)
│ │     (fondo blanco)       │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Categorías                   │
│ ┌──────┐ ┌──────┐            │  grid 2 columnas
│ │ img  │ │ img  │            │
│ │Implan│ │Aditam│            │
│ └──────┘ └──────┘            │
│ ┌──────┐ ┌──────┐            │
├──────────────────────────────┤
│ Productos destacados   Ver → │
│ ┌──────┐ ┌──────┐            │  grid 2 columnas, sin carrusel
│ │ foto │ │ foto │            │
│ │Nombre│ │Nombre│            │
│ │Ref.  │ │Ref.  │            │
│ └──────┘ └──────┘            │
├──────────────────────────────┤
│ Sobre Microdent              │  2–3 líneas + enlace
│ Texto breve…   Conocer más → │
├──────────────────────────────┤
│ ¿Dónde estás?                │  acceso al localizador
│ [Departamento ▾]             │
│ [Municipio    ▾]             │
│ [ Ver asesores ]             │
├──────────────────────────────┤
│ Footer: logo, menú, legales, │
│ contacto general, redes      │
├──────────────────────────────┤
│ [💬 Contactar asesor ]       │  barra inferior fija (CTA persistente)
└──────────────────────────────┘
```

### 5.2 Inicio — escritorio (≥ 1280 px)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo]      Inicio  Productos  Nosotros  Asesores    [Contactar asesor]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Sistemas de implantes                    ┌─────────────────────────┐  │
│  Microdent                                │                         │  │
│  Subtítulo de una línea                   │   FOTO REAL DE PRODUCTO │  │
│                                           │                         │  │
│  ┌──────────────────────────────┐ [Buscar]│                         │  │
│  │ 🔍 Nombre o referencia…      │         │                         │  │
│  └──────────────────────────────┘         └─────────────────────────┘  │
│  [ Ver catálogo ]  [ Hablar con un asesor ]                            │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ Categorías                                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                            │
├────────────────────────────────────────────────────────────────────────┤
│ Productos destacados                                     Ver catálogo →│
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                            │
├────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐   ┌───────────────────────────────────┐  │
│ │ Sobre Microdent           │   │ Encuentra tu asesor               │  │
│ │ texto breve · Conocer más │   │ [Departamento ▾] [Municipio ▾] [→]│  │
│ └───────────────────────────┘   └───────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│ Footer corporativo (4 columnas)                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Catálogo — móvil y escritorio

```
MÓVIL                                   ESCRITORIO
┌──────────────────────────────┐        ┌───────────────────────────────────────────────┐
│ Productos                    │        │ Productos                         128 resultados│
│ ┌──────────────────────────┐ │        │ ┌─────────────────────────────────┐ Orden: [▾] │
│ │ 🔍 Nombre o referencia   │ │        │ │ 🔍 Nombre o referencia          │            │
│ └──────────────────────────┘ │        │ └─────────────────────────────────┘            │
│ [⚙ Filtros (2)]  [Orden ▾]  │        │ ┌────────────┐ Filtros activos: [Implantes ×] │
│ [Implantes ×] [Línea X ×]    │        │ │ CATEGORÍA  │ [Línea X ×]  Limpiar todo     │
│ 24 resultados                │        │ │ ☑ Implantes│ ┌──────┐┌──────┐┌──────┐       │
│ ┌──────┐ ┌──────┐            │        │ │ ☐ Aditam.  │ │ foto ││ foto ││ foto │       │
│ │ foto │ │ foto │            │        │ │ ☐ Instrum. │ │Nombre││Nombre││Nombre│       │
│ │Nombre│ │Nombre│            │        │ │ LÍNEA      │ │Ref.  ││Ref.  ││Ref.  │       │
│ │Ref.  │ │Ref.  │            │        │ │ ☑ Línea X  │ └──────┘└──────┘└──────┘       │
│ └──────┘ └──────┘            │        │ │ ☐ Línea Y  │ …                               │
│ …                            │        │ └────────────┘ [ Cargar más ] / paginación    │
│ [ Cargar más ]               │        └───────────────────────────────────────────────┘
└──────────────────────────────┘
 "Filtros" abre un panel inferior (sheet) con los mismos grupos y botón
 "Ver 24 resultados". Los conteos se muestran por opción.

ESTADO VACÍO
┌──────────────────────────────┐
│  No encontramos "xyz123"     │
│  • Revisa la referencia      │
│  • [Limpiar filtros]         │
│  • [Preguntar a un asesor]   │
└──────────────────────────────┘
```

### 5.4 Ficha de producto

```
MÓVIL                                   ESCRITORIO
┌──────────────────────────────┐        ┌───────────────────────────────────────────────┐
│ Inicio › Productos › Implant.│        │ Inicio › Productos › Implantes › Nombre        │
│ ┌──────────────────────────┐ │        │ ┌──────────────────────┐  CATEGORÍA · LÍNEA    │
│ │                          │ │        │ │                      │  Nombre del producto  │
│ │       FOTO PRINCIPAL     │ │        │ │    FOTO PRINCIPAL    │  Ref. MD-0000  [copiar]│
│ │                          │ │        │ │                      │  Descripción corta     │
│ └──────────────────────────┘ │        │ └──────────────────────┘  [Consultar con un    │
│  ○ ● ○ ○  (miniaturas)       │        │ [▫][▫][▫][▫]               asesor]             │
│ IMPLANTES · LÍNEA X          │        │                           Características      │
│ Nombre del producto          │        │                           • …                  │
│ Ref. MD-0000   [copiar]      │        ├───────────────────────────────────────────────┤
│ Descripción corta            │        │ Especificaciones técnicas  (tabla 2 columnas)  │
│ Características              │        ├───────────────────────────────────────────────┤
│ • …                          │        │ Variantes (tabla con scroll horizontal accesible)│
│ ▸ Especificaciones técnicas  │        │ Ref.     | Diámetro | Longitud |              │
│ ▸ Variantes (12)             │        ├───────────────────────────────────────────────┤
│ ▸ Documentos (3)             │        │ Documentos: [PDF Ficha técnica 1,2 MB] [IFU]   │
│ Productos relacionados       │        ├───────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐            │        │ Productos relacionados (4 tarjetas)           │
├──────────────────────────────┤        └───────────────────────────────────────────────┘
│ [💬 Consultar con un asesor] │  ← en ficha, la barra fija cambia a este texto
└──────────────────────────────┘
 Secciones vacías no se renderizan. Acordeones en móvil; secciones abiertas en escritorio.
```

### 5.5 Localizador de asesores

```
MÓVIL                                   ESCRITORIO
┌──────────────────────────────┐        ┌───────────────────────────────────────────────┐
│ Encuentra tu asesor          │        │ Encuentra tu asesor                            │
│ ┌ Consultando: Nombre (Ref.)┐│        │ [Consultando: Nombre producto · Ref. MD-0000 ×]│
│ Departamento                 │        │ [Departamento ▾]  [Municipio ▾]  [Buscar]      │
│ [Antioquia            ▾]     │        ├───────────────────────────────────────────────┤
│ Municipio                    │        │ Asesores en Medellín (2)                       │
│ [🔍 Medellín          ▾]     │        │ ┌─────────────────┐ ┌─────────────────┐        │
│ [ Ver asesores ]             │        │ │ (foto) Nombre   │ │ (foto) Nombre   │        │
├──────────────────────────────┤        │ │ Asesor comercial│ │ Asesor comercial│        │
│ Asesores en Medellín (2)     │        │ │ [💬 WhatsApp]   │ │ [💬 WhatsApp]   │        │
│ ┌──────────────────────────┐ │        │ └─────────────────┘ └─────────────────┘        │
│ │ (foto) Nombre            │ │        │ También atienden Antioquia (1)                 │
│ │ Asesor comercial         │ │        │ ┌─────────────────┐                            │
│ │ [💬 Escribir por WhatsApp]│ │        │ └─────────────────┘                            │
│ └──────────────────────────┘ │        └───────────────────────────────────────────────┘
│ También atienden tu región   │
│ …                            │        SIN COBERTURA
└──────────────────────────────┘        "Aún no tenemos asesor asignado en {municipio}.
                                         Te atiende nuestro equipo central." [💬 WhatsApp]
```

---

## 6. Sistema de diseño

### 6.1 Color y contraste (WCAG AA verificado)

Los colores de marca se respetan, pero **ninguno de los dos alcanza 4,5:1 sobre blanco para texto normal**, así que se definen usos:

| Token | Hex | Contraste sobre blanco | Uso permitido |
|---|---|---|---|
| `brand-turquoise` | #A9E1E7 | 1,44 : 1 | Solo fondos, bandas, ilustración, estados seleccionados (con texto oscuro encima: #0F172A logra 12,4:1) |
| `brand-accent` | #1995AD | 3,53 : 1 | Íconos, bordes, anillo de foco, texto **grande** (≥ 24 px o ≥ 19 px negrita) |
| `accent-strong` (derivado) | #0E6E80 | 5,90 : 1 | Botón primario (texto blanco), enlaces, texto acentuado pequeño |
| `accent-deep` (derivado) | #0B5563 | 8,42 : 1 | Hover/active del primario; texto sobre turquesa (5,86:1) |
| `ink` | #1A2B30 | 14,66 : 1 | Texto principal |
| `ink-muted` | #475569 | 7,58 : 1 | Texto secundario |
| `ink-subtle` | #64748B | 4,76 : 1 | Metadatos (referencias, conteos) |
| `surface` | #FFFFFF | — | Fondo principal |
| `surface-alt` | #F4F6F7 | — | Secciones alternas, fondos de tarjeta de imagen |
| `border` | #E2E8EA | — | Separadores (decorativo) |
| `whatsapp` | #0B7A45 (botón) | ≥ 4,5 : 1 | Solo botón de WhatsApp, con ícono + texto |

> Los tonos derivados (#0E6E80, #0B5563) deben aprobarse con el manual de marca. Son necesarios para cumplir AA en botones con texto blanco.

### 6.2 Tipografía

- Familias: **las del manual oficial de Microdent** (pendiente recibir archivos y licencia web). Mientras tanto: `Inter` (texto) como sustituto neutro, cargada con `next/font` (sin CLS).
- Escala (móvil → escritorio): Display 36→56 · H1 30→44 · H2 24→32 · H3 20→24 · Cuerpo 16→17 · Pequeño 14 · Etiqueta 12 (mayúsculas, tracking +0,08em).
- Interlineado: 1,5 cuerpo; 1,15 titulares. Ancho de línea máx. ~70 caracteres.
- Las referencias de producto en `font-variant-numeric: tabular-nums` para lectura rápida.

### 6.3 Espaciado, retícula y forma

- Escala de 4 px (Tailwind por defecto). Secciones: 64 px móvil / 112 px escritorio.
- Contenedor máx. 1280 px; 4 columnas móvil, 12 escritorio; márgenes 16 / 24 / 32 px.
- Radios: 8 px (controles), 12 px (tarjetas). Sombras mínimas; se prefieren bordes de 1 px.
- Imágenes de producto: proporción fija 4:3 o 1:1 por categoría, `object-contain`, fondo `surface-alt`, nunca recortadas ni filtradas.

### 6.4 Interacción y accesibilidad

- Foco visible: anillo de 2 px `brand-accent` + desplazamiento 2 px en todos los elementos interactivos.
- Objetivos táctiles ≥ 44 × 44 px.
- Movimiento: solo transiciones de 150–200 ms; se desactivan con `prefers-reduced-motion`.
- Sin carruseles automáticos. La galería es manual, con miniaturas y teclado.
- "Saltar al contenido", landmarks (`header`, `nav`, `main`, `footer`), un solo `h1` por página.
- Combobox de municipio y filtros basados en Radix (vía shadcn), con soporte de lector de pantalla y teclado.
- Mensajes de resultados anunciados con `aria-live="polite"` ("24 resultados").

---

## 7. Componentes reutilizables

| Grupo | Componente | Descripción |
|---|---|---|
| Layout | `SiteHeader` | Logo, menú, CTA "Contactar asesor"; menú móvil en `Sheet` |
| | `MobileContactBar` | Barra inferior fija; texto contextual (general / producto) |
| | `SiteFooter` | Menú, contacto general, legales, redes |
| | `SkipLink`, `Container`, `Section`, `Breadcrumbs` | |
| Catálogo | `SearchBox` | Input con debounce, botón limpiar, envía a `/productos?q=` |
| | `FilterPanel` / `FilterSheet` | Grupos de checkbox (categoría, línea) con conteos |
| | `ActiveFilters` | Chips eliminables + "Limpiar todo" |
| | `SortSelect` | Orden |
| | `ProductGrid`, `ProductCard` | Foto, nombre, referencia; tarjeta enlazada completa |
| | `EmptyState` | Reutilizable (catálogo, cobertura, 404) |
| | `ResultCount` | `aria-live` |
| Producto | `ProductGallery` | Imagen principal + miniaturas, teclado, sin autoplay |
| | `ReferenceBadge` | Referencia con botón copiar |
| | `FeatureList`, `SpecTable`, `VariantTable` | Se ocultan si no hay datos |
| | `DocumentList` | Tipo, tamaño, idioma; dispara `file_download` |
| | `RelatedProducts` | |
| | `ConsultAdvisorButton` | Abre localizador con contexto del producto |
| Asesores | `TerritoryPicker` | Departamento + municipio (combobox buscable, por código DIVIPOLA) |
| | `AdvisorList`, `AdvisorCard` | Agrupados por nivel de cobertura |
| | `WhatsAppButton` | Enlace `wa.me`, evento `whatsapp_click` |
| | `GeneralContactCard` | Sin cobertura |
| | `ProductContextBanner` | "Consultando: Nombre (Ref.)" |
| Base (shadcn) | `Button`, `Sheet`, `Command`, `Popover`, `Checkbox`, `Select`, `Accordion`, `Badge`, `Separator`, `Skeleton` | |
| Utilidades | `buildWhatsAppLink`, `resolveCoverage`, `track`, `buildMetadata`, `productJsonLd` | Funciones puras con pruebas |

---

## 8. Plan de implementación

| Fase | Entregable | Validación del cliente |
|---|---|---|
| **1. Arquitectura y diseño** (este documento) | Arquitectura, modelo, mapa, flujos, wireframes, sistema de diseño | ✅ Aprobar estructura, colores derivados y modelos |
| **2. Prototipo visual navegable** | Next.js + Tailwind + shadcn con **datos ficticios locales** (`src/mocks`, cada dato con etiqueta "FICTICIO"). Todas las páginas, filtros por URL, localizador con DIVIPOLA real y asesores ficticios, enlaces WhatsApp a número de prueba, banner visible "Prototipo — datos de ejemplo". Despliegue de preview en Vercel | ✅ Validar diseño, navegación y textos |
| **3. CMS** | Esquemas Sanity, Studio en español en `/studio`, validaciones, orden, previsualización de borradores, importación DIVIPOLA, seed ficticio en dataset `development`. Sustituir mocks por GROQ | ✅ Prueba del panel por el equipo administrador |
| **4. SEO, analítica y calidad** | Metadata, sitemap, canonical, OG, JSON-LD (`Organization`, `Product` sin precio, `BreadcrumbList`), eventos, banner de cookies, pruebas e2e + axe, Lighthouse en CI | ✅ Revisión de métricas y accesibilidad |
| **5. Carga real y salida** | Carga de productos/asesores reales (por el cliente o asistida con importador CSV), dominio, dataset `production`, capacitación del equipo (guía corta) | ✅ Aprobación de salida |

Criterios técnicos de terminado para cada fase: `typecheck` + `lint` + pruebas en verde; Lighthouse móvil ≥ 90 en rendimiento y 100 en accesibilidad en las páginas clave; sin errores de axe.

### 8.1 Analítica (definición previa)

Capa única `track(event, params)` → `window.dataLayer` (GTM/GA4). Se activa solo tras el consentimiento de cookies.

| Evento | Parámetros | Nota |
|---|---|---|
| `view_item` | product_ref, product_slug, category, line | Visualización de ficha |
| `search_products` | query, results_count, category[], line[] | Con debounce; no envía búsquedas vacías |
| `advisor_search` | department_code, municipality_code, results_count, coverage_level | |
| `whatsapp_click` | advisor_id (id interno, no nombre), municipality_code, product_ref?, source (header/ficha/localizador) | Se reporta como **intención de contacto**, nunca como venta o conversión de compra |
| `file_download` | document_type, product_ref, file_name | |

---

## 9. Riesgos y dependencias

| # | Riesgo / dependencia | Impacto | Mitigación |
|---|---|---|---|
| 1 | **Manual de marca** (logotipo vectorial, tipografías y su licencia web) no disponible | Alto en identidad | Usar sustitutos neutros en Fase 2; reemplazo por tokens sin tocar componentes |
| 2 | **Fotografías reales de producto** (resolución, fondo, derechos de uso) | Alto en hero y LCP | Solicitar originales ≥ 2000 px; se usan sin modificar. En Fase 2 se usan marcadores grises etiquetados, no fotos de otras marcas |
| 3 | **Información técnica verificada** | Alto (legal y reputacional) | Campo `source` obligatorio por característica; secciones vacías no se muestran; revisión por responsable técnico antes de publicar |
| 4 | **Regulación de publicidad de dispositivos médicos** en Colombia (INVIMA, registro sanitario) | Alto | Validar con el área regulatoria qué mensajes y datos pueden publicarse; campo de registro sanitario previsto |
| 5 | **Datos personales de asesores** (Ley 1581 de 2012) | Alto | Autorización obligatoria para publicar; números corporativos; mínimos datos visibles; política de tratamiento publicada |
| 6 | Contraste de colores de marca | Medio | Tonos derivados (#0E6E80 / #0B5563) a aprobar |
| 7 | Exactitud de DIVIPOLA (cambios de municipios) | Bajo | Importación desde fuente oficial del DANE, idempotente por código; re-ejecutable |
| 8 | Plan de Sanity (usuarios, roles, cuotas) | Medio | El plan gratuito cubre el arranque; validar número de editores y roles personalizados |
| 9 | TypeScript 7 recién publicado | Bajo | Fijado a 5.9.3; revisar migración más adelante |
| 10 | Dominio, cuenta Vercel, cuenta Sanity, GTM a nombre del cliente | Medio | Crear cuentas a nombre de Microdent / distribuidor desde el inicio |
| 11 | Tamaño del catálogo y volumen de variantes | Bajo | Búsqueda GROQ suficiente hasta ~2.000 productos; alternativa definida |
| 12 | Medición: clic ≠ venta | Medio | Reportar "intención de contacto"; si se quiere medir ventas, requiere CRM (fuera de alcance) |

---

## 10. Decisiones que necesitamos validar

1. ¿Aprobamos los **colores derivados** #0E6E80 y #0B5563 para botones y enlaces (necesarios para AA)?
2. ¿Agregamos los modelos **LegalPage** y **AboutPage** para que Nosotros y legales sean editables?
3. ¿El orden comercial se define **por cobertura** (un asesor puede ser 1.º en un municipio y 3.º en otro), como se propone?
4. ¿Se muestra el **número de WhatsApp** del asesor en pantalla, o solo el botón?
5. ¿Quién es el **contacto general** cuando no hay cobertura (nombre/área y número)?
6. ¿Pueden compartir el **manual de marca**, logotipo y algunas **fotos reales** para la Fase 2? (Si no, usamos marcadores).
7. ¿Hay **registro sanitario INVIMA** u otra información regulatoria que deba mostrarse por producto?
8. ¿Cuántas personas administrarán el contenido y con qué permisos?

Con estas respuestas avanzamos a la **Fase 2: prototipo visual navegable con datos ficticios**.
