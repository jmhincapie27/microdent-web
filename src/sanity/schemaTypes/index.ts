import { product, productCategory, productDocument, productLine } from "./catalog";
import { advisor, advisorCoverage, territory } from "./advisors";
import { aboutPage, homePage, legalPage, siteSettings } from "./pages";
import { richText } from "./rich-text";

export const schemaTypes = [
  richText,
  product,
  productCategory,
  productLine,
  productDocument,
  advisor,
  advisorCoverage,
  territory,
  homePage,
  aboutPage,
  legalPage,
  siteSettings,
];

/** Documentos únicos: se editan, no se crean ni se duplican. */
export const SINGLETONS = ["homePage", "aboutPage", "siteSettings"] as const;
