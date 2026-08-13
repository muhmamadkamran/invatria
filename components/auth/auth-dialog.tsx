"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Logo } from "@/components/brand";
import { useAuth } from "./auth-provider";
import { listInvitations } from "@/lib/storage";
import { cn } from "@/lib/utils";

export type AuthMode = "claim" | "signin" | "reset";

const COPY: Record<AuthMode, { title: string; lead: string; cta: string }> = {
  claim: {
    title: "Save your invitations",
    lead: "Add an email and a password so you can come back to this from any device — and so nothing is lost if you clear your browser.",
    cta: "Create my account",
  },
  signin: {
    title: "Welcome back",
    lead: "Sign in to pick up your invitations and see who has replied.",
    cta: "Sign in",
  },
  reset: {
    title: "Reset your password",
    lead: "We'll email you a link to choose a new one.",
    cta: "Send reset link",
  },
};

export function AuthDialog({
  open,
  mode: initialMode,
  onClose,
  redirectPath,
  skipLabel,
  onSkip,
  onSuccess,
}: {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  /** Where the emailed confirmation link should land. */
  redirectPath?: string;
  /** When set, offers a way out — used so publishing is never held hostage. */
  skipLabel?: string;
  onSkip?: () => void;
  onSuccess?: () => void;
}) {
  const { isAnonymous, refresh } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [strandCount, setStrandCount] = useState(0);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => setMode(initialMode), [initialMode, open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSent(false);
    document.body.style.overflow = "hidden";
    const id = setTimeout(() => firstField.current?.focus(), 120);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(id);
    };
  }, [open, mode]);

  /* Signing in replaces the anonymous session, which would leave anything made
     on this device unreachable. Count it so we can warn rather than surprise. */
  useEffect(() => {
    if (!open || mode !== "signin" || !isAnonymous) {
      setStrandCount(0);
      return;
    }
    listInvitations().then((list) => setStrandCount(list.length));
  }, [open, mode, isAnonymous]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const auth = await import("@/lib/supabase/auth");
    const result =
      mode === "claim"
        ? await auth.claimAccount(email.trim(), password, redirectPath)
        : mode === "signin"
          ? await auth.signIn(email.trim(), password)
          : await auth.sendPasswordReset(email.trim());

    setBusy(false);

    if (!result.ok) return setError(result.error);

    refresh();
    onSuccess?.();
    if (result.needsConfirmation) return setSent(true);
    onClose();
  }

  const copy = COPY[mode];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[95] grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
        >
          <div
            className="absolute inset-0 bg-charcoal/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="paper relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-float)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-[var(--color-line)] text-charcoal-400 transition-colors hover:text-[var(--color-heading)]"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>

            {sent ? (
              <div className="py-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold/14 text-gold-deep dark:text-gold-light">
                  <Mail className="size-6" strokeWidth={1.4} />
                </span>
                <h2 className="mt-6 font-display text-2xl font-light">
                  Check your inbox
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-400">
                  We&rsquo;ve sent a link to{" "}
                  <span className="text-[var(--color-heading)]">{email}</span>.
                  {mode === "reset"
                    ? " Open it to choose a new password."
                    : " Open it and your account is secured — your invitations are already saved."}
                </p>
                <Button variant="outline" className="mt-7" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <Logo className="size-9" />
                <h2 className="mt-5 font-display text-2xl font-light">{copy.title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-charcoal-400">
                  {copy.lead}
                </p>

                {mode === "signin" && strandCount > 0 ? (
                  <p className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-400/8 p-4 text-xs leading-relaxed text-charcoal-600 dark:text-charcoal-200">
                    You have {strandCount}{" "}
                    {strandCount === 1 ? "invitation" : "invitations"} on this
                    device that aren&rsquo;t attached to an account yet. Signing
                    in will switch to your account and they won&rsquo;t come with
                    you.{" "}
                    <button
                      type="button"
                      onClick={() => setMode("claim")}
                      className="underline decoration-gold/50 underline-offset-2 hover:text-gold-deep"
                    >
                      Save them to an account instead
                    </button>
                    .
                  </p>
                ) : null}

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <Field label="Email" htmlFor="auth-email">
                    <Input
                      id="auth-email"
                      ref={firstField}
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>

                  {mode !== "reset" ? (
                    <Field
                      label="Password"
                      htmlFor="auth-password"
                      hint={mode === "claim" ? "At least 8 characters" : undefined}
                    >
                      <Input
                        id="auth-password"
                        type="password"
                        autoComplete={
                          mode === "claim" ? "new-password" : "current-password"
                        }
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </Field>
                  ) : null}

                  {error ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-400/40 bg-red-500/8 px-4 py-3 text-xs leading-relaxed text-red-600 dark:text-red-400"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button type="submit" size="lg" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" /> : null}
                    {copy.cta}
                  </Button>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[var(--color-line)] pt-5 text-xs text-charcoal-400">
                  {mode !== "signin" ? (
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className={cn("hover:text-gold-deep dark:hover:text-gold-light")}
                    >
                      Already have an account? Sign in
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setMode("claim")}
                        className="hover:text-gold-deep dark:hover:text-gold-light"
                      >
                        Create an account
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="hover:text-gold-deep dark:hover:text-gold-light"
                      >
                        Forgot your password?
                      </button>
                    </>
                  )}
                </div>

                {skipLabel && onSkip ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSkip();
                      onClose();
                    }}
                    className="mt-4 w-full text-center text-xs text-charcoal-400 underline decoration-[var(--color-line)] underline-offset-4 hover:text-[var(--color-heading)]"
                  >
                    {skipLabel}
                  </button>
                ) : null}

                {mode === "claim" ? (
                  <p className="mt-5 flex items-start gap-2 text-[0.6875rem] leading-relaxed text-charcoal-400">
                    <Check className="mt-0.5 size-3 shrink-0 text-gold" strokeWidth={2.4} />
                    Everything stays free. An account only exists so you can get
                    back to your invitations.
                  </p>
                ) : null}
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
