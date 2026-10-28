"use client";

import { useState } from "react";
import Link from "next/link";

const occasions = { wedding: "Wedding", birthday: "Birthday", "baby-shower": "Baby shower", nikah: "Nikah" };
type Occasion = keyof typeof occasions;
function readableDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}
function readableTime(value: string) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

export function WhatsAppMessageBuilder() {
  const [occasion, setOccasion] = useState<Occasion>("wedding");
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [replyBy, setReplyBy] = useState("");
  const [instructions, setInstructions] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  let validLink = "";
  try {
    const url = new URL(link.trim());
    if (url.protocol === "https:" && !url.username && !url.password) validLink = url.href;
  } catch { /* The invitation link is optional while preparing wording. */ }
  const linkError = link.trim() && !validLink ? "Enter a complete https:// invitation link, or leave this field empty." : "";
  const person = names.trim() || "[Name or names]";
  const intros: Record<Occasion, string> = {
    wedding: `Together with our families, we invite you to celebrate the wedding of ${person}.`,
    birthday: `You're invited to celebrate ${person}'s birthday!`,
    "baby-shower": `Please join us for a baby shower celebrating ${person}.`,
    nikah: `Together with our families, we invite you to the nikah of ${person}.`,
  };
  const message = [
    intros[occasion], "",
    `Date: ${readableDate(date) || "[Event date]"}`,
    `Time: ${readableTime(eventTime) || "[Event time, at the venue]"}`,
    `Venue: ${venue.trim() || "[Venue and address]"}`,
    ...(instructions.trim() ? [instructions.trim()] : []), "",
    replyBy ? `Please RSVP by ${readableDate(replyBy)}.` : "Please let us know if you can attend.",
    validLink ? `Full details and online RSVP: ${validLink}` : "[Add your invitation link here]",
  ].join("\n");
  const fieldClass = "mt-2 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm";
  async function copy() {
    try { await navigator.clipboard.writeText(message); setStatus("Message copied. Replace any remaining bracketed details before sending."); }
    catch { setStatus("Select the message preview and copy it manually."); }
  }
  return (
    <section aria-labelledby="composer-heading" className="mt-12 grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl border border-[var(--color-line)] p-6 sm:p-8">
        <h2 id="composer-heading" className="text-title">Prepare your message</h2>
        <div className="mt-6 space-y-5">
          <label className="block text-sm font-medium">Occasion<select value={occasion} onChange={event => { setOccasion(event.target.value as Occasion); setStatus(""); }} className={fieldClass}>{Object.entries(occasions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-medium">Name or names<input value={names} maxLength={150} onChange={event => { setNames(event.target.value); setStatus(""); }} className={fieldClass} placeholder="Your name or the couple's names" /></label>
          <label className="block text-sm font-medium">Event date<input type="date" value={date} onChange={event => { setDate(event.target.value); setStatus(""); }} className={fieldClass} /></label>
          <label className="block text-sm font-medium">Event time<input type="time" value={eventTime} onChange={event => { setEventTime(event.target.value); setStatus(""); }} className={fieldClass} /></label>
          <p className="text-sm text-charcoal-400">Use the local time at the venue. Add a time zone in the guest instructions for an online event.</p>
          <label className="block text-sm font-medium">Venue and address<input value={venue} maxLength={300} onChange={event => { setVenue(event.target.value); setStatus(""); }} className={fieldClass} placeholder="Venue name and address" /></label>
          <label className="block text-sm font-medium">Reply by<input type="date" value={replyBy} onChange={event => { setReplyBy(event.target.value); setStatus(""); }} className={fieldClass} /></label>
          <label className="block text-sm font-medium">Guest instructions (optional)<textarea value={instructions} maxLength={500} rows={3} onChange={event => { setInstructions(event.target.value); setStatus(""); }} className={fieldClass} placeholder="Arrival time, dress code or other details" /></label>
          <label className="block text-sm font-medium">Published invitation link (optional)<input type="url" value={link} onChange={event => { setLink(event.target.value); setStatus(""); }} aria-invalid={Boolean(linkError)} aria-describedby="invitation-link-help" className={fieldClass} placeholder="https://..." /></label>
          <p id="invitation-link-help" className="text-sm text-charcoal-400">{linkError || "Paste your published invitation link to give guests an online RSVP destination."}</p>
        </div>
      </div>
      <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-6 sm:p-8">
        <h2 className="text-title">Message preview</h2>
        <label className="sr-only" htmlFor="whatsapp-message-preview">Prepared invitation message</label>
        <textarea id="whatsapp-message-preview" readOnly value={message} rows={13} className={`${fieldClass} mt-6 leading-relaxed`} />
        <div className="mt-5 flex flex-wrap gap-4">
          <button type="button" disabled={Boolean(linkError)} onClick={copy} className="rounded-full bg-gold px-5 py-3 text-sm font-medium text-charcoal disabled:opacity-50">Copy invitation message</button>
          <a aria-disabled={Boolean(linkError)} href={linkError ? undefined : `https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm">Open WhatsApp with this message</a>
        </div>
        <p role="status" className="mt-4 min-h-12 text-sm leading-relaxed">{status}</p>
        <p className="mt-4 text-sm leading-relaxed">You choose the recipients and send the message in WhatsApp. Guests use your invitation link to RSVP. This tool does not track WhatsApp delivery or read receipts.</p>
        <p className="mt-6 text-sm leading-relaxed">Need an invitation link? <Link prefetch={false} href={`/create?occasion=${occasion}`} className="underline underline-offset-4">Create an Invitra invitation</Link> with a free host account.</p>
      </div>
    </section>
  );
}
