"use client";

import { OptimizedPhoto } from "@/components/optimized-photo";

import { useEffect, useState } from "react";
import type { Invitation } from "@/lib/types";
import { getTemplate, themeVars, type TemplateDef } from "@/lib/templates";
import { formatDateParts, formatTime, cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/storage";
import { Ornament, Pattern } from "./pattern";
import { InvitationNames } from "./names";
import { getOccasion } from "@/lib/occasions";

/** The invitation reduced to a card — used in the hero, the template gallery
 *  and the builder's live preview. Same data, one scale-independent layout. */
export function CardPreview({
  invitation,
  template: templateOverride,
  className,
  showPhoto = true,
}: {
  invitation: Invitation;
  template?: TemplateDef;
  className?: string;
  showPhoto?: boolean;
}) {
  const template = templateOverride ?? getTemplate(invitation.templateId);
  const { theme } = template;
  const d = formatDateParts(invitation.date);
  const occasion = getOccasion(invitation.category);
  const [cover, setCover] = useState(invitation.cover?.url ?? "");

  useEffect(() => {
    let alive = true;
    if (!invitation.cover) {
      setCover("");
      return;
    }
    mediaUrl(invitation.cover).then((u) => alive && setCover(u));
    return () => {
      alive = false;
    };
  }, [invitation.cover]);

  return (
    <div
      style={themeVars(template)}
      className={cn(
        "relative isolate flex aspect-[5/7] w-full flex-col overflow-hidden rounded-[1.35rem] [container-type:inline-size]",
        className,
      )}
    >
      {/* canvas */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `linear-gradient(165deg, ${theme.bg} 0%, ${theme.bgAlt} 52%, ${theme.bg} 100%)`,
        }}
      />
      <Pattern template={template} opacity={template.dark ? 0.1 : 0.08} scale={0.62} />

      {/* corner glow, so the card never reads as flat */}
      <div
        className="absolute -left-1/4 -top-1/4 -z-10 size-2/3 rounded-full blur-3xl"
        style={{ background: theme.accent, opacity: template.dark ? 0.16 : 0.13 }}
      />

      {/* foil frame */}
      <div
        className="pointer-events-none absolute inset-[9px] rounded-[0.95rem] border"
        style={{ borderColor: theme.accent, opacity: 0.42 }}
      />
      <div
        className="pointer-events-none absolute inset-[14px] rounded-[0.7rem] border"
        style={{ borderColor: theme.accent, opacity: 0.16 }}
      />

      {/* photo window */}
      {showPhoto ? (
        <div className="relative mx-auto mt-[10%] h-[30%] w-[62%] shrink-0 overflow-hidden rounded-full">
          {cover ? (
            <OptimizedPhoto
              src={cover}
                sizes="(max-width: 768px) 100vw, 800px"
              alt=""
              className="size-full object-cover"
              style={{ objectPosition: `${invitation.coverFocus.x}% ${invitation.coverFocus.y}%` }}
            />
          ) : (
            <div
              className="grid size-full place-items-center"
              style={{
                background: `linear-gradient(150deg, ${theme.accent}22, ${theme.accentSoft}33)`,
              }}
            >
              <Ornament template={template} width={110} className="opacity-70" />
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 rounded-full border"
            style={{ borderColor: theme.accent, opacity: 0.55 }}
          />
        </div>
      ) : null}

      {/* copy */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[9%] pb-[7%] text-center">
        <p
          className="text-[clamp(0.42rem,1.5cqw,0.62rem)] uppercase leading-none"
          style={{
            color: theme.inkSoft,
            fontFamily: "var(--t-label)",
            letterSpacing: "0.3em",
          }}
        >
          {invitation.eyebrow || occasion.eyebrow}
        </p>

        <InvitationNames invitation={invitation} variant="card" className="mt-[5%]" fallback />

        <Ornament template={template} width={130} className="my-[6%] opacity-80" />

        <div
          className="flex items-center gap-[0.6em] text-[clamp(0.5rem,1.9cqw,0.75rem)] uppercase"
          style={{ color: theme.ink, fontFamily: "var(--t-label)", letterSpacing: "0.16em" }}
        >
          <span>{d.weekday?.slice(0, 3)}</span>
          <span style={{ color: theme.accent }}>·</span>
          <span className="text-[1.5em] tracking-normal" style={{ fontFamily: "var(--t-display)" }}>
            {d.day} {d.monthShort}
          </span>
          <span style={{ color: theme.accent }}>·</span>
          <span>{d.year}</span>
        </div>

        <p
          className="mt-[4%] line-clamp-2 text-[clamp(0.44rem,1.6cqw,0.68rem)] leading-relaxed"
          style={{ color: theme.inkSoft, fontFamily: "var(--t-body)" }}
        >
          {invitation.time ? `${formatTime(invitation.time)} · ` : ""}
          {invitation.venueName || occasion.demo.venue}
        </p>
      </div>

      {/* paper sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.35rem]"
        style={{
          background:
            "linear-gradient(118deg, rgba(255,255,255,0.16) 0%, transparent 26%, transparent 74%, rgba(255,255,255,0.09) 100%)",
        }}
      />
    </div>
  );
}
