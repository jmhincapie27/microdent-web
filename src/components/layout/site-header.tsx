"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { NAV_LINKS, contactHref, isActive } from "./nav-links";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const contact = contactHref(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="shrink-0" aria-label="Microdent — Inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center px-4 font-display text-sm font-medium text-ink-muted transition-colors hover:text-ink",
                      active &&
                        "font-semibold text-ink after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full after:bg-glauco",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden md:inline-flex">
            <Link href={contact}>
              <MessageCircle aria-hidden />
              Contactar asesor
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                <Menu className="size-6!" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined}>
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav aria-label="Principal (móvil)" className="flex-1 overflow-y-auto px-2 py-3">
                <ul>
                  {NAV_LINKS.map((l) => {
                    const active = isActive(pathname, l.href);
                    return (
                      <li key={l.href}>
                        <SheetClose asChild>
                          <Link
                            href={l.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex min-h-12 items-center rounded-md px-3 font-display text-base text-ink-muted hover:bg-surface-alt",
                              active && "bg-glauco-100 font-semibold text-ink",
                            )}
                          >
                            {l.label}
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="border-t border-line p-4">
                <SheetClose asChild>
                  <Button asChild className="w-full" size="lg">
                    <Link href={contact}>
                      <MessageCircle aria-hidden />
                      Contactar asesor
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
