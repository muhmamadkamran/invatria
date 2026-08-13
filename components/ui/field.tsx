"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-4 text-sm text-[var(--color-heading)] placeholder:text-charcoal-200 transition-all duration-300 ease-[var(--ease-luxe)] hover:border-champagne-300 focus:border-gold/70 focus:outline-none focus:ring-4 focus:ring-gold/12 disabled:opacity-50 dark:placeholder:text-charcoal-400";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, "h-12", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(base, "min-h-28 resize-y py-3 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(base, "h-12 appearance-none pr-10", className)}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden
      viewBox="0 0 12 8"
      className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-current stroke-[1.4] text-charcoal-400"
    >
      <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
Select.displayName = "Select";

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label
      className={cn(
        "mb-2 flex items-baseline justify-between gap-3 font-label text-[0.6875rem] uppercase tracking-[0.2em] text-charcoal-400",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {hint ? (
        <span className="text-[0.625rem] normal-case tracking-normal text-charcoal-200">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
  error,
}: {
  label?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <Label htmlFor={htmlFor} hint={hint}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

/** A pill toggle used throughout the builder for on/off section switches. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-4">
      <div className="min-w-0">
        <p className="font-serif text-[0.95rem] text-[var(--color-heading)]">{label}</p>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-charcoal-400">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors duration-300",
          checked
            ? "bg-gold shadow-[inset_0_1px_2px_rgb(0_0_0/0.15)]"
            : "bg-champagne-300/60 dark:bg-charcoal-600",
        )}
      >
        {/* The knob is pinned with an explicit `left`: leaving it to the
            static position inside a <button> put it 22px in before the
            transform even ran, which threw it clear of the track. */}
        <span
          className={cn(
            "pointer-events-none absolute left-0.5 top-1/2 size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-[var(--ease-luxe)]",
            checked ? "translate-x-[1.25rem] -translate-y-1/2" : "translate-x-0 -translate-y-1/2",
          )}
        />
      </button>
    </div>
  );
}
