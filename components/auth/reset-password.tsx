"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Logo } from "@/components/brand";
import { useAuth } from "./auth-provider";
import { useAuthUI } from "./auth-ui";

function Form() {
  const params = useSearchParams();
  const { email, isAnonymous, loading } = useAuth();
  const { openAuth } = useAuthUI();

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "link"
    ? "That link has expired or has already been used. Ask for a new one."
    : "");
  const [done, setDone] = useState(false);

  /* Arriving here means the reset link already exchanged itself for a session
     in the callback route — so a signed-in, non-anonymous user is the happy
     path, and anything else means the link didn't work. */
  const linkWorked = Boolean(email) && !isAnonymous;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { updatePassword } = await import("@/lib/supabase/auth");
    const result = await updatePassword(password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold/14 text-gold-deep dark:text-gold-light">
          <Check className="size-6" strokeWidth={1.6} />
        </span>
        <h1 className="mt-6 text-display font-light">Password changed</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal-400">
          You&rsquo;re signed in and everything is where you left it.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/my-invitations">Go to my invitations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Logo className="mx-auto size-10" />
      <h1 className="mt-6 text-center text-display font-light">
        Choose a new password
      </h1>

      {!loading && !linkWorked ? (
        <>
          <p className="mt-5 text-center text-sm leading-relaxed text-charcoal-400">
            {error ||
              "This page needs a valid reset link. Ask for a new one and open it from your inbox."}
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" onClick={() => openAuth("reset")}>
              Send me a reset link
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="New password" htmlFor="new-password" hint="At least 8 characters">
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-400/40 bg-red-500/8 px-4 py-3 text-xs text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Save new password
          </Button>
        </form>
      )}
    </div>
  );
}

export function ResetPassword() {
  return (
    <Suspense fallback={<Loader2 className="size-6 animate-spin text-gold" />}>
      <Form />
    </Suspense>
  );
}
