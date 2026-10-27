"use client";

import { OptimizedPhoto } from "@/components/optimized-photo";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InvReveal } from "./parts";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaRef } from "@/lib/types";
import { mediaUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

/** Resolves a list of MediaRefs to displayable URLs once, on mount. */
export function useMediaUrls(refs: MediaRef[]) {
  const [urls, setUrls] = useState<string[]>(() => refs.map((ref) => ref.url ?? ""));
  useEffect(() => {
    let alive = true;
    Promise.all(refs.map((r) => mediaUrl(r))).then((u) => alive && setUrls(u));
    return () => {
      alive = false;
    };
  }, [refs]);
  return urls;
}

export function Gallery({ images }: { images: MediaRef[] }) {
  const urls = useMediaUrls(images);
  const [open, setOpen] = useState<number | null>(null);

  const go = useCallback(
    (dir: number) => {
      setOpen((cur) => {
        if (cur === null) return cur;
        return (cur + dir + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (!images.length) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <li
            key={img.id}
            className={cn(
              // an editorial rhythm rather than a plain grid
              i % 5 === 0 && "col-span-2 row-span-2",
            )}
          >
            <InvReveal
              delay={Math.min(i * 0.05, 0.4)}
              y={24}
              className="size-full"
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block size-full overflow-hidden rounded-xl"
                style={{ aspectRatio: i % 5 === 0 ? "1 / 1" : "3 / 4" }}
                aria-label={img.caption || `Open photo ${i + 1}`}
              >
                {urls[i] ? (
                  <OptimizedPhoto
                    src={urls[i]}
                    alt={img.caption || `Invitation gallery photo ${i + 1}`}
                    sizes="(max-width: 640px) 50vw, 400px"
                    className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                  />
                ) : (
                  <span
                    className="block size-full"
                    style={{ background: "var(--t-bg-alt)" }}
                  />
                )}
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl border opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ borderColor: "var(--t-accent)" }}
                />
              </button>
            </InvReveal>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={() => setOpen(null)}
          >
            <motion.img
              key={open}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              src={urls[open]}
              alt={images[open].caption || `Invitation gallery photo ${open + 1}`}
              className="max-h-[86vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {images[open].caption ? (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-white/70">
                {images[open].caption}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-5" strokeWidth={1.4} />
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="size-5" strokeWidth={1.4} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="size-5" strokeWidth={1.4} />
                </button>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
