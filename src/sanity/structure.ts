import type { StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentPdfIcon } from "@sanity/icons/DocumentPdf";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { HomeIcon } from "@sanity/icons/Home";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { PackageIcon } from "@sanity/icons/Package";
import { PinIcon } from "@sanity/icons/Pin";
import { TagIcon } from "@sanity/icons/Tag";
import { ThListIcon } from "@sanity/icons/ThList";
import { UserIcon } from "@sanity/icons/User";

/** Menú del panel en español, agrupado como lo usa el equipo administrador. */
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Microdent — Contenido")
    .items([
      S.listItem().title("Página de inicio").icon(HomeIcon).child(S.document().schemaType("homePage").documentId("homePage")),
      S.divider(),
      S.listItem()
        .title("Catálogo")
        .icon(PackageIcon)
        .child(
          S.list()
            .title("Catálogo")
            .items([
              orderableDocumentListDeskItem({ type: "product", title: "Productos (arrastre para ordenar)", icon: PackageIcon, S, context }),
              S.listItem()
                .title("Productos por categoría")
                .icon(TagIcon)
                .child(
                  S.documentTypeList("productCategory")
                    .title("Elija una categoría")
                    .child((categoryId) =>
                      S.documentList()
                        .title("Productos")
                        .schemaType("product")
                        .filter('_type == "product" && category._ref == $categoryId')
                        .params({ categoryId }),
                    ),
                ),
              S.listItem()
                .title("Productos inactivos")
                .icon(PackageIcon)
                .child(S.documentList().title("Productos inactivos").schemaType("product").filter('_type == "product" && active == false')),
              S.divider(),
              orderableDocumentListDeskItem({ type: "productCategory", title: "Categorías", icon: TagIcon, S, context }),
              orderableDocumentListDeskItem({ type: "productLine", title: "Líneas de producto", icon: ThListIcon, S, context }),
              S.documentTypeListItem("productDocument").title("Documentos (PDF)").icon(DocumentPdfIcon),
            ]),
        ),
      S.listItem()
        .title("Asesores")
        .icon(UserIcon)
        .child(
          S.list()
            .title("Asesores")
            .items([
              S.documentTypeListItem("advisor").title("Asesores").icon(UserIcon),
              S.documentTypeListItem("advisorCoverage").title("Zonas comerciales").icon(EarthGlobeIcon),
              S.listItem()
                .title("Departamentos")
                .icon(PinIcon)
                .child(S.documentList().title("Departamentos").schemaType("territory").filter('_type == "territory" && kind == "department"').defaultOrdering([{ field: "name", direction: "asc" }])),
              S.listItem()
                .title("Municipios")
                .icon(PinIcon)
                .child(S.documentList().title("Municipios").schemaType("territory").filter('_type == "territory" && kind == "municipality"').defaultOrdering([{ field: "name", direction: "asc" }])),
            ]),
        ),
      S.divider(),
      S.listItem().title("Nosotros").icon(InfoOutlineIcon).child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.documentTypeListItem("legalPage").title("Páginas legales").icon(DocumentTextIcon),
      S.divider(),
      S.listItem().title("Ajustes del sitio").icon(CogIcon).child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
