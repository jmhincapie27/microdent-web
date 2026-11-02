import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage, getLegalPages } from "@/lib/content";
import { atLeastOne } from "@/lib/static-params";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return atLeastOne((await getLegalPages()).map((p) => ({ slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const page = await getLegalPage((await params).slug);
  if (!page) return {};
  return buildMetadata({ title: page.title, description: page.body[0] ?? page.title, path: `/legal/${page.slug}` });
}

export default async function LegalPageView({ params }: PageProps<"/legal/[slug]">) {
  const page = await getLegalPage((await params).slug);
  if (!page) notFound();
  const updated = new Date(`${page.updatedAt}T12:00:00`).toLocaleDateString("es-CO", { dateStyle: "long" });
  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <p className="eyebrow">Información legal</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{page.title}</h1>
      <p className="mt-2 text-sm text-ink-subtle">Actualizado el {updated}</p>
      <div className="mt-8 space-y-4 text-ink-muted">
        {page.body.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>
    </article>
  );
}
