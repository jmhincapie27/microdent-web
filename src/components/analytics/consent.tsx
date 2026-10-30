"use client";

import Link from "next/link";
import Script from "next/script";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

/**
 * Consentimiento de cookies + Google Tag Manager.
 * - Si no hay NEXT_PUBLIC_GTM_ID, el sitio no usa cookies de analítica y no muestra el aviso.
 * - GTM solo se carga después de «Aceptar». Antes, los eventos quedan en `dataLayer` sin enviarse.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const KEY = "microdent:cookies";
const EVENT = "microdent:cookies-change";

type Choice = "accepted" | "rejected" | null;

function read(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function save(choice: Exclude<Choice, null> | null) {
  const previous = read();
  try {
    if (choice) localStorage.setItem(KEY, choice);
    else localStorage.removeItem(KEY);
  } catch {
    /* almacenamiento no disponible */
  }
  window.dispatchEvent(new Event(EVENT));
  // Si retira un consentimiento ya dado, recargar descarga GTM de la página.
  if (previous === "accepted" && choice !== "accepted") window.location.reload();
}

/** "undefined" en el servidor: evita mostrar el aviso antes de saber la elección. */
const useChoice = () => useSyncExternalStore<Choice | undefined>(subscribe, read, () => undefined);

export function CookieConsent() {
  const choice = useChoice();
  if (!GTM_ID) return null;

  return (
    <>
      {choice === "accepted" && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(GTM_ID)});`}
        </Script>
      )}
      {choice === null && (
        <section
          aria-label="Aviso de cookies"
          className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-xl rounded-lg border border-line bg-white p-4 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] md:bottom-4"
        >
          <p className="text-sm text-ink-muted">
            Usamos cookies de analítica para entender cómo se usa el catálogo y mejorarlo. No se usan para
            publicidad. Más información en la{" "}
            <Link href="/legal/cookies" className="text-ink underline decoration-glauco decoration-2 underline-offset-4">
              política de cookies
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => save("rejected")}>
              Rechazar
            </Button>
            <Button onClick={() => save("accepted")}>Aceptar</Button>
          </div>
        </section>
      )}
    </>
  );
}

/** Enlace del pie para cambiar la decisión. */
export function CookiePreferencesButton() {
  const choice = useChoice();
  if (!GTM_ID || choice == null) return null;
  return (
    <button
      type="button"
      onClick={() => save(null)}
      className="inline-flex min-h-9 cursor-pointer items-center hover:text-white hover:underline"
    >
      Preferencias de cookies
    </button>
  );
}
