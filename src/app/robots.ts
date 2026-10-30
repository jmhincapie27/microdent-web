import type { MetadataRoute } from "next";
import { IS_PROTOTYPE } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Mientras sea prototipo con datos ficticios, no se indexa nada.
  if (IS_PROTOTYPE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/api"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
