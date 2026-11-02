import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { Lightbulb } from "lucide-react";
import type { RichText as RichTextValue } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Muestra el texto enriquecido del CMS con la tipografía de la marca.
 * `headingLevel` ajusta los títulos internos a la jerarquía de la página
 * (ej.: dentro de una sección que ya tiene un h2, «Título» se muestra como h3).
 */
function isInternal(href: string) {
  return href.startsWith("/");
}

function buildComponents(headingLevel: 2 | 3): PortableTextComponents {
  const H = (`h${headingLevel}` as "h2" | "h3");
  const H2 = (`h${headingLevel + 1}` as "h3" | "h4");
  return {
    block: {
      normal: ({ children }) => <p className="leading-relaxed text-ink-muted">{children}</p>,
      h2: ({ children }) => <H className="mt-10 text-2xl font-bold first:mt-0">{children}</H>,
      h3: ({ children }) => <H2 className="mt-8 text-xl font-semibold first:mt-0">{children}</H2>,
      lead: ({ children }) => <p className="text-lg leading-relaxed text-ink sm:text-xl">{children}</p>,
      small: ({ children }) => <p className="text-sm leading-relaxed text-ink-subtle">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-glauco pl-4 text-lg text-ink italic">{children}</blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-ink-muted marker:text-antracita">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal space-y-2 pl-6 text-ink-muted marker:text-antracita">{children}</ol>,
    },
    listItem: ({ children }) => <li className="leading-relaxed">{children}</li>,
    marks: {
      strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      underline: ({ children }) => <span className="underline underline-offset-4">{children}</span>,
      link: ({ children, value }) => {
        const href = (value?.href as string | undefined) ?? "#";
        const cls = "text-ink underline decoration-glauco decoration-2 underline-offset-4 hover:decoration-antracita";
        return isInternal(href) ? (
          <Link href={href} className={cls}>
            {children}
          </Link>
        ) : (
          <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
            {children}
            {href.startsWith("http") && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
          </a>
        );
      },
    },
    types: {
      richImage: ({ value }) => {
        const v = value as { src?: string; width?: number; height?: number; alt?: string; caption?: string; size?: string };
        if (!v.src || !v.width || !v.height) return null;
        return (
          <figure className={cn("my-8", v.size === "full" ? "w-full" : "mx-auto max-w-xl")}>
            <Image
              src={v.src}
              alt={v.alt ?? ""}
              width={v.width}
              height={v.height}
              sizes={v.size === "full" ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 640px) 576px, 100vw"}
              className="h-auto w-full rounded-lg bg-white"
            />
            {v.caption && <figcaption className="mt-2 text-center text-sm text-ink-subtle">{v.caption}</figcaption>}
          </figure>
        );
      },
      ctaButton: ({ value }) => {
        const v = value as { label?: string; href?: string };
        if (!v.label || !v.href) return null;
        return (
          <p className="my-6">
            <Button asChild size="lg">
              {isInternal(v.href) ? (
                <Link href={v.href}>{v.label}</Link>
              ) : (
                <a href={v.href} target="_blank" rel="noopener noreferrer">
                  {v.label}
                </a>
              )}
            </Button>
          </p>
        );
      },
      callout: ({ value }) => {
        const v = value as { title?: string; text?: string };
        return (
          <aside className="my-6 flex gap-3 rounded-lg border-l-4 border-glauco bg-glauco-50 p-4">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-antracita" aria-hidden />
            <div>
              {v.title && <p className="font-display font-semibold text-ink">{v.title}</p>}
              {v.text && <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink-muted">{v.text}</p>}
            </div>
          </aside>
        );
      },
    },
  };
}

export function RichText({
  value,
  headingLevel = 2,
  className,
}: {
  value: RichTextValue | undefined;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  if (!value?.length) return null;
  return (
    <div className={cn("space-y-4", className)}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PortableText value={value as any} components={buildComponents(headingLevel)} />
    </div>
  );
}
