import { defineQuery } from "next-sanity";

/**
 * Consultas GROQ. Cada una devuelve exactamente la forma de los tipos de
 * `src/lib/content/types.ts`, así las páginas no saben de dónde viene el contenido.
 * Solo se leen documentos publicados y activos.
 */

const image = /* groq */ `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "alt": coalesce(alt, "")
}`;

export const CATEGORIES_QUERY = defineQuery(`*[_type == "productCategory" && active != false && defined(slug.current)] | order(orderRank) {
  "id": _id, title, "slug": slug.current, description,
  "image": select(defined(image.asset) => image${image}, null),
  "featured": featured == true, "active": true
}`);

export const LINES_QUERY = defineQuery(`*[_type == "productLine" && active != false && defined(slug.current)] | order(orderRank) {
  "id": _id, title, "slug": slug.current, description, "active": true
}`);

const productFields = /* groq */ `
  "id": _id, name, reference, "slug": slug.current,
  "categoryId": category._ref, "lineId": line._ref,
  "images": coalesce(images[defined(asset)]${image}, []),
  shortDescription,
  "features": coalesce(features[]{text, source}, []),
  "specs": coalesce(specs[]{label, value, unit}, []),
  "variants": coalesce(variants[active != false]{reference, "attributes": coalesce(attributes[]{label, value}, []), "active": true}, []),
  "documentIds": coalesce(documents[]._ref, []),
  "relatedIds": coalesce(related[]._ref, []),
  regulatory, seo,
  "featured": featured == true, "active": true,
  "publishedAt": coalesce(publishedAt, _createdAt)
`;

export const PRODUCTS_QUERY = defineQuery(`*[_type == "product" && active != false && defined(slug.current) && defined(category)] | order(orderRank) {
  ${productFields}
}`);

export const DOCUMENTS_QUERY = defineQuery(`*[_type == "productDocument" && active != false && _id in $ids] {
  "id": _id, title, type, "url": file.asset->url, "size": coalesce(file.asset->size, 0),
  "language": coalesce(language, "es"), version, "active": true
}`);

export const ADVISORS_QUERY = defineQuery(`*[_type == "advisor"] {
  "id": _id, publicName, role, whatsapp,
  "photo": select(defined(photo.asset) => photo${image}, null),
  "consent": { "authorized": consent.authorized == true, "date": coalesce(consent.date, "") },
  "active": active != false
}`);

export const COVERAGES_QUERY = defineQuery(`*[_type == "advisorCoverage"] {
  "id": _id, zoneName, hubCity,
  "departmentCodes": coalesce(departmentCodes, []) + coalesce(departments[]->code, []),
  "municipalityCodes": coalesce(municipalities[]->code, []),
  "advisorIds": coalesce(advisors[]._ref, []),
  validFrom, validUntil,
  "active": active != false
}`);

export const HOME_QUERY = defineQuery(`*[_id == "homePage"][0] {
  heroEyebrow, heroTitle, heroSubtitle,
  "heroImage": select(defined(heroImage.asset) => heroImage${image}, null),
  "featuredCategoryIds": coalesce(featuredCategories[]._ref, []),
  "featuredProductIds": coalesce(featuredProducts[]._ref, []),
  about, advisorTeaser
}`);

export const ABOUT_QUERY = defineQuery(`*[_id == "aboutPage"][0] {
  title, intro, "sections": coalesce(sections[]{title, text}, []),
  "image": select(defined(image.asset) => image${image}, null)
}`);

export const LEGAL_QUERY = defineQuery(`*[_type == "legalPage" && defined(slug.current)] | order(title asc) {
  title, "slug": slug.current, updatedAt, "body": coalesce(body, [])
}`);

export const SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0] {
  fallbackContact, whatsappTemplates, email, "social": coalesce(social[]{label, url}, [])
}`);
