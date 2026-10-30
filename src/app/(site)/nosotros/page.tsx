import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getAboutPage, getHubCities } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return buildMetadata({ title: page.title, description: page.intro, path: "/nosotros", image: page.image });
}

export default async function AboutPage() {
  const [page, hubs] = await Promise.all([getAboutPage(), getHubCities()]);
  return (
    <>
      <section className="border-b border-line bg-glauco-50">
        <div className="container-page grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Microdent Implant System</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-5xl">{page.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{page.intro}</p>
          </div>
          {page.image && (
            <Image
              src={page.image.src}
              alt={page.image.alt}
              width={page.image.width}
              height={page.image.height}
              priority
              sizes="(min-width:1024px) 560px, 100vw"
              className="h-auto w-full rounded-lg bg-white"
            />
          )}
        </div>
      </section>

      <div className="container-page grid gap-10 py-14 sm:py-20 md:grid-cols-3">
        {page.sections.map((s) => (
          <section key={s.title}>
            <span aria-hidden className="block h-1 w-10 rounded-full bg-glauco" />
            <h2 className="mt-4 text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-ink-muted">{s.text}</p>
          </section>
        ))}
      </div>

      <section className="container-page pb-16">
        <div className="flex flex-col items-start gap-6 rounded-lg bg-antracita-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between on-dark">
          <div>
            <h2 className="text-2xl font-bold text-white">Presencia en Colombia</h2>
            <p className="mt-2 text-white/85">{hubs.join(" · ")}</p>
          </div>
          <Button asChild variant="onDark" size="lg">
            <Link href="/asesores">
              <MessageCircle aria-hidden />
              Encontrar mi asesor
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
