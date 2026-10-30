import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md font-display text-sm font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Antracita con texto blanco: 7,23:1
        primary: "bg-antracita text-white hover:bg-antracita-900",
        outline: "border border-antracita bg-white text-ink hover:bg-glauco-100",
        // Fondo glauco con texto negro: 11,9:1
        accent: "bg-glauco text-black hover:bg-glauco-200",
        ghost: "text-ink hover:bg-surface-alt",
        link: "h-auto px-0 text-ink underline underline-offset-4 decoration-glauco decoration-2 hover:decoration-antracita",
        onDark: "bg-white text-ink hover:bg-glauco-100",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
