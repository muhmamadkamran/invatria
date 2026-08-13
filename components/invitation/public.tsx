"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Invitation } from "@/lib/types";
import { findBySlug } from "@/lib/storage";
import { InvitationView } from "./view";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand";

export function PublicInvitation({
  slug,
  /** Resolved on the server when a backend is configured. When present the
   *  guest sees the invitation immediately, with no client-side lookup. */
  initial = null,
}: {
  slug: string;
  initial?: Invitation | null;
}) {
  const [state, setState] = useState<"loading" | "found" | "missing">(
    initial ? "found" : "loading",
  );
  const [inv, setInv] = useState<Invitation | null>(initial);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
    if (initial) return;

    /* Nothing came from the server: either there is no backend configured, or
       this invitation only ever lived in this browser. Look locally. */
    let alive = true;
    findBySlug(slug).then((found) => {
      if (!alive) return;
      setInv(found);
      setState(found ? "found" : "missing");
    });
    return () => {
      alive = false;
    };
  }, [slug, initial]);

  useEffect(() => {
    if (!inv) return;
    document.title = `${inv.hostPrimary}${
      inv.hostSecondary ? ` ${inv.joinWord} ${inv.hostSecondary}` : ""
    } — You're invited`;
  }, [inv]);

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-surface)]">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (state === "missing" || !inv) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-surface)] px-6">
        <div className="max-w-md text-center">
          <Wordmark className="mx-auto" />
          <h1 className="mt-10 text-display font-light">
            We couldn&rsquo;t find <span className="italic">that invitation</span>
          </h1>
          <p className="mt-5 text-pretty text-sm leading-relaxed text-charcoal-400">
            The link may have a typo in it, or the invitation may have been
            taken down by whoever made it.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/create">Create an invitation</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">See an example</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main id="main">
      <InvitationView invitation={inv} publicUrl={url} />
    </main>
  );
}
