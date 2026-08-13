"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Invitation } from "@/lib/types";
import { loadInvitation, saveInvitation } from "@/lib/storage";
import { blankInvitation } from "@/lib/defaults";
import { applyOccasion } from "@/lib/occasions";
import * as localStore from "@/lib/storage-local";
import { isUuid, newId } from "@/lib/utils";
import type { CategoryId, TemplateId } from "@/lib/types";
import { STEPS } from "@/lib/steps";

const KEY = "invitra:active";

type SaveState = "idle" | "saving" | "saved";

interface Ctx {
  inv: Invitation;
  update: (patch: Partial<Invitation>) => void;
  step: number;
  setStep: (n: number) => void;
  next: () => void;
  back: () => void;
  saveState: SaveState;
  ready: boolean;
}

const BuilderContext = createContext<Ctx | null>(null);

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used inside <BuilderProvider>");
  return ctx;
}

export function BuilderProvider({
  children,
  seed,
}: {
  children: React.ReactNode;
  /** Applied to a brand-new invitation only — e.g. ?template= or ?occasion=. */
  seed?: Partial<Invitation>;
}) {
  const [inv, setInv] = useState<Invitation>(() => blankInvitation());
  const [ready, setReady] = useState(false);
  const [step, setStepRaw] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Resume whatever was open last, so closing the tab mid-invitation costs
     nothing. A fresh start applies the seed from the query string. */
  useEffect(() => {
    let alive = true;
    (async () => {
      const activeId = localStorage.getItem(KEY);
      let existing = activeId ? await loadInvitation(activeId) : null;

      /* A draft started before the backend was configured still lives in this
         browser under a non-uuid id. Adopt it under a real one instead of
         quietly replacing it with an empty invitation. */
      if (!existing && activeId && !isUuid(activeId)) {
        const legacy = await localStore.loadInvitation(activeId);
        if (legacy) {
          existing = { ...legacy, id: newId() };
          localStorage.setItem(KEY, existing.id);
        }
      }

      if (!alive) return;
      if (existing) {
        /* Respect a template/occasion in the URL without discarding work: the
           occasion goes through applyOccasion so wording follows it too. */
        let next = existing;
        if (seed?.templateId) next = { ...next, templateId: seed.templateId };
        if (seed?.category && seed.category !== existing.category) {
          next = { ...next, ...applyOccasion(next, seed.category as CategoryId) };
        }
        setInv(next);
      } else {
        /* Build the blank straight from the seed so every occasion-owned
           default (labels, wording, which sections start on) is correct. */
        const fresh = blankInvitation(
          (seed?.templateId as TemplateId) ?? undefined,
          (seed?.category as CategoryId) ?? undefined,
        );
        setInv(fresh);
        localStorage.setItem(KEY, fresh.id);
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((patch: Partial<Invitation>) => {
    setInv((cur) => ({ ...cur, ...patch, updatedAt: Date.now() }));
    setSaveState("saving");
  }, []);

  /* Debounced autosave. 600ms is long enough to coalesce typing and short
     enough that "Saved" appears while you're still looking at the field. */
  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveInvitation(inv);
      localStorage.setItem(KEY, inv.id);
      setSaveState("saved");
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [inv, ready]);

  const setStep = useCallback((n: number) => {
    setStepRaw(Math.max(0, Math.min(STEPS.length - 1, n)));
    if (typeof window !== "undefined") {
      document.getElementById("builder-form")?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      inv,
      update,
      step,
      setStep,
      next: () => setStep(step + 1),
      back: () => setStep(step - 1),
      saveState,
      ready,
    }),
    [inv, update, step, setStep, saveState, ready],
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

/** Starts a new invitation and makes it the active one. */
export function startFresh(templateId?: TemplateId, category?: CategoryId) {
  const fresh = blankInvitation(templateId, category);
  localStorage.setItem(KEY, fresh.id);
  return fresh;
}

export function setActiveInvitation(id: string) {
  localStorage.setItem(KEY, id);
}
