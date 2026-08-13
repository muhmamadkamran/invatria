"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Info, X } from "lucide-react";
import type { TemplateDef } from "@/lib/templates";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

/** A floating chrome bar over the live template preview: get out, switch
 *  design, or take this one into the builder. Deliberately small — the
 *  invitation is the point, not the frame around it. */
export function PreviewBar({ template }: { template: TemplateDef }) {
  const [open, setOpen] = useState(false);
  const others = TEMPLATES.filter((t) => t.id !== template.id);

  return (
    <>
      <motion.div
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[70] px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-white/12 bg-black/55 p-1.5 pl-2 text-white shadow-lg backdrop-blur-xl">
          <Link
            href="/templates"
            className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/12"
            aria-label="Back to all templates"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[0.95rem] leading-tight">
              {template.name}
            </p>
            <p className="truncate font-label text-[0.5625rem] uppercase tracking-[0.2em] text-white/50">
              Live preview · sample content
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="About this design"
            className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/12"
          >
            {open ? <X className="size-4" strokeWidth={1.5} /> : <Info className="size-4" strokeWidth={1.5} />}
          </button>

          <Link
            href={`/create?template=${template.id}`}
            className="group flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 font-label text-[0.625rem] uppercase tracking-[0.14em] text-charcoal transition-transform duration-300 hover:-translate-y-0.5 sm:px-5"
          >
            Use this
            <ChevronRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-2 max-w-3xl overflow-hidden"
            >
              <div className="rounded-3xl border border-white/12 bg-black/60 p-6 text-white backdrop-blur-xl">
                <p className="text-sm leading-relaxed text-white/80">
                  {template.description}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {template.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[0.6875rem] text-white/70"
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 font-label text-[0.5625rem] uppercase tracking-[0.24em] text-white/40">
                  Try another design
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {others.map((t) => (
                    <Link
                      key={t.id}
                      href={`/templates/${t.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-full border border-white/15 py-1.5 pl-1.5 pr-4 text-[0.75rem] text-white/80 transition-colors hover:border-white/40 hover:bg-white/10",
                      )}
                    >
                      <span
                        className="size-5 rounded-full ring-1 ring-white/20"
                        style={{
                          background: `linear-gradient(135deg, ${t.theme.bg}, ${t.theme.accent})`,
                        }}
                      />
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
