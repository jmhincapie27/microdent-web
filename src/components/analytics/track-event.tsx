"use client";

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Envía un evento cuando el componente aparece (o cambian sus parámetros). */
export function TrackEvent<E extends AnalyticsEvent>({ name, params }: { name: E["name"]; params: E["params"] }) {
  const key = JSON.stringify(params);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === key) return;
    last.current = key;
    track(name, JSON.parse(key));
  }, [name, key]);
  return null;
}
