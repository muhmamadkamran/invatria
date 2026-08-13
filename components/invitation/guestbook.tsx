"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import type { GuestMessage, Invitation } from "@/lib/types";
import { addGuestMessage, listGuestMessages, onResponsesChange } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { InvPanel, InvReveal } from "./parts";
import { Turnstile } from "./turnstile";

export function Guestbook({ invitation }: { invitation: Invitation }) {
  const copy = t(invitation.language);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => listGuestMessages(invitation.id).then(setMessages);
    load();
    /* Also subscribes to Realtime in cloud mode, so a note left on someone
       else's phone appears here without a refresh. */
    return onResponsesChange(invitation.id, load);
  }, [invitation.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || body.trim().length < 2) return;
    setSending(true);
    try {
      await addGuestMessage({
        invitationId: invitation.id,
        name: name.trim(),
        message: body.trim(),
      });
      setName("");
      setBody("");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send that just now.");
    } finally {
      setSending(false);
    }
  }

  const field =
    "w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors duration-300";
  const fieldStyle = {
    borderColor: "var(--t-line)",
    color: "var(--t-ink)",
    fontFamily: "var(--t-body)",
  } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <InvReveal>
        <InvPanel glass className="p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="gb-name" className="sr-only">
              {copy.yourName}
            </label>
            <input
              id="gb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.yourName}
              className={field}
              style={fieldStyle}
              maxLength={60}
            />
            <label htmlFor="gb-body" className="sr-only">
              {copy.signGuestbook}
            </label>
            <textarea
              id="gb-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={copy.signGuestbook}
              rows={3}
              maxLength={600}
              className={`${field} resize-y`}
              style={fieldStyle}
            />
            <Turnstile />

            {error ? (
              <p className="text-xs text-red-500" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={sending || name.trim().length < 2 || body.trim().length < 2}
              className="flex items-center gap-2 rounded-full px-5 py-3 text-[0.6875rem] uppercase tracking-[0.18em] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40"
              style={{
                background: "var(--t-accent)",
                color: "var(--t-bg)",
                fontFamily: "var(--t-label)",
              }}
            >
              <Send className="size-3.5" strokeWidth={1.6} />
              {copy.signGuestbook}
            </button>
          </form>
        </InvPanel>
      </InvReveal>

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <InvPanel className="p-5">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--t-ink)", fontFamily: "var(--t-body)" }}
                >
                  {m.message}
                </p>
                <p
                  className="mt-3 text-[0.6875rem] uppercase tracking-[0.2em]"
                  style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
                >
                  — {m.name}
                </p>
              </InvPanel>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {messages.length === 0 ? (
        <p
          className="text-center text-sm italic"
          style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
        >
          No notes yet — be the first.
        </p>
      ) : null}
    </div>
  );
}
