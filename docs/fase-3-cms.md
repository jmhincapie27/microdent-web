# Fase 3 — CMS (Sanity): guía de configuración y uso

> Proyecto Sanity: `u536aqfy` · dataset `production` · panel en **`/studio`**

El sitio sigue mostrando los **datos ficticios** hasta que se active el contenido real (paso 6).
Así pueden cargar productos y asesores con calma sin que el sitio público quede vacío.

---

## 1. Variables de entorno en Vercel

Vercel → proyecto → *Settings* → *Environment Variables*:

| Variable | Valor | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://su-dominio` (o la URL de Vercel) | Canonical, sitemap y enlace del producto en WhatsApp |
| `SANITY_REVALIDATE_SECRET` | Una clave larga al azar (la misma del paso 4) | Asegura que solo Sanity pueda actualizar el sitio |
| `NEXT_PUBLIC_CONTENT_SOURCE` | `sanity` — **solo en el paso 6** | Cambia de datos ficticios a contenido real |

Después de agregar o cambiar variables: *Deployments* → último despliegue → *Redeploy*.

## 2. Permitir el panel en su dominio (CORS)

[sanity.io/manage](https://www.sanity.io/manage) → proyecto Microdent → **API** → **CORS origins** → *Add CORS origin*:

- `https://su-dominio` (y la URL de Vercel si es distinta) → marcar **Allow credentials**.
- `http://localhost:3000` → marcar **Allow credentials** (solo para desarrollo).

Sin esto, `/studio` muestra un aviso de CORS y no deja iniciar sesión.

## 3. Usuarios administradores

sanity.io/manage → **Members** → *Invite members*. Para 1–2 personas, rol **Administrator** o **Editor**.

## 4. Actualización automática del sitio al publicar (webhook)

sanity.io/manage → **API** → **Webhooks** → *Create webhook*:

| Campo | Valor |
|---|---|
| Name | Actualizar sitio |
| URL | `https://su-dominio/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | *(vacío)* |
| Projection | `{_type}` |
| HTTP method | POST |
| Secret | El mismo valor de `SANITY_REVALIDATE_SECRET` |

Sin webhook, los cambios igual aparecen, pero con hasta 1 hora de demora.

## 5. Primeros pasos en el panel (`/studio`)

1. **Territorios** (menú superior) → *Cargar / actualizar territorios*. Carga los 33 departamentos y 1.122 municipios. Una sola vez.
2. **Ajustes del sitio** → contacto general (Dirección Comercial y Administrativa) con su WhatsApp, y revisar los mensajes de WhatsApp → *Publish*.
3. **Catálogo → Categorías** y **Líneas de producto** (se ordenan arrastrando).
4. **Catálogo → Documentos (PDF)**: fichas técnicas, IFU, catálogos.
5. **Catálogo → Productos**: nombre, referencia, categoría, fotos con texto alternativo, descripción, características (con su fuente), especificaciones, variantes, documentos, relacionados, registro INVIMA → *Publish*.
6. **Asesores → Asesores**: nombre público, cargo, WhatsApp corporativo y **autorización de datos** (sin ella no aparece en el sitio).
7. **Asesores → Zonas comerciales**: una por zona (Medellín, Eje Cafetero, Bogotá, Cali, Costa, Neiva, Santander, Ibagué, Quibdó, Cúcuta). Elegir departamentos, opcionalmente municipios puntuales, y los asesores **en el orden en que deben aparecer**.
8. **Página de inicio**, **Nosotros** y **Páginas legales** (privacidad, tratamiento de datos, términos, cookies).

Cómo funciona la publicación:

- Todo cambio queda como **borrador** hasta pulsar **Publish**. El sitio solo muestra lo publicado.
- **Activo** desmarcado = oculto en el sitio, sin borrarlo.
- El historial permite ver y restaurar versiones anteriores.
- El panel valida: referencias duplicadas, textos alternativos, formato de WhatsApp (`+573001234567`), autorización de datos, etc.

## 6. Activar el contenido real

Cuando el catálogo y los asesores estén cargados y revisados:

1. Vercel → agregar `NEXT_PUBLIC_CONTENT_SOURCE` = `sanity` → *Redeploy*.
2. Desaparece el aviso de «Prototipo», los botones de WhatsApp abren el número de cada asesor y el sitio queda **indexable** por buscadores (sitemap y robots activos).

Para volver al prototipo, borrar la variable y redesplegar.

## Notas técnicas

- El dataset es público para lectura (lo normal en sitios web): **no guarde datos privados** en el CMS. Los campos «Fuente (uso interno)» no se muestran en el sitio, pero son legibles por API.
- Las alertas de `npm audit` provienen de las herramientas de línea de comandos de Sanity (procesan archivos locales), no del sitio publicado. Se revisarán con las siguientes versiones de Sanity.
- La herramienta «Territorios» usa una copia de DIVIPOLA cruzada de dos fuentes públicas (el portal del DANE no era accesible desde el entorno de desarrollo). Validar contra el archivo oficial del DANE antes de salir a producción.
- Pendiente para la Fase 4: vista previa de borradores directamente en el sitio (Presentation / Draft Mode), banner de cookies + Google Tag Manager, pruebas e2e en CI.
