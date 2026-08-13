"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink, Pencil, Trash2, Users, MessageCircle, Plus, Download, FileDown,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteInvitation, listGuestMessages, listInvitations, listRsvps, onStoreChange,
  rsvpSummary,
} from "@/lib/storage";
import { setActiveInvitation } from "@/components/builder/context";
import type { GuestMessage, Invitation, RsvpResponse } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { getCategory } from "@/lib/categories";
import { formatLongDate } from "@/lib/utils";
import { CardPreview } from "@/components/invitation/card-preview";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/landing/section";
import { downloadCardImage, downloadCardPdf } from "@/lib/export";
import { ClaimBanner } from "@/components/auth/claim-banner";

interface Row {
  inv: Invitation;
  rsvps: RsvpResponse[];
  notes: GuestMessage[];
  /** Head count aggregated by the database rather than in the browser. */
  summary: { status: string; replies: number; heads: number }[];
}

export function Dashboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const invs = await listInvitations();
      setRows(
        await Promise.all(
          invs.map(async (inv) => ({
            inv,
            rsvps: await listRsvps(inv.id),
            notes: await listGuestMessages(inv.id),
            summary: await rsvpSummary(inv.id),
          })),
        ),
      );
    };
    load();
    return onStoreChange(load);
  }, []);

  return (
    <Section className="pt-36 sm:pt-44">
      <Container>
        <SectionHeading
          eyebrow="Your work"
          title="My"
          italic="invitations"
          lead="Everything you've made on this device, with replies and guest-book notes attached. Nothing here expires."
        />

        <ClaimBanner className="mt-14" />

        {rows === null ? (
          <p className="mt-16 text-center text-sm text-charcoal-400">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md rounded-[1.75rem] border border-dashed border-[var(--color-line)] p-12 text-center">
            <p className="font-display text-2xl font-light text-[var(--color-heading)]">
              Nothing here yet
            </p>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-400">
              Your invitations live in this browser. Make one and it will appear
              here, along with every reply it collects.
            </p>
            <Button asChild className="mt-7">
              <Link href="/create">
                <Plus />
                Create your first
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-16 grid gap-5 lg:grid-cols-2">
            <AnimatePresence initial={false}>
              {rows.map(({ inv, rsvps, notes, summary }) => {
                const template = getTemplate(inv.templateId);
                const attending =
                  summary.find((s) => s.status === "attending")?.heads ?? 0;
                const replies = summary.reduce((n, s) => n + Number(s.replies), 0);

                return (
                  <motion.li
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface-raised)]"
                  >
                    <div className="flex gap-5 p-5">
                      <div
                        id={`card-${inv.id}`}
                        className="w-28 shrink-0 overflow-hidden rounded-xl shadow-[var(--shadow-soft)]"
                      >
                        <CardPreview invitation={inv} template={template} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-xl font-light text-[var(--color-heading)]">
                              <Link
                                href={`/my-invitations/${inv.id}`}
                                className="transition-colors hover:text-gold-deep dark:hover:text-gold-light"
                              >
                                {inv.hostPrimary || "Untitled"}
                                {inv.hostSecondary ? ` ${inv.joinWord} ${inv.hostSecondary}` : ""}
                              </Link>
                            </h3>
                            <p className="mt-1 text-xs text-charcoal-400">
                              {getCategory(inv.category).label} · {template.name}
                            </p>
                          </div>
                          <span
                            className={
                              inv.published
                                ? "shrink-0 rounded-full bg-gold/14 px-3 py-1 font-label text-[0.5625rem] uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light"
                                : "shrink-0 rounded-full border border-[var(--color-line)] px-3 py-1 font-label text-[0.5625rem] uppercase tracking-[0.16em] text-charcoal-400"
                            }
                          >
                            {inv.published ? "Live" : "Draft"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-charcoal-400">
                          {formatLongDate(inv.date)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-charcoal-400">
                            <Users className="size-3.5 text-gold" strokeWidth={1.4} />
                            {attending} attending · {replies} replies
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-charcoal-400">
                            <MessageCircle className="size-3.5 text-gold" strokeWidth={1.4} />
                            {notes.length} notes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-[var(--color-line)] p-4">
                      <Button asChild size="sm">
                        <Link href={`/my-invitations/${inv.id}`}>
                          <BarChart3 />
                          Manage
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveInvitation(inv.id)}
                      >
                        <Link href="/create">
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
                        disabled={busy === inv.id}
                        onClick={async () => {
                          setBusy(inv.id);
                          try {
                            await downloadCardImage(`card-${inv.id}`, inv);
                          } catch {
                            toast.error("Could not export the image");
                          }
                          setBusy(null);
                        }}
                      >
                        <Download />
                        PNG
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === inv.id}
                        onClick={async () => {
                          setBusy(inv.id);
                          try {
                            await downloadCardPdf(`card-${inv.id}`, inv);
                          } catch {
                            toast.error("Could not export the PDF");
                          }
                          setBusy(null);
                        }}
                      >
                        <FileDown />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="ml-auto"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Delete this invitation? Its replies and guest-book notes go with it.",
                            )
                          )
                            return;
                          await deleteInvitation(inv.id);
                          toast.success("Deleted");
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>

                    {rsvps.length ? (
                      <Link
                        href={`/my-invitations/${inv.id}`}
                        className="block border-t border-[var(--color-line)] px-5 py-3 font-label text-[0.5625rem] uppercase tracking-[0.2em] text-charcoal-400 transition-colors hover:text-gold-deep dark:hover:text-gold-light"
                      >
                        See all {rsvps.length} replies →
                      </Link>
                    ) : null}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        {rows?.length ? (
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/create" onClick={() => localStorage.removeItem("invitra:active")}>
                <Plus />
                Start another
              </Link>
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
