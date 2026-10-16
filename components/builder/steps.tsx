"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, Copy, Sparkles } from "lucide-react";
import { useBuilder } from "./context";
import { CoverInput, GalleryInput, AudioInput } from "./media-input";
import { Repeater, StringList } from "./repeater";
import { Field, Input, Label, Select, Textarea, Toggle } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/invitation/qr";
import { ClaimBanner } from "@/components/auth/claim-banner";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthUI } from "@/components/auth/auth-ui";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { CATEGORIES } from "@/lib/categories";
import { applyOccasion, getOccasion } from "@/lib/occasions";
import { LANGUAGES } from "@/lib/i18n";
import type { CategoryId, LangCode, TemplateId } from "@/lib/types";
import { isSlugAvailable } from "@/lib/storage";
import { cn, slugify, uid, mapsSearchUrl } from "@/lib/utils";
import { toast } from "sonner";

/* --------------------------------------------------------------------------
   Shared shell for a step
   ----------------------------------------------------------------------- */

export function StepShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-title font-light">{title}</h2>
      {lead ? (
        <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-charcoal-400">
          {lead}
        </p>
      ) : null}
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   1 · Template
   ----------------------------------------------------------------------- */

export function StepTemplate() {
  const { inv, update } = useBuilder();

  return (
    <StepShell
      title="Choose a design"
      lead="Six complete worlds — type, palette, ornament, motion and background motif. You can switch at any point without losing a word of what you've written."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => {
          const active = inv.templateId === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => update({ templateId: t.id as TemplateId })}
                aria-pressed={active}
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-400",
                  active
                    ? "border-gold shadow-[var(--shadow-gold)]"
                    : "border-[var(--color-line)] hover:border-gold/40",
                )}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="size-14 shrink-0 rounded-xl ring-1 ring-black/5"
                    style={{
                      background: `linear-gradient(140deg, ${t.theme.bg} 0%, ${t.theme.bgAlt} 45%, ${t.theme.accent} 100%)`,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-[1.0625rem] text-[var(--color-heading)]">
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal-400">{t.tagline}</p>
                  </div>
                  {active ? (
                    <motion.span
                      layoutId="template-check"
                      className="ml-auto grid size-6 shrink-0 place-items-center rounded-full bg-gold text-charcoal"
                    >
                      <Check className="size-3.5" strokeWidth={2.4} />
                    </motion.span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Occasion" htmlFor="occasion">
          <Select
            id="occasion"
            value={inv.category}
            onChange={(e) =>
              update(applyOccasion(inv, e.target.value as CategoryId))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Language" htmlFor="language" hint="Urdu and Arabic switch to RTL">
          <Select
            id="language"
            value={inv.language}
            onChange={(e) => update({ language: e.target.value as LangCode })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} · {l.native}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   2 · Cover
   ----------------------------------------------------------------------- */

export function StepCover() {
  const { inv, update } = useBuilder();
  return (
    <StepShell
      title="Upload a cover image"
      lead="The photograph behind the opening screen. Skip it and the design falls back to its own gradient and ornament, which looks deliberate rather than empty."
    >
      <CoverInput
        value={inv.cover}
        focus={inv.coverFocus}
        onChange={(cover) => update({ cover })}
        onFocusChange={(coverFocus) => update({ coverFocus })}
      />
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   3 · Names
   ----------------------------------------------------------------------- */

export function StepNames() {
  const { inv, update } = useBuilder();
  const o = getOccasion(inv.category);
  const couple = o.nameMode === "couple";

  return (
    <StepShell title={o.stepTitle} lead={o.stepLead}>
      <div
        className={cn(
          "grid gap-4",
          couple
            ? "sm:grid-cols-[1fr_auto_1fr] sm:items-end"
            : "sm:grid-cols-2",
        )}
      >
        <Field label={o.primaryLabel} htmlFor="host1">
          <Input
            id="host1"
            value={inv.hostPrimary}
            onChange={(e) => update({ hostPrimary: e.target.value })}
            placeholder={o.primaryPlaceholder}
          />
        </Field>

        {couple ? (
          <Field label="Joined by" htmlFor="join" className="sm:w-20">
            <Input
              id="join"
              value={inv.joinWord}
              onChange={(e) => update({ joinWord: e.target.value })}
              placeholder="&"
              className="text-center"
            />
          </Field>
        ) : null}

        {o.secondaryLabel ? (
          <Field
            label={o.secondaryLabel}
            htmlFor="host2"
            hint={couple ? undefined : "Optional"}
          >
            <Input
              id="host2"
              value={inv.hostSecondary}
              onChange={(e) => update({ hostSecondary: e.target.value })}
              placeholder={o.secondaryPlaceholder}
            />
          </Field>
        ) : null}
      </div>

      <Field label="Line above" htmlFor="eyebrow">
        <Input
          id="eyebrow"
          value={inv.eyebrow}
          onChange={(e) => update({ eyebrow: e.target.value })}
          placeholder={o.eyebrow}
        />
      </Field>

      <Field label="Line below" htmlFor="tagline">
        <Input
          id="tagline"
          value={inv.tagline}
          onChange={(e) => update({ tagline: e.target.value })}
          placeholder={o.tagline}
        />
      </Field>

      <Field label="A note to your guests" htmlFor="note" hint="Optional">
        <Textarea
          id="note"
          value={inv.invitationNote}
          onChange={(e) => update({ invitationNote: e.target.value })}
          placeholder="A few sentences in your own voice. This is the part people remember."
        />
      </Field>
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   4 · Date  ·  5 · Time
   ----------------------------------------------------------------------- */

export function StepDate() {
  const { inv, update } = useBuilder();
  return (
    <StepShell
      title="When is it?"
      lead="This drives the countdown, the add-to-calendar link and the date block on the invitation."
    >
      <Field label="Date" htmlFor="date">
        <Input
          id="date"
          type="date"
          value={inv.date}
          onChange={(e) => update({ date: e.target.value })}
        />
      </Field>
      <Toggle
        label="Show a live countdown"
        description="A ticking counter to the hour, on every guest's screen."
        checked={inv.options.countdown}
        onChange={(countdown) => update({ options: { ...inv.options, countdown } })}
      />
    </StepShell>
  );
}

export function StepTime() {
  const { inv, update } = useBuilder();
  return (
    <StepShell
      title="What time?"
      lead="Give an end time too, and nobody has to ask when carriages are."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" htmlFor="time">
          <Input
            id="time"
            type="time"
            value={inv.time}
            onChange={(e) => update({ time: e.target.value })}
          />
        </Field>
        <Field label="Ends" htmlFor="endtime" hint="Optional">
          <Input
            id="endtime"
            type="time"
            value={inv.endTime}
            onChange={(e) => update({ endTime: e.target.value })}
          />
        </Field>
      </div>
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   6 · Venue  ·  7 · Maps
   ----------------------------------------------------------------------- */

export function StepVenue() {
  const { inv, update } = useBuilder();
  return (
    <StepShell title="Where is it?" lead="The name gets the display treatment; the address sits beneath it.">
      <Field label="Venue name" htmlFor="venue">
        <Input
          id="venue"
          value={inv.venueName}
          onChange={(e) => update({ venueName: e.target.value })}
          placeholder="The Orangery at Ashcombe Hall"
        />
      </Field>
      <Field label="Full address" htmlFor="address">
        <Textarea
          id="address"
          value={inv.venueAddress}
          onChange={(e) => update({ venueAddress: e.target.value })}
          placeholder="Ashcombe Hall, Elmswood Lane, Chester CH3 9QR"
          className="min-h-24"
        />
      </Field>
    </StepShell>
  );
}

export function StepMaps() {
  const { inv, update } = useBuilder();
  const auto = inv.venueAddress
    ? mapsSearchUrl(`${inv.venueName} ${inv.venueAddress}`.trim())
    : "";

  return (
    <StepShell
      title="Directions"
      lead="Paste a Google Maps link if you have one. If you don't, we build a search link from the address you've already given us — so this step is genuinely optional."
    >
      <Field label="Google Maps link" htmlFor="maps" hint="Optional">
        <Input
          id="maps"
          type="url"
          value={inv.mapsUrl}
          onChange={(e) => update({ mapsUrl: e.target.value })}
          placeholder="https://maps.app.goo.gl/..."
        />
      </Field>

      {auto ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-5">
          <p className="font-label text-[0.5625rem] uppercase tracking-[0.22em] text-charcoal-400">
            Falling back to
          </p>
          <a
            href={auto}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 break-all text-sm text-gold-deep underline decoration-gold/40 underline-offset-4 dark:text-gold-light"
          >
            Search Google Maps for this address
            <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.5} />
          </a>
        </div>
      ) : null}
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   8 · Gallery  ·  9 · Music
   ----------------------------------------------------------------------- */

export function StepGallery() {
  const { inv, update } = useBuilder();
  return (
    <StepShell
      title="Photographs"
      lead="These become a gallery with a full-screen lightbox. There is no upload limit and no per-photo charge, because there is no charging."
    >
      <GalleryInput value={inv.gallery} onChange={(gallery) => update({ gallery })} />

      <Field label="Video embed URL" htmlFor="video" hint="Optional">
        <Input
          id="video"
          type="url"
          value={inv.video.url}
          onChange={(e) => update({ video: { ...inv.video, url: e.target.value } })}
          placeholder="https://www.youtube.com/embed/..."
        />
      </Field>
    </StepShell>
  );
}

export function StepMusic() {
  const { inv, update } = useBuilder();
  return (
    <StepShell
      title="Background music"
      lead="Optional, and deliberately polite: it fades in over two seconds and there is always a visible control to stop it."
    >
      <AudioInput
        value={inv.music.source}
        onChange={(source) => update({ music: { ...inv.music, source } })}
      />
      <Toggle
        label="Start playing when the envelope opens"
        description="Browsers may still block this until the guest taps the control."
        checked={inv.music.autoplay}
        onChange={(autoplay) => update({ music: { ...inv.music, autoplay } })}
      />
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   10 · Timeline
   ----------------------------------------------------------------------- */

export function StepTimeline() {
  const { inv, update } = useBuilder();
  return (
    <StepShell
      title="The running order"
      lead="Arrival, ceremony, dinner, dancing. Drawn as an illustrated schedule down the middle of the invitation."
    >
      <Repeater
        items={inv.timeline}
        onChange={(timeline) => update({ timeline })}
        create={() => ({ id: uid("t_"), time: "18:00", title: "", description: "" })}
        addLabel="Add a moment"
        empty="No schedule yet. Most people add four to six moments."
        render={(item, set) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
              <Field label="Time">
                <Input type="time" value={item.time} onChange={(e) => set({ time: e.target.value })} />
              </Field>
              <Field label="What happens">
                <Input
                  value={item.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="The Ceremony"
                />
              </Field>
            </div>
            <Field label="Detail" hint="Optional">
              <Input
                value={item.description ?? ""}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="In the Orangery"
              />
            </Field>
          </div>
        )}
      />
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   11 · Dress code + every other optional section
   ----------------------------------------------------------------------- */

export function StepDetails() {
  const { inv, update } = useBuilder();
  const o = getOccasion(inv.category);

  return (
    <StepShell
      title="The rest of the day"
      lead="Dress code, your story, family, gifts, travel and questions. Turn on only what you need — anything left off simply doesn't render."
    >
      {/* Dress code */}
      <section className="space-y-4">
        <Label>Dress code</Label>
        <Field label="Title">
          <Input
            value={inv.dressCode.title}
            onChange={(e) => update({ dressCode: { ...inv.dressCode, title: e.target.value } })}
            placeholder={o.dressCodeTitle}
          />
        </Field>
        <Field label="Guidance" hint="Optional">
          <Textarea
            value={inv.dressCode.description}
            onChange={(e) =>
              update({ dressCode: { ...inv.dressCode, description: e.target.value } })
            }
            placeholder="Long dresses and dinner jackets, but wear colour if you'd rather."
          />
        </Field>
        <Field label="Palette" hint="Hex colours">
          <StringList
            items={inv.dressCode.palette}
            onChange={(palette) => update({ dressCode: { ...inv.dressCode, palette } })}
            placeholder="#c9a227"
            addLabel="Add a colour"
          />
        </Field>
      </section>

      <hr className="border-[var(--color-line)]" />

      {/* Parents */}
      <Toggle
        label="Name the parents"
        description="A blessing line above both families."
        checked={inv.parents.enabled}
        onChange={(enabled) => update({ parents: { ...inv.parents, enabled } })}
      />
      {inv.parents.enabled ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <Field label="First side label">
              <Input
                value={inv.parents.sideALabel}
                onChange={(e) =>
                  update({ parents: { ...inv.parents, sideALabel: e.target.value } })
                }
              />
            </Field>
            <StringList
              items={inv.parents.sideA}
              onChange={(sideA) => update({ parents: { ...inv.parents, sideA } })}
              placeholder="Mr. Hassan Iqbal"
              addLabel="Add a name"
            />
          </div>
          <div className="space-y-3">
            <Field label="Second side label">
              <Input
                value={inv.parents.sideBLabel}
                onChange={(e) =>
                  update({ parents: { ...inv.parents, sideBLabel: e.target.value } })
                }
              />
            </Field>
            <StringList
              items={inv.parents.sideB}
              onChange={(sideB) => update({ parents: { ...inv.parents, sideB } })}
              placeholder="Mrs. Sofia Rahman"
              addLabel="Add a name"
            />
          </div>
        </div>
      ) : null}

      <hr className="border-[var(--color-line)]" />

      {/* Story */}
      <Toggle
        label="Tell your story"
        description="A short set of dated chapters — how you got here."
        checked={inv.story.enabled}
        onChange={(enabled) => update({ story: { ...inv.story, enabled } })}
      />
      {inv.story.enabled ? (
        <Repeater
          items={inv.story.chapters}
          onChange={(chapters) => update({ story: { ...inv.story, chapters } })}
          create={() => ({ id: uid("c_"), date: "", title: "", body: "", image: null })}
          addLabel="Add a chapter"
          empty="Three chapters is usually plenty."
          render={(c, set) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <Field label="When">
                  <Input value={c.date} onChange={(e) => set({ date: e.target.value })} placeholder="2018" />
                </Field>
                <Field label="Title">
                  <Input
                    value={c.title}
                    onChange={(e) => set({ title: e.target.value })}
                    placeholder="A queue for coffee"
                  />
                </Field>
              </div>
              <Field label="The story">
                <Textarea value={c.body} onChange={(e) => set({ body: e.target.value })} />
              </Field>
            </div>
          )}
        />
      ) : null}

      <hr className="border-[var(--color-line)]" />

      {/* Family */}
      <Toggle
        label="Introduce the party"
        description="Bridesmaids, groomsmen, siblings — whoever's standing with you."
        checked={inv.family.enabled}
        onChange={(enabled) => update({ family: { ...inv.family, enabled } })}
      />
      {inv.family.enabled ? (
        <Repeater
          items={inv.family.members}
          onChange={(members) => update({ family: { ...inv.family, members } })}
          create={() => ({ id: uid("f_"), name: "", relation: "", note: "", image: null })}
          addLabel="Add a person"
          empty="Nobody added yet."
          render={(m, set) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input value={m.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="Role">
                <Input
                  value={m.relation}
                  onChange={(e) => set({ relation: e.target.value })}
                  placeholder="Maid of Honour"
                />
              </Field>
              <Field label="Note" hint="Optional" className="sm:col-span-2">
                <Input value={m.note ?? ""} onChange={(e) => set({ note: e.target.value })} />
              </Field>
            </div>
          )}
        />
      ) : null}

      <hr className="border-[var(--color-line)]" />

      {/* Gifts */}
      <Toggle
        label="Say something about gifts"
        description="The section people are most grateful to find."
        checked={inv.gifts.enabled}
        onChange={(enabled) => update({ gifts: { ...inv.gifts, enabled } })}
      />
      {inv.gifts.enabled ? (
        <div className="space-y-4">
          <Field label="Message">
            <Textarea
              value={inv.gifts.message}
              onChange={(e) => update({ gifts: { ...inv.gifts, message: e.target.value } })}
            />
          </Field>
          <Field label="Details" hint="Optional">
            <StringList
              items={inv.gifts.details}
              onChange={(details) => update({ gifts: { ...inv.gifts, details } })}
              placeholder="Honeymoon fund — details at the welcome desk"
              addLabel="Add a line"
            />
          </Field>
        </div>
      ) : null}

      <hr className="border-[var(--color-line)]" />

      {/* Travel */}
      <Toggle
        label="Travel and where to stay"
        description="Coaches, parking and nearby hotels."
        checked={inv.travel.enabled}
        onChange={(enabled) => update({ travel: { ...inv.travel, enabled } })}
      />
      {inv.travel.enabled ? (
        <div className="space-y-4">
          <Field label="Getting there">
            <Textarea
              value={inv.travel.transportation}
              onChange={(e) =>
                update({ travel: { ...inv.travel, transportation: e.target.value } })
              }
              placeholder="Coaches leave the Grosvenor at 17:45. Parking on site is free."
            />
          </Field>
          <Field label="Places to stay">
            <Repeater
              items={inv.travel.accommodation}
              onChange={(accommodation) => update({ travel: { ...inv.travel, accommodation } })}
              create={() => ({ id: uid("a_"), name: "", detail: "", link: "" })}
              addLabel="Add a hotel"
              empty="No hotels listed."
              render={(a, set) => (
                <div className="space-y-3">
                  <Field label="Name">
                    <Input value={a.name} onChange={(e) => set({ name: e.target.value })} />
                  </Field>
                  <Field label="Detail">
                    <Input
                      value={a.detail ?? ""}
                      onChange={(e) => set({ detail: e.target.value })}
                      placeholder="8 minutes away — rooms held under 'Rahman'"
                    />
                  </Field>
                  <Field label="Link" hint="Optional">
                    <Input
                      type="url"
                      value={a.link ?? ""}
                      onChange={(e) => set({ link: e.target.value })}
                    />
                  </Field>
                </div>
              )}
            />
          </Field>
        </div>
      ) : null}

      <hr className="border-[var(--color-line)]" />

      {/* FAQs */}
      <Toggle
        label="Answer the usual questions"
        description="Plus ones, children, parking, dietary needs."
        checked={inv.faqs.enabled}
        onChange={(enabled) => update({ faqs: { ...inv.faqs, enabled } })}
      />
      {inv.faqs.enabled ? (
        <Repeater
          items={inv.faqs.items}
          onChange={(items) => update({ faqs: { ...inv.faqs, items } })}
          create={() => ({ id: uid("q_"), question: "", answer: "" })}
          addLabel="Add a question"
          empty="No questions yet."
          render={(f, set) => (
            <div className="space-y-3">
              <Field label="Question">
                <Input
                  value={f.question}
                  onChange={(e) => set({ question: e.target.value })}
                  placeholder="Can I bring a plus one?"
                />
              </Field>
              <Field label="Answer">
                <Textarea value={f.answer} onChange={(e) => set({ answer: e.target.value })} />
              </Field>
            </div>
          )}
        />
      ) : null}
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   12 · RSVP
   ----------------------------------------------------------------------- */

export function StepRsvp() {
  const { inv, update } = useBuilder();
  const set = (patch: Partial<typeof inv.rsvp>) => update({ rsvp: { ...inv.rsvp, ...patch } });

  return (
    <StepShell
      title="Replies"
      lead="Ask only what you actually need. Every reply lands in your invitation dashboard, with a running head count."
    >
      <Toggle
        label="Collect RSVPs"
        description="A form at the foot of the invitation."
        checked={inv.rsvp.enabled}
        onChange={(enabled) => set({ enabled })}
      />

      {inv.rsvp.enabled ? (
        <>
          <Field label="Heading">
            <Input value={inv.rsvp.heading} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Message">
            <Textarea value={inv.rsvp.message} onChange={(e) => set({ message: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reply by" htmlFor="deadline" hint="Optional">
              <Input
                id="deadline"
                type="date"
                value={inv.rsvp.deadline}
                onChange={(e) => set({ deadline: e.target.value })}
              />
            </Field>
            <Field label="Maximum party size" htmlFor="maxg">
              <Input
                id="maxg"
                type="number"
                min={1}
                max={20}
                value={inv.rsvp.maxGuests}
                onChange={(e) => set({ maxGuests: Number(e.target.value) || 1 })}
              />
            </Field>
          </div>

          <div className="space-y-3">
            <Toggle
              label="Ask how many are coming"
              checked={inv.rsvp.askGuestCount}
              onChange={(askGuestCount) => set({ askGuestCount })}
            />
            <Toggle
              label="Ask for a meal preference"
              checked={inv.rsvp.askMeal}
              onChange={(askMeal) => set({ askMeal })}
            />
            <Toggle
              label="Let guests leave a message"
              checked={inv.rsvp.askMessage}
              onChange={(askMessage) => set({ askMessage })}
            />
          </div>

          {inv.rsvp.askMeal ? (
            <Field label="Meal options">
              <StringList
                items={inv.rsvp.mealOptions}
                onChange={(mealOptions) => set({ mealOptions })}
                placeholder="Vegetarian"
                addLabel="Add an option"
              />
            </Field>
          ) : null}
        </>
      ) : null}

      <hr className="border-[var(--color-line)]" />

      <Toggle
        label="Guest book"
        description="Notes from guests, kept long after the day."
        checked={inv.guestbook.enabled}
        onChange={(enabled) => update({ guestbook: { ...inv.guestbook, enabled } })}
      />
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   13 · Preview
   ----------------------------------------------------------------------- */

export function StepPreview() {
  const { inv, update } = useBuilder();

  return (
    <StepShell
      title="How it will feel"
      lead="The panel beside this is the real invitation, rendering live. These switches change the experience your guests get when they open the link."
    >
      <Toggle
        label="Envelope opening"
        description="Guests press a wax seal, the flap folds back and the card is drawn out."
        checked={inv.options.envelope}
        onChange={(envelope) => update({ options: { ...inv.options, envelope } })}
      />
      <Toggle
        label="Ambient effects"
        description="Gold dust, petals, stars or lanterns — whichever suits the design."
        checked={inv.options.particles}
        onChange={(particles) => update({ options: { ...inv.options, particles } })}
      />
      <Toggle
        label="Countdown"
        description="A live counter to the hour."
        checked={inv.options.countdown}
        onChange={(countdown) => update({ options: { ...inv.options, countdown } })}
      />
      <Toggle
        label="QR code in the footer"
        description="For printed cards, table settings and posters."
        checked={inv.options.qrCode}
        onChange={(qrCode) => update({ options: { ...inv.options, qrCode } })}
      />

      <div className="rounded-2xl border border-gold/25 bg-gold/6 p-5">
        <p className="flex items-center gap-2 font-serif text-[0.9375rem] text-[var(--color-heading)]">
          <Sparkles className="size-4 text-gold" strokeWidth={1.4} />
          Everything here is on by default and free
        </p>
        <p className="mt-2 text-xs leading-relaxed text-charcoal-400">
          Motion also respects each guest’s system settings — anyone who has asked
          their device to reduce motion gets a still, fully readable invitation.
        </p>
      </div>
    </StepShell>
  );
}

/* --------------------------------------------------------------------------
   14 · Publish
   ----------------------------------------------------------------------- */

export function StepPublish() {
  const { inv, update, commit } = useBuilder();
  const [slug, setSlug] = useState(inv.slug);
  const [status, setStatus] = useState<"idle" | "taken" | "free">("idle");
  const [origin, setOrigin] = useState("");
  const [publishing, setPublishing] = useState(false);
  const template = getTemplate(inv.templateId);
  const { enabled: authEnabled, isAnonymous, email, emailConfirmed, loading: authLoading } = useAuth();
  const { openAuth } = useAuthUI();
  const hasAccount = Boolean(email) && !isAnonymous && emailConfirmed;

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    const clean = slugify(slug);
    if (!clean) return setStatus("idle");
    let alive = true;
    isSlugAvailable(clean, inv.id)
      .then((ok) => alive && setStatus(ok ? "free" : "taken"))
      .catch(() => alive && setStatus("idle"));
    return () => {
      alive = false;
    };
  }, [slug, inv.id]);

  const url = origin ? `${origin}/i/${inv.slug}` : "";
  const ready = Boolean(inv.hostPrimary.trim() && inv.date) && authEnabled && !authLoading && !publishing;
  const localPreview = origin ? ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname) : false;

  /** The actual write. Split out so the account prompt can call it too. */
  async function doPublish() {
    setPublishing(true);
    try {
      const clean = slugify(slug) || inv.id;
      if (!(await isSlugAvailable(clean, inv.id))) {
        toast.error("That link is already taken", { description: "Try adding the year, or a middle name." });
        return;
      }
      await commit({ slug: clean, published: true });
      toast.success("Published", {
        description: "Saved online. Your guest link is ready.",
      });
    } catch (err) {
      toast.error("Could not publish", {
        description:
          err instanceof Error ? err.message : "Please check your connection and try again.",
      });
    } finally {
      setPublishing(false);
    }
  }

  /** Account checks here are backed by validated user checks and database RLS. */
  async function publish() {
    if (!authEnabled) {
      toast.error("Online saving is unavailable");
      return;
    }
    if (!hasAccount) {
      openAuth("claim", {
        redirectPath: `/my-invitations/${inv.id}`,
      });
      return;
    }
    await doPublish();
  }

  return (
    <StepShell
      title="Publish and share"
      lead="Claim a link, copy it into a message, or print the QR code onto a card. There is no checkout between you and this button."
    >
      <ClaimBanner tone="publish" />

      <Field
        label="Custom link"
        htmlFor="slug"
        hint={
          status === "taken" ? "Already used" : status === "free" ? "Available" : undefined
        }
      >
        <div className="flex items-stretch overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] focus-within:border-gold/70">
          <span className="grid shrink-0 place-items-center border-r border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-3 font-mono text-xs text-charcoal-400">
            /i/
          </span>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={() => update({ slug: slugify(slug) || inv.slug })}
            placeholder="amara-and-zayn"
            className="h-12 w-full bg-transparent px-3.5 text-sm text-[var(--color-heading)] outline-none"
          />
        </div>
      </Field>
      {status === "taken" ? (
        <p className="-mt-3 text-xs text-red-600 dark:text-red-400">
          Another invitation already uses that address.
        </p>
      ) : null}

      {!ready ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-5">
          <p className="text-sm text-charcoal-400">
            Add at least a name and a date before publishing — steps three and four.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={publish} disabled={!ready} size="lg">
          {publishing ? "Publishing…" : inv.published ? "Update the live link" : "Publish invitation"}
        </Button>
        {inv.published ? (
          <Button asChild variant="outline" size="lg">
            <Link href={`/i/${inv.slug}`} target="_blank">
              Open it
              <ExternalLink />
            </Link>
          </Button>
        ) : null}
      </div>

      {inv.published && url ? (
        <div className="rounded-2xl border border-[var(--color-line)] p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <QrCode
              value={url}
              size={128}
              dark={template.theme.ink}
              light="#ffffff"
              className="mx-auto shrink-0 ring-1 ring-[var(--color-line)] sm:mx-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-label text-[0.5625rem] uppercase tracking-[0.22em] text-charcoal-400">
                Your link
              </p>
              <p className="mt-2 break-all font-mono text-sm text-[var(--color-heading)]">{url}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
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
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `You're invited — ${inv.hostPrimary} ${inv.joinWord} ${inv.hostSecondary}\n${url}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Share on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {localPreview ? <p className="rounded-2xl border border-amber-400/40 p-4 text-xs leading-relaxed text-charcoal-600 dark:text-charcoal-200">
        You are previewing on localhost. To share with guests on other devices, open this invitation from your deployed website.
      </p> : null}
        <p className="text-xs leading-relaxed text-charcoal-400">
          Your invitation is stored on your Invitra account and opens on any
          device. Replies and guest-book notes come back to{" "}
          <Link href="/my-invitations" className="underline decoration-gold/40 underline-offset-4">
            My Invitations
          </Link>
          .
        </p>
    </StepShell>
  );
}
