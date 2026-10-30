"use client";

import { MessageCircle } from "lucide-react";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ClickParams = Extract<AnalyticsEvent, { name: "whatsapp_click" }>["params"];

export function WhatsAppButton({
  href,
  label,
  advisorName,
  tracking,
  className,
}: {
  href: string;
  label?: string;
  advisorName: string;
  tracking: ClickParams;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", tracking)}
      className={cn(buttonVariants({ size: "lg" }), "w-full", className)}
    >
      <MessageCircle aria-hidden />
      {label ?? "Escribir por WhatsApp"}
      <span className="sr-only">
        {" "}a {advisorName} (se abre WhatsApp en una pestaña nueva)
      </span>
    </a>
  );
}
