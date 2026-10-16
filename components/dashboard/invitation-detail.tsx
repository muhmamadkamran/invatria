"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Check, Copy, Download, ExternalLink, EyeOff, FileDown, Loader2,
  MessageCircle, Pencil, Share2, Trash2, Users, X, HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { GuestMessage, Invitation, RsvpResponse } from "@/lib/types";
import {
  deleteGuestMessage, deleteRsvp, listGuestMessages, listRsvps,
  loadInvitation, onResponsesChange, rsvpSummary,
} from "@/lib/storage";
import { AccountGate } from "@/components/auth/account-gate";
import { getTemplate } from "@/lib/templates";
import { getCategory } from "@/lib/categories";
import { formatLongDate, formatTime, cn } from "@/lib/utils";
import { CardPreview } from "@/components/invitation/card-preview";
import { QrCode } from "@/components/invitation/qr";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/landing/section";
import { downloadCardImage, downloadCardPdf } from "@/lib/export";
import { namesToText } from "@/components/invitation/names";

type Filter = "all" | "attending" | "not-attending" | "maybe";

const STATUS_LABEL: Record<string, string> = {
  attending: "Attending",
  "not-attending": "Declined",
  maybe: "Maybe",
};

const STATUS_TONE: Record<string, string> = {
  attending: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "not-attending": "border-red-400/30 bg-red-500/8 text-red-600 dark:text-red-400",
  maybe: "border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-400",
};

function InvitationDetailContent({ id }: { id: string }) {
  const [inv, setInv] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [notes, setNotes] = useState<GuestMessage[]>([]);
  const [summary, setSummary] = useState<
    { status: string; replies: number; heads: number }[]
  >([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const load = useCallback(async () => {
    try {
    const found = await loadInvitation(id);
    setInv(found);
    setLoading(false);
    if (!found) return;
    const [r, n, s] = await Promise.all([
      listRsvps(found.id),
      listGuestMessages(found.id),
      rsvpSummary(found.id),
    ]);
    setRsvps(r);
    setNotes(n);
    setSummary(s);
    setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this invitation. Please reload to try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    /* Realtime in cloud mode, so replies land while the host is watching. */
    return onResponsesChange(id, load);
  }, [id, load]);

  const stats = useMemo(() => {
    const get = (k: string) => summary.find((s) => s.status === k);
    return {
      heads: Number(get("attending")?.heads ?? 0),
      attending: Number(get("attending")?.replies ?? 0),
      declined: Number(get("not-attending")?.replies ?? 0),
      maybe: Number(get("maybe")?.replies ?? 0),
      total: summary.reduce((n, s) => n + Number(s.replies), 0),
    };
  }, [summary]);

  const shown = filter === "all" ? rsvps : rsvps.filter((r) => r.status === filter);
  const url = inv && origin ? `${origin}/i/${inv.slug}` : "";

  if (error) return <p role="alert" className="mx-auto my-32 max-w-lg px-6 text-center text-sm text-red-600 dark:text-red-400">{error}</p>;

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <h1 className="text-display font-light">We can&rsquo;t find that one</h1>
          <p className="mt-4 text-sm text-charcoal-400">
            It may have been deleted, or it belongs to a different account.
          </p>
          <Button asChild className="mt-8">
            <Link href="/my-invitations">Back to my invitations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const template = getTemplate(inv.templateId);
  const title = namesToText(inv) || "Untitled invitation";
  const shareText = `You're invited — ${title}\n${url}`;

  return (
    <Section className="pt-32 sm:pt-36">
      <Container>
        <Link
          href="/my-invitations"
          className="inline-flex items-center gap-2 font-label text-[0.625rem] uppercase tracking-[0.2em] text-charcoal-400 transition-colors hover:text-gold-deep dark:hover:text-gold-light"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          All invitations
        </Link>

        {/* ---------- header ---------- */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div
            id={`card-${inv.id}`}
            className="w-40 shrink-0 overflow-hidden rounded-2xl shadow-[var(--shadow-lifted)]"
          >
            <CardPreview invitation={inv} template={template} />
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "inline-block rounded-full px-3 py-1 font-label text-[0.5625rem] uppercase tracking-[0.18em]",
                inv.published
                  ? "bg-gold/14 text-gold-deep dark:text-gold-light"
                  : "border border-[var(--color-line)] text-charcoal-400",
              )}
            >
              {inv.published ? "Live" : "Draft"}
            </span>

            <h1 className="mt-3 text-display font-light">{title}</h1>
            <p className="mt-2 text-sm text-charcoal-400">
              {getCategory(inv.category).label} · {template.name} ·{" "}
              {formatLongDate(inv.date)}
              {inv.time ? ` · ${formatTime(inv.time)}` : ""}
            </p>
            {inv.venueName ? (
              <p className="mt-1 text-sm text-charcoal-400">{inv.venueName}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
              >
                <Link href={`/create?draft=${inv.id}`}>
                  <Pencil />
                  Edit
                </Link>
              </Button>
              {inv.published ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/i/${inv.slug}`} target="_blank">
                    <ExternalLink />
                    Open
                  </Link>
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await downloadCardImage(`card-${inv.id}`, inv);
                  } catch {
                    toast.error("Could not export the image");
                  }
                  setBusy(false);
                }}
              >
                <Download />
                PNG
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await downloadCardPdf(`card-${inv.id}`, inv);
                  } catch {
                    toast.error("Could not export the PDF");
                  }
                  setBusy(false);
                }}
              >
                <FileDown />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- share ---------- */}
        {inv.published && url ? (
          <div className="mt-10 rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <QrCode
                value={url}
                size={112}
                dark={template.theme.ink}
                light="#ffffff"
                className="mx-auto shrink-0 ring-1 ring-[var(--color-line)] sm:mx-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-label text-[0.5625rem] uppercase tracking-[0.22em] text-charcoal-400">
                  Share this link
                </p>
                <p className="mt-2 break-all font-mono text-sm text-[var(--color-heading)]">
                  {url}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      toast.success("Link copied");
                    }}
                  >
                    <Copy />
                    Copy link
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        `You're invited — ${title}`,
                      )}&body=${encodeURIComponent(shareText)}`}
                    >
                      Email
                    </a>
                  </Button>
                  {typeof navigator !== "undefined" && "share" in navigator ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigator
                          .share({ title, text: shareText, url })
                          .catch(() => {})
                      }
                    >
                      <Share2 />
                      More
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-6 text-center">
            <p className="text-sm text-charcoal-400">
              This invitation isn&rsquo;t published yet, so it has no link to share.
            </p>
            <Button
              size="sm"
              className="mt-4"
              asChild
            >
              <Link href={`/create?draft=${inv.id}`}>Finish and publish it</Link>
            </Button>
          </div>
        )}

        {/* ---------- stats ---------- */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Guests attending", value: stats.heads, icon: Users, accent: true },
            { label: "Said yes", value: stats.attending, icon: Check },
            { label: "Declined", value: stats.declined, icon: X },
            { label: "Maybe", value: stats.maybe, icon: HelpCircle },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-2xl border p-5",
                s.accent
                  ? "border-gold/30 bg-gold/6"
                  : "border-[var(--color-line)] bg-[var(--color-surface-raised)]",
              )}
            >
              <s.icon
                className={cn("size-4", s.accent ? "text-gold" : "text-charcoal-400")}
                strokeWidth={1.4}
              />
              <p className="mt-3 font-display text-3xl font-light text-[var(--color-heading)]">
                {s.value}
              </p>
              <p className="mt-1 font-label text-[0.5625rem] uppercase tracking-[0.18em] text-charcoal-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ---------- replies ---------- */}
        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-light">
              Replies <span className="text-charcoal-200">({stats.total})</span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "attending", "not-attending", "maybe"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-label text-[0.5625rem] uppercase tracking-[0.14em] transition-colors",
                    filter === f
                      ? "border-transparent bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal"
                      : "border-[var(--color-line)] text-charcoal-400 hover:border-gold/40",
                  )}
                >
                  {f === "all" ? "All" : STATUS_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-[var(--color-line)] p-10 text-center text-sm text-charcoal-400">
              {rsvps.length === 0
                ? "No replies yet. They'll appear here the moment a guest responds."
                : "Nobody in this group yet."}
            </p>
          ) : (
            <ul className="mt-6 space-y-2">
              <AnimatePresence initial={false}>
                {shown.map((r) => (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-4 sm:flex sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-serif text-[0.95rem] text-[var(--color-heading)]">
                          {r.name}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 font-label text-[0.5rem] uppercase tracking-[0.14em]",
                            STATUS_TONE[r.status],
                          )}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                        {r.status === "attending" && r.guests > 1 ? (
                          <span className="text-xs text-charcoal-400">
                            {r.guests} people
                          </span>
                        ) : null}
                        {r.meal ? (
                          <span className="text-xs text-charcoal-400">· {r.meal}</span>
                        ) : null}
                      </div>
                      {r.email ? (
                        <a
                          href={`mailto:${r.email}`}
                          className="mt-1 block truncate text-xs text-charcoal-400 hover:text-gold-deep"
                        >
                          {r.email}
                        </a>
                      ) : null}
                      {r.message ? (
                        <p className="mt-2 text-sm italic leading-relaxed text-charcoal-400">
                          &ldquo;{r.message}&rdquo;
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3 flex shrink-0 items-center gap-3 sm:mt-0">
                      <span className="text-[0.6875rem] text-charcoal-200">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${r.name}'s reply`}
                        onClick={async () => {
                          if (!confirm(`Remove ${r.name}'s reply?`)) return;
                          await deleteRsvp(r.id);
                          toast.success("Reply removed");
                        }}
                      >
                        <Trash2 className="text-red-500/70" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* ---------- guest book ---------- */}
        <div className="mt-14">
          <h2 className="font-display text-2xl font-light">
            Guest book <span className="text-charcoal-200">({notes.length})</span>
          </h2>

          {notes.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-[var(--color-line)] p-10 text-center text-sm text-charcoal-400">
              No notes yet.
            </p>
          ) : (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {notes.map((m) => (
                  <motion.li
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-5"
                  >
                    <MessageCircle
                      className="size-3.5 text-gold"
                      strokeWidth={1.4}
                    />
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-heading)]">
                      {m.message}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="font-label text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">
                        — {m.name}
                      </p>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${m.name}'s note`}
                        onClick={async () => {
                          if (!confirm("Remove this note from the guest book?")) return;
                          await deleteGuestMessage(m.id);
                          toast.success("Note removed");
                        }}
                      >
                        <EyeOff className="text-charcoal-400" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </Container>
    </Section>
  );
}

export function InvitationDetail({ id }: { id: string }) {
  return <AccountGate purpose="view your invitations"><InvitationDetailContent id={id} /></AccountGate>;
}
