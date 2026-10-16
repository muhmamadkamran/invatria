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
import { isUuid } from "@/lib/utils";
import type { CategoryId, TemplateId } from "@/lib/types";
import { STEPS } from "@/lib/steps";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Ctx {
  inv: Invitation;
  update: (patch: Partial<Invitation>) => void;
  commit: (patch: Partial<Invitation>) => Promise<void>;
  step: number;
  setStep: (n: number) => void;
  next: () => void;
  back: () => void;
  saveState: SaveState;
  ready: boolean;
  error: string;
  loadError: boolean;
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
  draftId,
}: {
  children: React.ReactNode;
  /** Applied to a brand-new invitation only — e.g. ?template= or ?occasion=. */
  seed?: Partial<Invitation>;
  draftId?: string | null;
}) {
  const [inv, setInv] = useState<Invitation>(() => blankInvitation());
  const [ready, setReady] = useState(false);
  const [step, setStepRaw] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(inv);
  const committing = useRef(false);
  const mounted = useRef(true);
  latest.current = inv;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  /* Resume the cloud draft identified by the URL. No invitation data or active
     draft pointer is stored in browser storage. */
  useEffect(() => {
    if (draftId && ready && draftId === latest.current.id) return;
    setReady(false);
    setCanSave(false);
    setLoadError(false);
    setError("");
    setStepRaw(0);
    let alive = true;
    (async () => {
      if (draftId && !isUuid(draftId)) throw new Error("That draft link is invalid.");
      const existing = draftId ? await loadInvitation(draftId) : null;
      if (!alive) return;
      if (draftId && !existing) throw new Error("This draft could not be found in your account. Open My Invitations to choose a draft.");
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
      }
      setCanSave(true);
      setReady(true);
    })().catch((err) => {
      if (!alive) return;
      setError(err instanceof Error ? err.message : "Could not load your invitation. Please reload to try again.");
      setLoadError(true);
      setCanSave(false);
      setReady(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  const update = useCallback((patch: Partial<Invitation>) => {
    setInv((cur) => ({ ...cur, ...patch, updatedAt: Date.now() }));
    setSaveState("saving");
  }, []);

  /* Report success only after the online write completes. Failed writes stay
     in component memory and are visible to the host. */
  useEffect(() => {
    if (!ready || !canSave || committing.current) return;
    let cancelled = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await saveInvitation(inv);
        if (cancelled || !mounted.current || latest.current !== inv) return;
        const url = new URL(window.location.href);
        url.searchParams.set("draft", inv.id);
        window.history.replaceState(window.history.state, "", url);
        setSaveState("saved");
        setError("");
      } catch (err) {
        if (cancelled || !mounted.current || latest.current !== inv) return;
        setSaveState("error");
        setError(err instanceof Error ? err.message : "Could not save online. Please check your connection and try again.");
      }
    }, 600);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [inv, ready, canSave]);

  const commit = useCallback(async (patch: Partial<Invitation>) => {
    if (!canSave) throw new Error("This invitation has not loaded. Please reload before publishing.");
    if (timer.current) clearTimeout(timer.current);
    committing.current = true;
    setSaveState("saving");
    const next = { ...latest.current, ...patch, updatedAt: Date.now() };
    try {
      await saveInvitation(next);
      if (!mounted.current) return;
      const url = new URL(window.location.href);
      url.searchParams.set("draft", next.id);
      window.history.replaceState(window.history.state, "", url);
      setInv(next);
      setError("");
      setSaveState("saved");
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : "Could not save online. Please try again.");
        setSaveState("error");
      }
      throw err;
    } finally {
      committing.current = false;
    }
  }, [canSave]);

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
      commit,
      step,
      setStep,
      next: () => setStep(step + 1),
      back: () => setStep(step - 1),
      saveState,
      ready,
      error,
      loadError,
    }),
    [inv, update, commit, step, setStep, saveState, ready, error, loadError],
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}
