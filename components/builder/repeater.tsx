"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** A reorderable list editor. Used for the schedule, story chapters, family,
 *  questions and hotels — anywhere the invitation holds a list of things. */
export function Repeater<T extends { id: string }>({
  items,
  onChange,
  create,
  render,
  addLabel,
  empty,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  create: () => T;
  render: (item: T, set: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  addLabel: string;
  empty?: string;
}) {
  const set = (id: string, patch: Partial<T>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-label text-[0.5625rem] uppercase tracking-[0.22em] text-charcoal-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Move down"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Remove"
                    onClick={() => onChange(items.filter((x) => x.id !== item.id))}
                  >
                    <Trash2 className="text-red-500/80" />
                  </Button>
                </div>
              </div>
              {render(item, (patch) => set(item.id, patch), i)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {!items.length && empty ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-line)] p-8 text-center text-sm text-charcoal-400">
          {empty}
        </p>
      ) : null}

      <Button variant="outline" size="sm" onClick={() => onChange([...items, create()])}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}

/** A simple list of plain strings (parents' names, gift notes, dress palette). */
export function StringList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="h-11 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-3.5 text-sm text-[var(--color-heading)] outline-none transition-colors focus:border-gold/70"
          />
          <Button
            size="icon"
            variant="ghost"
            aria-label="Remove"
            onClick={() => onChange(items.filter((_, x) => x !== i))}
          >
            <Trash2 className="text-red-500/80" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
