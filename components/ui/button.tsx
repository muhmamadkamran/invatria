"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-label tracking-[0.08em] transition-all duration-300 ease-[var(--ease-luxe)] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        /* Ink-filled primary — the one true call to action */
        primary:
          "bg-charcoal text-ivory shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-float)] hover:-translate-y-0.5 active:translate-y-0 dark:bg-champagne dark:text-charcoal",
        /* Gold leaf — used sparingly, on dark or imagery */
        gold: "text-charcoal shadow-[var(--shadow-gold)] hover:-translate-y-0.5 active:translate-y-0 bg-[linear-gradient(105deg,var(--color-gold-deep),var(--color-gold)_28%,#f4e4b0_50%,var(--color-gold)_72%,var(--color-gold-deep))] bg-[length:200%_100%] hover:bg-[position:100%_0]",
        /* Hairline outline on paper */
        outline:
          "border border-[var(--color-line)] bg-transparent text-[var(--color-heading)] hover:border-gold/60 hover:bg-cream/60 dark:hover:bg-white/5",
        /* Frosted glass — for use over imagery */
        glass:
          "glass text-[var(--color-heading)] hover:bg-[color-mix(in_oklab,var(--color-surface-raised)_82%,transparent)] hover:-translate-y-0.5",
        ghost:
          "text-[var(--color-body)] hover:text-[var(--color-heading)] hover:bg-cream/70 dark:hover:bg-white/5",
        link: "text-[var(--color-heading)] underline-offset-[6px] hover:underline decoration-gold/50",
        danger:
          "border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-[0.6875rem] [&_svg]:size-3.5",
        md: "h-11 rounded-full px-6 text-xs [&_svg]:size-4",
        lg: "h-[3.25rem] rounded-full px-8 text-[0.8125rem] [&_svg]:size-[1.05rem]",
        icon: "size-10 rounded-full [&_svg]:size-4",
        "icon-sm": "size-8 rounded-full [&_svg]:size-3.5",
      },
      uppercase: {
        true: "uppercase",
        false: "normal-case tracking-normal",
      },
    },
    defaultVariants: { variant: "primary", size: "md", uppercase: true },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, uppercase, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, uppercase }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
