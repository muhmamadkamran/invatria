"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Music2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { MediaRef } from "@/lib/types";
import { mediaUrl, putMedia } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Update invitation references here; never delete cloud objects before the
// invitation is durably saved. Storage cleanup belongs to the persistence layer.

/** A single image slot with drag-and-drop and a draggable focal point. */
export function CoverInput({
  value,
  focus,
  onChange,
  onFocusChange,
}: {
  value: MediaRef | null;
  focus: { x: number; y: number };
  onChange: (ref: MediaRef | null) => void;
  onFocusChange: (f: { x: number; y: number }) => void;
}) {
  const [url, setUrl] = useState("");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    mediaUrl(value).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [value]);

  async function accept(files: FileList | null) {
    const file = files?.[0];
    if (busy || !file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const uploaded = await putMedia(file, "image");
      onChange(uploaded);
    } catch (err) {
      toast.error("Could not upload photo", {
        description: err instanceof Error ? err.message : "Please check your connection and try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  function setFocusFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    onFocusChange({
      x: Math.round(((e.clientX - r.left) / r.width) * 100),
      y: Math.round(((e.clientY - r.top) / r.height) * 100),
    });
  }

  if (url) {
    return (
      <div className="space-y-3">
        <div
          onClick={setFocusFromEvent}
          className="relative aspect-[16/10] w-full cursor-crosshair overflow-hidden rounded-2xl border border-[var(--color-line)]"
          title="Click to set the focal point"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Cover"
            className="size-full object-cover"
            style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
          />
          <span
            className="pointer-events-none absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
            style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-center font-label text-[0.625rem] uppercase tracking-[0.16em] text-white/85">
            Click to choose what stays in frame
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading…" : "Replace"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => {
              onChange(null);
              setUrl("");
            }}
          >
            <Trash2 />
            Remove
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={busy}
          hidden
          onChange={(e) => { void accept(e.target.files); e.target.value = ""; }}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void accept(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-2xl border-2 border-dashed p-10 text-center transition-colors duration-300",
        over ? "border-gold bg-gold/6" : "border-[var(--color-line)]",
      )}
    >
      <ImagePlus className="mx-auto size-7 text-charcoal-200" strokeWidth={1.1} />
      <p className="mt-4 font-serif text-[0.9375rem] text-[var(--color-heading)]">
        Drop a photograph here
      </p>
      <p className="mt-1 text-xs text-charcoal-400">
        Uploaded to your account so guests can see it on any device.
      </p>
      <Button size="sm" variant="outline" className="mt-5" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? "Uploading…" : "Choose a file"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={busy}
        hidden
        onChange={(e) => { void accept(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}

/** Multi-image gallery input with reordering by removal. */
export function GalleryInput({
  value,
  onChange,
}: {
  value: MediaRef[];
  onChange: (refs: MediaRef[]) => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all(value.map(async (r) => [r.id, await mediaUrl(r)] as const)).then((pairs) => {
      if (alive) setUrls(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
  }, [value]);

  async function accept(files: FileList | null) {
    if (busy || !files?.length) return;
    setBusy(true);
    const added: MediaRef[] = [];
    try {
      for (const f of Array.from(files)) {
        if (f.type.startsWith("image/")) added.push(await putMedia(f, "image"));
      }
    } catch (err) {
      toast.error("Could not upload all photos", {
        description: err instanceof Error ? err.message : "Please check your connection and try again.",
      });
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {value.length ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((img) => (
            <li key={img.id} className="group relative aspect-square overflow-hidden rounded-xl">
              {urls[img.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[img.id]} alt="" className="size-full object-cover" />
              ) : (
                <span className="block size-full bg-cream" />
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(value.filter((v) => v.id !== img.id))}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void accept(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-300",
          over ? "border-gold bg-gold/6" : "border-[var(--color-line)]",
        )}
      >
        <p className="text-sm text-charcoal-400">
          Drop photographs here, or
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="ml-1 underline decoration-gold/50 underline-offset-4 hover:text-gold-deep"
          >
            {busy ? "uploading…" : "choose files"}
          </button>
        </p>
        <p className="mt-1 text-xs text-charcoal-200">
          {value.length ? `${value.length} added · ` : ""}No limit, ever.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          hidden
          onChange={(e) => { void accept(e.target.files); e.target.value = ""; }}
        />
      </div>
    </div>
  );
}

export function AudioInput({
  value,
  onChange,
}: {
  value: MediaRef | null;
  onChange: (ref: MediaRef | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/8 text-gold-deep dark:text-gold-light">
          <Music2 className="size-[1.05rem]" strokeWidth={1.3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-[0.9375rem] text-[var(--color-heading)]">
            {value?.name ?? "No track chosen"}
          </p>
          <p className="mt-0.5 text-xs text-charcoal-400">
            MP3, M4A or WAV. It fades in and never starts loud.
          </p>
        </div>
        {value ? (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Remove track"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-4 w-full"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : value ? "Choose a different track" : "Choose a track"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        disabled={busy}
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f || busy) return;
          setBusy(true);
          try {
            const uploaded = await putMedia(f, "audio");
            onChange(uploaded);
          } catch (err) {
            toast.error("Could not upload track", {
              description: err instanceof Error ? err.message : "Please check your connection and try again.",
            });
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
