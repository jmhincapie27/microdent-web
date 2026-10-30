import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normaliza texto para búsquedas: minúsculas, sin tildes ni signos. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Referencias: mayúsculas y sin espacios ni guiones, para comparar "md-12 34" con "MD1234". */
export function normalizeReference(ref: string): string {
  return ref.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
