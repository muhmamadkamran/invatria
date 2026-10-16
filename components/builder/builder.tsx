"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, Loader2, X } from "lucide-react";
import { BuilderProvider, useBuilder } from "./context";
import { PreviewPane } from "./preview-pane";
import {
  StepTemplate, StepCover, StepNames, StepDate, StepTime, StepVenue, StepMaps,
  StepGallery, StepMusic, StepTimeline, StepDetails, StepRsvp, StepPreview, StepPublish,
} from "./steps";
import { Wordmark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountButton } from "@/components/auth/account-button";
import { AccountGate } from "@/components/auth/account-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ads";
import { STEPS } from "@/lib/steps";
import type { CategoryId, TemplateId } from "@/lib/types";
import { TEMPLATE_MAP } from "@/lib/templates";
import { CATEGORY_MAP } from "@/lib/categories";
import { getOccasion } from "@/lib/occasions";
import { cn } from "@/lib/utils";

const PANELS = [
  StepTemplate, StepCover, StepNames, StepDate, StepTime, StepVenue, StepMaps,
  StepGallery, StepMusic, StepTimeline, StepDetails, StepRsvp, StepPreview, StepPublish,
];

function SaveBadge() {
  const { saveState } = useBuilder();
  return (
    <span className="hidden items-center gap-1.5 font-label text-[0.5625rem] uppercase tracking-[0.18em] text-charcoal-400 sm:inline-flex">
      {saveState === "saving" ? (
        <>
          <Loader2 className="size-3 animate-spin" /> Saving
        </>
      ) : saveState === "saved" ? (
        <>
          <Check className="size-3 text-gold" /> Saved
        </>
      ) : saveState === "error" ? "Not saved" : null}
    </span>
  );
}

function Stepper() {
  const { step, setStep, inv } = useBuilder();
  const occasion = getOccasion(inv.category);
  return (
    <nav aria-label="Builder steps" className="hidden xl:block">
      <ol className="space-y-0.5">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-300",
                  active ? "bg-[var(--color-surface-raised)]" : "hover:bg-[var(--color-surface-raised)]/60",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-[0.5625rem] transition-all duration-300",
                    active
                      ? "bg-gold text-charcoal"
                      : done
                        ? "bg-gold/18 text-gold-deep dark:text-gold-light"
                        : "border border-[var(--color-line)] text-charcoal-200",
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={2.6} /> : s.n}
                </span>
                <span
                  className={cn(
                    "truncate text-[0.8125rem] transition-colors duration-300",
                    active ? "text-[var(--color-heading)]" : "text-charcoal-400",
                  )}
                >
                  {s.key === "names" ? occasion.stepTitle : s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Shell() {
  const { step, next, back, ready, inv, error, loadError, update } = useBuilder();
  const [sheet, setSheet] = useState(false);
  const Panel = PANELS[step];
  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheet]);

  if (loadError) return <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center"><p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p><Link href="/my-invitations" className="mt-7 underline underline-offset-4">Back to My Invitations</Link></main>;

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-sunken)]">
      {/* ---- top bar ---- */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Invitra home">
            <Wordmark className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <SaveBadge />
            <AccountButton className="hidden sm:inline-flex" />
            <Button
              size="sm"
              variant="outline"
              className="lg:hidden"
              onClick={() => setSheet(true)}
            >
              <Eye />
              Preview
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* progress */}
        <div className="h-0.5 w-full bg-[var(--color-line)]">
          <motion.div
            className="h-full bg-[linear-gradient(90deg,var(--color-gold),var(--color-rosegold))]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-[100rem] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_23rem] xl:grid-cols-[15rem_1fr_25rem]">
        {/* ---- step rail ---- */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <p className="mb-4 px-3 font-label text-[0.5625rem] uppercase tracking-[0.24em] text-charcoal-400">
              Fourteen steps
            </p>
            <Stepper />
            <div className="mt-6 rounded-2xl border border-[var(--color-line)] p-4">
              <p className="font-serif text-sm text-[var(--color-heading)]">
                {TEMPLATE_MAP[inv.templateId as TemplateId]?.name}
              </p>
              <p className="mt-1 text-xs text-charcoal-400">
                {CATEGORY_MAP[inv.category as CategoryId]?.label}
              </p>
            </div>
          </div>
        </aside>

        {/* ---- form ---- */}
        <main id="main" className="min-w-0">
          {error ? <div className="mb-5 rounded-2xl border border-red-400/40 p-4"><p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p><Button className="mt-3" variant="outline" size="sm" onClick={() => update({})}>Retry save</Button></div> : null}
          <div className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-10">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <p className="font-label text-[0.5625rem] uppercase tracking-[0.24em] text-gold-deep dark:text-gold-light">
                Step {current.n} of {STEPS.length}
                {current.optional ? " · optional" : ""}
              </p>
              <p className="font-label text-[0.5625rem] uppercase tracking-[0.24em] text-charcoal-200">
                {current.act}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Panel />
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-7">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {current.optional ? (
                  <Button variant="ghost" onClick={next} disabled={step === STEPS.length - 1}>
                    Skip
                  </Button>
                ) : null}
                <Button
                  onClick={next}
                  disabled={step === STEPS.length - 1}
                  className="group"
                >
                  {step === STEPS.length - 2 ? "Publish" : "Continue"}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </div>

          <AdSlot slot="builder-foot" className="mt-8 !px-0" />
        </main>

        {/* ---- preview ---- */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 h-[calc(100vh-8rem)] rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <PreviewPane />
          </div>
        </aside>
      </div>

      {/* ---- mobile preview sheet ---- */}
      <AnimatePresence>
        {sheet ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
              onClick={() => setSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 top-10 rounded-t-[2rem] border-t border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <button
                type="button"
                onClick={() => setSheet(false)}
                aria-label="Close preview"
                className="absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-full border border-[var(--color-line)]"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
              <div className="h-full pt-2">
                <PreviewPane compact />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function WithParams() {
  const params = useSearchParams();
  const { userId } = useAuth();
  const template = params.get("template");
  const occasion = params.get("occasion");

  const seed: Record<string, unknown> = {};
  if (template && TEMPLATE_MAP[template as TemplateId]) seed.templateId = template;
  if (occasion && CATEGORY_MAP[occasion as CategoryId]) seed.category = occasion;

  return (
    <BuilderProvider key={userId} seed={seed} draftId={params.get("draft")}>
      <Shell />
    </BuilderProvider>
  );
}

export function Builder() {
  return (
    <AccountGate>
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      }
    >
      <WithParams />
    </Suspense>
    </AccountGate>
  );
}
