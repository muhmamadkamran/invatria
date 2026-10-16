"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  CalendarPlus,
  ChevronDown,
  MapPin,
  Navigation,
  Shirt,
  Gift,
  BedDouble,
  Bus,
} from "lucide-react";
import type { Invitation } from "@/lib/types";
import { getTemplate, themeVars } from "@/lib/templates";
import { getOccasion } from "@/lib/occasions";
import { isRtl, t } from "@/lib/i18n";
import { mediaUrl } from "@/lib/storage";
import {
  calendarUrl,
  formatDateParts,
  formatLongDate,
  formatTime,
  resolveMapsUrl,
  toDateTime,
} from "@/lib/utils";
import { TemplateFx } from "@/components/fx";
import { Ornament, Pattern } from "./pattern";
import { Envelope } from "./envelope";
import { Countdown } from "./countdown";
import { Gallery } from "./gallery";
import { MusicPlayer } from "./music-player";
import { RsvpForm } from "./rsvp-form";
import { Guestbook } from "./guestbook";
import { QrCode } from "./qr";
import { InvHeading, InvLabel, InvPanel, InvReveal, InvSection } from "./parts";
import { InvitationNames, namesToText } from "./names";

export function InvitationView({
  invitation,
  /** Preview mode skips the envelope and disables the fixed music button. */
  preview = false,
  publicUrl,
}: {
  invitation: Invitation;
  preview?: boolean;
  publicUrl?: string;
}) {
  const template = getTemplate(invitation.templateId);
  const copy = t(invitation.language);
  const occasion = getOccasion(invitation.category);
  const rtl = isRtl(invitation.language);
  const reduce = useReducedMotion();

  const useEnvelope = invitation.options.envelope && !preview;
  const [opened, setOpened] = useState(!useEnvelope);
  const [cover, setCover] = useState("");

  function markOpened() {
    setOpened(true);
  }

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const coverY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    let alive = true;
    mediaUrl(invitation.cover).then((u) => alive && setCover(u));
    return () => {
      alive = false;
    };
  }, [invitation.cover]);

  /* Scroll is locked only while the envelope is genuinely covering the page.
     The lock is released on every path out — opened, unmounted, or navigated
     away — because a page you cannot scroll is worse than a missed animation. */
  useEffect(() => {
    if (!useEnvelope || opened) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, useEnvelope]);

  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  const d = formatDateParts(invitation.date);
  const start = toDateTime(invitation.date, invitation.time);
  const end = invitation.endTime ? toDateTime(invitation.date, invitation.endTime) : null;
  const maps = resolveMapsUrl(invitation.mapsUrl, invitation.venueName
    ? `${invitation.venueName}, ${invitation.venueAddress}`
    : invitation.venueAddress);
  const calendar = calendarUrl({
    title: namesToText(invitation),
    start,
    end,
    details: invitation.tagline,
    location: [invitation.venueName, invitation.venueAddress].filter(Boolean).join(", "),
  });

  const actionStyle = {
    borderColor: "var(--t-line)",
    color: "var(--t-ink)",
    fontFamily: "var(--t-label)",
  } as React.CSSProperties;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      style={themeVars(template)}
      className="relative min-h-screen"
    >
      <div
        className="relative overflow-hidden"
        style={{ background: "var(--t-bg)", color: "var(--t-ink)" }}
      >
        {useEnvelope && !opened ? (
          <Envelope
            invitation={invitation}
            template={template}
            onOpen={markOpened}
          />
        ) : null}

        {/* Ambient effects sit behind the content — sections are very slightly
            translucent so drifting particles read through them rather than
            over the words. */}
        {invitation.options.particles ? (
          <div className="pointer-events-none fixed inset-0 z-0">
            <TemplateFx
              fx={template.fx}
              accent={template.theme.accent}
              accentSoft={template.theme.accentSoft}
            />
          </div>
        ) : null}

        <Pattern template={template} opacity={template.dark ? 0.06 : 0.05} />

        {/* ================= HERO ================= */}
        <div ref={heroRef} className="relative grid min-h-[100svh] place-items-center overflow-hidden px-5">
          {cover ? (
            <motion.div
              style={{ y: reduce ? 0 : coverY }}
              className="absolute inset-0 -z-10 scale-110"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt=""
                className="size-full object-cover"
                style={{
                  objectPosition: `${invitation.coverFocus.x}% ${invitation.coverFocus.y}%`,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: template.dark
                    ? `linear-gradient(180deg, ${template.theme.bg}cc, ${template.theme.bg}88 45%, ${template.theme.bg} 100%)`
                    : `linear-gradient(180deg, ${template.theme.bg}bb, ${template.theme.bg}77 45%, ${template.theme.bg} 100%)`,
                }}
              />
            </motion.div>
          ) : (
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: `radial-gradient(ellipse 90% 65% at 50% 30%, var(--t-bg-alt), var(--t-bg) 76%)`,
              }}
            />
          )}

          <motion.div
            style={{ opacity: reduce ? 1 : heroFade }}
            className="relative z-10 w-full max-w-2xl text-center"
          >
            <InvReveal delay={0.1}>
              <p
                className="text-[0.6875rem] uppercase tracking-[0.34em]"
                style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
              >
                {invitation.eyebrow}
              </p>
            </InvReveal>

            <InvReveal delay={0.2}>
              <h1 className="mt-8">
                <InvitationNames invitation={invitation} variant="hero" />
              </h1>
            </InvReveal>

            <InvReveal delay={0.3}>
              <Ornament template={template} width={230} className="mt-8 opacity-80" />
              <p
                className="mt-6 text-sm italic"
                style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-display)" }}
              >
                {invitation.tagline}
              </p>
            </InvReveal>

            <InvReveal delay={0.4}>
              <div
                className="mx-auto mt-9 flex w-fit items-center gap-4 border-y py-4 sm:gap-6"
                style={{ borderColor: "var(--t-line)" }}
              >
                <span
                  className="text-[0.625rem] uppercase tracking-[0.2em]"
                  style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                >
                  {d.weekday}
                </span>
                <span
                  className="text-[clamp(1.75rem,6vw,2.5rem)] font-light leading-none"
                  style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                >
                  {d.day}
                </span>
                <span className="flex flex-col items-start">
                  <span
                    className="text-[0.6875rem] uppercase tracking-[0.2em]"
                    style={{ color: "var(--t-ink)", fontFamily: "var(--t-label)" }}
                  >
                    {d.month}
                  </span>
                  <span
                    className="text-[0.625rem] tracking-[0.2em]"
                    style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                  >
                    {d.year}
                  </span>
                </span>
                {invitation.time ? (
                  <span
                    dir="ltr"
                    className="text-[0.625rem] uppercase tracking-[0.2em]"
                    style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                  >
                    {formatTime(invitation.time)}
                  </span>
                ) : null}
              </div>
            </InvReveal>
          </motion.div>

          {!reduce ? (
            <motion.div
              aria-hidden
              animate={{ y: [0, 9, 0], opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              style={{ color: "var(--t-accent)" }}
            >
              <ChevronDown className="size-5" strokeWidth={1.2} />
            </motion.div>
          ) : null}
        </div>

        {/* ================= COUNTDOWN ================= */}
        {invitation.options.countdown ? (
          <InvSection alt>
            <Countdown
              date={invitation.date}
              time={invitation.time}
              language={invitation.language}
            />
          </InvSection>
        ) : null}

        {/* ================= NOTE + PARENTS ================= */}
        {invitation.invitationNote || invitation.parents.enabled ? (
          <InvSection>
            {invitation.invitationNote ? (
              <InvReveal className="text-center">
                <p
                  className="mx-auto max-w-xl text-pretty text-[1.0625rem] leading-loose"
                  style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                >
                  {invitation.invitationNote}
                </p>
              </InvReveal>
            ) : null}

            {invitation.parents.enabled ? (
              <div className="mt-14">
                <InvReveal className="text-center">
                  <InvLabel>{invitation.parents.heading}</InvLabel>
                </InvReveal>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                  {[
                    { label: invitation.parents.sideALabel, names: invitation.parents.sideA },
                    { label: invitation.parents.sideBLabel, names: invitation.parents.sideB },
                  ].map((side, i) =>
                    side.names.length ? (
                      <InvReveal key={side.label} delay={i * 0.1} className="text-center">
                        <p
                          className="text-[0.5625rem] uppercase tracking-[0.24em]"
                          style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                        >
                          {side.label}
                        </p>
                        {side.names.map((n) => (
                          <p
                            key={n}
                            className="mt-2 text-lg"
                            style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                          >
                            {n}
                          </p>
                        ))}
                      </InvReveal>
                    ) : null,
                  )}
                </div>
              </div>
            ) : null}
          </InvSection>
        ) : null}

        {/* ================= SCHEDULE ================= */}
        {invitation.timeline.length ? (
          <InvSection alt id="schedule">
            <InvHeading
              template={template}
              title={
                invitation.language === "en" ? occasion.scheduleHeading : copy.schedule
              }
            />
            <ol className="relative mt-12 pl-8 sm:pl-0">
              <span
                aria-hidden
                className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px sm:left-1/2"
                style={{ background: "var(--t-line)" }}
              />
              {invitation.timeline.map((item, i) => (
                <li key={item.id} className="relative pb-10 last:pb-0">
                  <InvReveal delay={0.05} y={22}>
                    <div
                      className={`sm:flex sm:items-baseline sm:gap-8 ${
                        i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`sm:w-1/2 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}
                      >
                        <p
                          dir="ltr"
                          className="text-[0.6875rem] uppercase tracking-[0.24em]"
                          style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
                        >
                          {formatTime(item.time)}
                        </p>
                        <h3
                          className="mt-1.5 text-xl font-light"
                          style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                        >
                          {item.title}
                        </h3>
                        {item.description ? (
                          <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                          >
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="hidden sm:block sm:w-1/2" />
                    </div>
                  </InvReveal>
                  <span
                    aria-hidden
                    className="absolute -left-8 top-1.5 size-2 rotate-45 sm:left-1/2 sm:-translate-x-1/2"
                    style={{ background: "var(--t-accent)" }}
                  />
                </li>
              ))}
            </ol>
          </InvSection>
        ) : null}

        {/* ================= VENUE ================= */}
        {invitation.venueName || invitation.venueAddress ? (
          <InvSection id="venue">
            <InvHeading template={template} eyebrow={copy.where} title={invitation.venueName} />
            <InvReveal delay={0.1} className="mt-10 text-center">
              <p
                className="mx-auto max-w-md text-pretty text-[0.9375rem] leading-relaxed"
                style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
              >
                {invitation.venueAddress}
              </p>
              <p
                className="mt-4 text-sm"
                style={{ color: "var(--t-ink)", fontFamily: "var(--t-body)" }}
              >
                <span dir="ltr">
                  {formatLongDate(invitation.date)}
                  {invitation.time ? ` · ${formatTime(invitation.time)}` : ""}
                  {invitation.endTime ? ` – ${formatTime(invitation.endTime)}` : ""}
                </span>
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {maps ? (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-transform duration-300 hover:-translate-y-0.5"
                    style={actionStyle}
                  >
                    <Navigation className="size-3.5" strokeWidth={1.5} />
                    {copy.directions}
                  </a>
                ) : null}
                {calendar ? (
                  <a
                    href={calendar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[0.6875rem] uppercase tracking-[0.16em] transition-transform duration-300 hover:-translate-y-0.5"
                    style={actionStyle}
                  >
                    <CalendarPlus className="size-3.5" strokeWidth={1.5} />
                    {copy.addToCalendar}
                  </a>
                ) : null}
              </div>
            </InvReveal>

            {maps ? (
              <InvReveal delay={0.15} className="mt-10">
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-2xl border"
                  style={{ borderColor: "var(--t-line)" }}
                >
                  <div
                    className="grid h-52 place-items-center"
                    style={{
                      background: `linear-gradient(140deg, var(--t-bg-alt), var(--t-surface))`,
                    }}
                  >
                    <div className="text-center">
                      <MapPin
                        className="mx-auto size-7 transition-transform duration-500 group-hover:-translate-y-1"
                        strokeWidth={1.2}
                        style={{ color: "var(--t-accent)" }}
                      />
                      <p
                        className="mt-3 text-[0.6875rem] uppercase tracking-[0.22em]"
                        style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                      >
                        {copy.directions}
                      </p>
                    </div>
                  </div>
                </a>
              </InvReveal>
            ) : null}
          </InvSection>
        ) : null}

        {/* ================= DRESS CODE ================= */}
        {invitation.dressCode.title ? (
          <InvSection alt>
            <InvHeading
              template={template}
              eyebrow={copy.dressCode}
              title={invitation.dressCode.title}
              lead={invitation.dressCode.description}
            />
            {invitation.dressCode.palette.length ? (
              <InvReveal delay={0.1} className="mt-9 flex justify-center gap-3">
                {invitation.dressCode.palette.map((c) => (
                  <span
                    key={c}
                    className="size-10 rounded-full ring-1"
                    style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)" }}
                    title={c}
                  />
                ))}
              </InvReveal>
            ) : (
              <InvReveal delay={0.1} className="mt-8 flex justify-center">
                <Shirt className="size-6" strokeWidth={1.1} style={{ color: "var(--t-accent)" }} />
              </InvReveal>
            )}
          </InvSection>
        ) : null}

        {/* ================= STORY ================= */}
        {invitation.story.enabled && invitation.story.chapters.length ? (
          <InvSection>
            <InvHeading template={template} title={invitation.story.heading} />
            <div className="mt-12 space-y-10">
              {invitation.story.chapters.map((c, i) => (
                <InvReveal key={c.id} delay={0.05} y={26}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
                    <p
                      className="shrink-0 text-3xl font-light sm:w-24 sm:text-right"
                      style={{ color: "var(--t-accent)", fontFamily: "var(--t-display)" }}
                    >
                      {c.date}
                    </p>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-xl font-light"
                        style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                      >
                        {c.title}
                      </h3>
                      <p
                        className="mt-2 text-[0.9375rem] leading-relaxed"
                        style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                      >
                        {c.body}
                      </p>
                      {i < invitation.story.chapters.length - 1 ? (
                        <span
                          aria-hidden
                          className="mt-8 block h-px w-full"
                          style={{ background: "var(--t-line)" }}
                        />
                      ) : null}
                    </div>
                  </div>
                </InvReveal>
              ))}
            </div>
          </InvSection>
        ) : null}

        {/* ================= FAMILY ================= */}
        {invitation.family.enabled && invitation.family.members.length ? (
          <InvSection alt>
            <InvHeading template={template} title={invitation.family.heading} />
            <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {invitation.family.members.map((m, i) => (
                <li key={m.id}>
                  <InvReveal delay={i * 0.06}>
                    <InvPanel className="p-5 text-center">
                      <span
                        className="mx-auto grid size-14 place-items-center rounded-full text-lg"
                        style={{
                          background: "color-mix(in oklab, var(--t-accent) 16%, transparent)",
                          color: "var(--t-accent)",
                          fontFamily: "var(--t-display)",
                        }}
                      >
                        {m.name.slice(0, 1)}
                      </span>
                      <p
                        className="mt-4 text-[0.9375rem]"
                        style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                      >
                        {m.name}
                      </p>
                      <p
                        className="mt-1 text-[0.5625rem] uppercase tracking-[0.18em]"
                        style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
                      >
                        {m.relation}
                      </p>
                      {m.note ? (
                        <p
                          className="mt-2 text-[0.6875rem] leading-relaxed"
                          style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                        >
                          {m.note}
                        </p>
                      ) : null}
                    </InvPanel>
                  </InvReveal>
                </li>
              ))}
            </ul>
          </InvSection>
        ) : null}

        {/* ================= GALLERY ================= */}
        {invitation.gallery.length ? (
          <InvSection id="gallery">
            <InvHeading template={template} title={copy.gallery} />
            <div className="mt-12">
              <Gallery images={invitation.gallery} />
            </div>
          </InvSection>
        ) : null}

        {/* ================= VIDEO ================= */}
        {invitation.video.url ? (
          <InvSection alt>
            <InvHeading template={template} title={invitation.video.title || "Watch"} />
            <InvReveal delay={0.1} className="mt-10">
              <div
                className="aspect-video w-full overflow-hidden rounded-2xl border"
                style={{ borderColor: "var(--t-line)" }}
              >
                <iframe
                  src={invitation.video.url}
                  title={invitation.video.title || "Invitation video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                  loading="lazy"
                  className="size-full"
                />
              </div>
            </InvReveal>
          </InvSection>
        ) : null}

        {/* ================= GIFTS ================= */}
        {invitation.gifts.enabled ? (
          <InvSection>
            <InvHeading
              template={template}
              eyebrow={copy.gifts}
              title={invitation.gifts.heading}
              lead={invitation.gifts.message}
            />
            {invitation.gifts.details.length ? (
              <InvReveal delay={0.1} className="mt-10">
                <InvPanel glass className="mx-auto max-w-lg">
                  <ul className="space-y-3">
                    {invitation.gifts.details.map((g) => (
                      <li key={g} className="flex items-start gap-3">
                        <Gift
                          className="mt-0.5 size-4 shrink-0"
                          strokeWidth={1.3}
                          style={{ color: "var(--t-accent)" }}
                        />
                        <span
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                        >
                          {g}
                        </span>
                      </li>
                    ))}
                  </ul>
                </InvPanel>
              </InvReveal>
            ) : null}
          </InvSection>
        ) : null}

        {/* ================= TRAVEL ================= */}
        {invitation.travel.enabled ? (
          <InvSection alt>
            <InvHeading template={template} title={copy.travel} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {invitation.travel.transportation ? (
                <InvReveal>
                  <InvPanel className="h-full">
                    <Bus className="size-5" strokeWidth={1.2} style={{ color: "var(--t-accent)" }} />
                    <h3
                      className="mt-4 text-lg font-light"
                      style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                    >
                      {copy.transportation}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                    >
                      {invitation.travel.transportation}
                    </p>
                  </InvPanel>
                </InvReveal>
              ) : null}

              {invitation.travel.accommodation.length ? (
                <InvReveal delay={0.1}>
                  <InvPanel className="h-full">
                    <BedDouble
                      className="size-5"
                      strokeWidth={1.2}
                      style={{ color: "var(--t-accent)" }}
                    />
                    <h3
                      className="mt-4 text-lg font-light"
                      style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                    >
                      {copy.accommodation}
                    </h3>
                    <ul className="mt-3 space-y-3">
                      {invitation.travel.accommodation.map((a) => (
                        <li key={a.id}>
                          <p
                            className="text-sm"
                            style={{ color: "var(--t-ink)", fontFamily: "var(--t-body)" }}
                          >
                            {a.link ? (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-4"
                              >
                                {a.name}
                              </a>
                            ) : (
                              a.name
                            )}
                          </p>
                          {a.detail ? (
                            <p
                              className="text-xs"
                              style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                            >
                              {a.detail}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </InvPanel>
                </InvReveal>
              ) : null}
            </div>
          </InvSection>
        ) : null}

        {/* ================= FAQS ================= */}
        {invitation.faqs.enabled && invitation.faqs.items.length ? (
          <InvSection>
            <InvHeading template={template} title={copy.faqs} />
            <ul className="mt-12">
              {invitation.faqs.items.map((f, i) => (
                <li
                  key={f.id}
                  className="border-b py-6 first:border-t"
                  style={{ borderColor: "var(--t-line)" }}
                >
                  <InvReveal delay={i * 0.04}>
                    <h3
                      className="text-[1.0625rem] font-light"
                      style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
                    >
                      {f.question}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                    >
                      {f.answer}
                    </p>
                  </InvReveal>
                </li>
              ))}
            </ul>
          </InvSection>
        ) : null}

        {/* ================= RSVP ================= */}
        {invitation.rsvp.enabled ? (
          <InvSection alt id="rsvp">
            <InvHeading
              template={template}
              eyebrow={copy.rsvp}
              title={invitation.rsvp.heading}
              lead={invitation.rsvp.message}
            />
            <div className="mt-10">
              <RsvpForm invitation={invitation} />
            </div>
          </InvSection>
        ) : null}

        {/* ================= GUEST BOOK ================= */}
        {invitation.guestbook.enabled ? (
          <InvSection id="guestbook">
            <InvHeading
              template={template}
              title={invitation.guestbook.heading}
              lead={invitation.guestbook.message}
            />
            <div className="mt-10">
              <Guestbook invitation={invitation} />
            </div>
          </InvSection>
        ) : null}

        {/* ================= FOOTER ================= */}
        <footer
          className="relative px-5 py-16 text-center"
          style={{ background: "var(--t-bg-alt)" }}
        >
          <div className="mx-auto max-w-md">
            <Ornament template={template} width={200} className="opacity-70" />
            <InvitationNames invitation={invitation} variant="footer" className="mt-7" />
            <p
              className="mt-3 text-[0.6875rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
            >
              {formatLongDate(invitation.date)}
            </p>

            {invitation.options.qrCode && publicUrl ? (
              <div className="mt-10 flex flex-col items-center">
                <QrCode
                  value={publicUrl}
                  size={128}
                  dark={template.theme.ink}
                  light={template.theme.surface}
                />
                <p
                  className="mt-3 text-[0.5625rem] uppercase tracking-[0.24em]"
                  style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                >
                  {copy.scanToOpen}
                </p>
              </div>
            ) : null}

            <p
              className="mt-12 text-[0.625rem] uppercase tracking-[0.24em] opacity-60"
              style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
            >
              {copy.madeWith}
            </p>
          </div>
        </footer>

        {!preview ? (
          <MusicPlayer
            music={invitation.music}
            language={invitation.language}
            started={opened}
          />
        ) : null}
      </div>
    </div>
  );
}
