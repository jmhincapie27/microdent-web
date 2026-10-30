import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, MessageCircle, Wrench } from "lucide-react";
import { getCategories, getHomePage, getProductsByIds } from "@/lib/content";
import { departments } from "@/lib/territories";
import { buildMetadata } from "@/lib/seo";
import { HeroSearchBox } from "@/components/catalog/search-box";
import { ProductCard } from "@/components/catalog/product-card";
import { TerritoryPicker } from "@/components/advisors/territory-picker";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage();
  return buildMetadata({
    title: "Microdent Implant System — Catálogo de productos",
    description: home.heroSubtitle,
    path: "/",
    image: home.heroImage,
  });
}

export default async function HomePage() {
  const home = await getHomePage();
  const [categories, featured] = await Promise.all([getCategories(), getProductsByIds(home.featuredProductIds)]);
  const featuredCategories = home.featuredCategoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const catTitle = new Map(categories.map((c) => [c.id, c.title]));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-glauco-50 to-white">
        <div className="container-page grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-20">
          <div>
            <p className="eyebrow">{home.heroEyebrow}</p>
            <h1 className="mt-3 text-[2.25rem] leading-[1.08] font-bold sm:text-5xl lg:text-[3.5rem]">
              {home.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{home.heroSubtitle}</p>
            <div className="mt-8 max-w-xl">
              <HeroSearchBox />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" size="lg">
                <Link href="/productos">
                  Ver catálogo
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="accent" size="lg">
                <Link href="/asesores">
                  <MessageCircle aria-hidden />
                  Hablar con un asesor
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src={home.heroImage.src}
              alt={home.heroImage.alt}
              width={home.heroImage.width}
              height={home.heroImage.height}
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section aria-labelledby="categorias" className="container-page py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 id="categorias" className="text-2xl font-bold sm:text-3xl">
            Categorías
          </h2>
          <Link href="/productos" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline">
            Todo el catálogo <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featuredCategories.map((c, i) => (
            <li key={c.id}>
              <Link
                href={`/productos?categoria=${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white hover:border-antracita"
              >
                <div className="relative aspect-[4/3] bg-white">
                  {c.image ? (
                    <Image src={c.image.src} alt="" fill sizes="(min-width:1024px) 300px, 50vw" className="object-contain p-4" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-glauco-50 text-ink-muted">
                      {i % 2 ? <Layers className="size-10" aria-hidden /> : <Wrench className="size-10" aria-hidden />}
                    </div>
                  )}
                </div>
                <span className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 font-display text-sm font-semibold sm:text-base">
                  {c.title}
                  <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Productos destacados */}
      <section aria-labelledby="destacados" className="bg-surface-alt py-14 sm:py-20">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <h2 id="destacados" className="text-2xl font-bold sm:text-3xl">
              Productos destacados
            </h2>
            <Link href="/productos" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline">
              Ver catálogo <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} categoryTitle={catTitle.get(p.categoryId)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Institucional + localizador */}
      <section className="container-page grid gap-6 py-14 sm:py-20 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-line p-6 sm:p-8">
          <h2 className="text-2xl font-bold">{home.about.title}</h2>
          <p className="mt-3 text-ink-muted">{home.about.text}</p>
          <div className="mt-auto pt-6">
            <Button asChild variant="link">
              <Link href="/nosotros">
                Conocer más <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-glauco-100 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">{home.advisorTeaser.title}</h2>
          <p className="mt-3 text-ink-muted">{home.advisorTeaser.text}</p>
          <div className="mt-6">
            <TerritoryPicker
              departments={departments}
              municipalities={[]}
              departamento=""
              municipio=""
              producto=""
              compact
              navigation="push"
            />
          </div>
        </div>
      </section>
    </>
  );
}
