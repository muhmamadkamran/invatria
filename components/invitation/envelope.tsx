"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TemplateDef } from "@/lib/templates";
import { themeVars } from "@/lib/templates";
import type { Invitation } from "@/lib/types";
import { t } from "@/lib/i18n";
import { formatDateParts, initials } from "@/lib/utils";
import { TemplateFx } from "@/components/fx";
import { Ornament, Pattern } from "./pattern";
import { InvitationNames } from "./names";

/* ============================================================================
   The envelope.

   Geometry is the classic reverse of a real envelope: two side flaps meeting
   in the middle, a bottom flap folded up over them, and a top flap folded
   down and sealed. Pressing the seal lifts it, folds the top flap back in 3D,
   and draws the card up out of the pocket before handing over to the page.
   ========================================================================= */

const FLAP_TOP = 52; // % of height covered by the top flap when closed
const POCKET_TOP = 44; // % where the bottom flap's peak sits

export function Envelope({
  invitation,
  template,
  onOpen,
}: {
  invitation: Invitation;
  template: TemplateDef;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<"sealed" | "opening" | "gone">("sealed");
  const { theme } = template;
  const copy = t(invitation.language);
  const d = formatDateParts(invitation.date);

  const monogram =
    initials(invitation.hostPrimary || "A") + initials(invitation.hostSecondary || "Z");

  /* The parent re-creates `onOpen` on every render; holding it in a ref keeps
     that churn from restarting the timers below. */
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  });

  useEffect(() => {
    if (stage !== "opening") return;
    const id = setTimeout(() => setStage("gone"), reduce ? 150 : 2600);
    return () => clearTimeout(id);
  }, [stage, reduce]);

  /* Handing back to the page is its own effect, keyed on the terminal stage.
     Keeping it with the timer above meant the `gone` transition re-ran that
     effect, whose cleanup cancelled the hand-off before it could fire — and
     the page stayed scroll-locked behind an envelope that had already gone. */
  useEffect(() => {
    if (stage !== "gone") return;
    const id = setTimeout(() => onOpenRef.current(), reduce ? 0 : 620);
    return () => clearTimeout(id);
  }, [stage, reduce]);

  const open = stage !== "sealed";
  const press = () => stage === "sealed" && setStage("opening");

  /* A single shared edge colour keeps every fold reading as one piece of
     paper caught in the same light. */
  const edge = `${theme.accent}44`;

  return (
    <AnimatePresence>
      {stage !== "gone" ? (
        <motion.div
          key="envelope"
          style={themeVars(template)}
          exit={{ opacity: 0, scale: 1.07, filter: "blur(9px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden px-6 py-10"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 85% 65% at 50% 42%, ${theme.bgAlt}, ${theme.bg} 74%)`,
            }}
          />
          <Pattern template={template} opacity={template.dark ? 0.07 : 0.05} />
          <TemplateFx fx={template.fx} accent={theme.accent} accentSoft={theme.accentSoft} />

          <div className="relative flex w-full max-w-[22rem] flex-col items-center">
            <motion.p
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className="mb-7 text-center text-[0.625rem] uppercase leading-relaxed tracking-[0.3em]"
              style={{ color: theme.inkSoft, fontFamily: "var(--t-label)" }}
            >
              {invitation.eyebrow}
            </motion.p>

            {/* ---------------- envelope ---------------- */}
            <div
              className="relative aspect-[5/6.6] w-full"
              style={{ perspective: "1500px" }}
            >
              {/* drop shadow beneath the whole object */}
              <div
                aria-hidden
                className="absolute inset-x-6 bottom-2 top-8 rounded-lg"
                style={{ boxShadow: "0 50px 90px -30px rgba(0,0,0,0.75)" }}
              />

              {/* --- the pocket interior (what you'd see inside) --- */}
              <div
                className="absolute inset-0 overflow-hidden rounded-[0.55rem]"
                style={{ background: theme.envelopeLiner }}
              />

              {/* --- the card, drawn up out of the pocket --- */}
              <motion.div
                initial={false}
                animate={open ? { y: "-46%" } : { y: "4%" }}
                transition={{
                  duration: reduce ? 0.01 : 1.3,
                  delay: reduce ? 0 : 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-x-[8%] bottom-[8%] top-[4%] z-10 rounded-[0.4rem] p-5"
                style={{
                  background: `linear-gradient(168deg, ${theme.surface}, ${theme.envelopeLiner})`,
                  boxShadow: "0 18px 34px -16px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  className="flex h-full flex-col items-center justify-center rounded-[0.25rem] border px-3 text-center"
                  style={{ borderColor: edge }}
                >
                  <p
                    className="text-[0.5rem] uppercase tracking-[0.3em]"
                    style={{ color: theme.inkSoft, fontFamily: "var(--t-label)" }}
                  >
                    You are invited
                  </p>
                  <Ornament template={template} width={100} className="my-3 opacity-75" />
                  <InvitationNames invitation={invitation} variant="envelope" fallback />
                  <p
                    className="mt-3 text-[0.5rem] uppercase tracking-[0.24em]"
                    style={{ color: theme.inkSoft, fontFamily: "var(--t-label)" }}
                  >
                    {d.day} {d.month} {d.year}
                  </p>
                </div>
              </motion.div>

              {/* --- side flaps --- */}
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[0.55rem]">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(96deg, ${theme.envelopeFlap}, ${theme.envelope})`,
                    clipPath: "polygon(0 0, 50% 50%, 0 100%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(264deg, ${theme.envelopeFlap}, ${theme.envelope})`,
                    clipPath: "polygon(100% 0, 50% 50%, 100% 100%)",
                  }}
                />
                {/* --- bottom flap, folded up --- */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${theme.envelopeFlap}, ${theme.envelope})`,
                    clipPath: `polygon(0 100%, 50% ${POCKET_TOP}%, 100% 100%)`,
                  }}
                />
                {/* fold lines, in the theme's metal */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                >
                  <path
                    d={`M0 0 L50 50 L100 0 M0 100 L50 ${POCKET_TOP} L100 100`}
                    fill="none"
                    stroke={theme.accent}
                    strokeOpacity="0.34"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              {/* --- top flap, folds back on press --- */}
              <motion.div
                initial={false}
                animate={{ rotateX: open ? -174 : 0 }}
                transition={{
                  duration: reduce ? 0.01 : 1.15,
                  delay: reduce ? 0 : 0.3,
                  ease: [0.55, 0, 0.3, 1],
                }}
                className="pointer-events-none absolute inset-x-0 top-0 origin-top backface-hidden"
                style={{
                  height: `${FLAP_TOP}%`,
                  zIndex: open ? 5 : 30,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="size-full"
                  style={{
                    background: `linear-gradient(180deg, ${theme.envelopeFlap}, ${theme.envelope})`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
                  }}
                />
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                >
                  <path
                    d="M0 0 L50 100 L100 0"
                    fill="none"
                    stroke={theme.accent}
                    strokeOpacity="0.4"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </motion.div>

              {/* outer edge, drawn last so it sits over every fold */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[35] rounded-[0.55rem] border"
                style={{ borderColor: edge }}
              />

              {/* --- wax seal --- */}
              <motion.button
                type="button"
                onClick={press}
                disabled={open}
                aria-label={copy.openInvitation}
                initial={false}
                animate={
                  open
                    ? { scale: 1.3, y: -34, opacity: 0, rotate: -16 }
                    : { scale: 1, y: 0, opacity: 1, rotate: 0 }
                }
                whileHover={open || reduce ? undefined : { scale: 1.07 }}
                whileTap={open ? undefined : { scale: 0.93 }}
                transition={{ duration: reduce ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 z-40 size-[4.5rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full disabled:cursor-default"
                style={{
                  top: `${FLAP_TOP}%`,
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
                }}
              >
                <svg viewBox="0 0 80 80" className="size-full">
                  <defs>
                    <radialGradient id="wax-shine" cx="34%" cy="28%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M40 3c5.7 0 8.1 4.7 13.4 6.3 5.3 1.6 10.2-.8 13.6 3.5 3.5 4.3.8 9 2.3 14.3 1.4 5.3 6.1 7.9 6.1 13.6s-4.7 8.3-6.1 13.6c-1.5 5.3 1.2 10-2.3 14.3-3.4 4.3-8.3 1.9-13.6 3.5C48.1 73.7 45.7 78.4 40 78.4s-8.1-4.7-13.4-6.3c-5.3-1.6-10.2.8-13.6-3.5-3.5-4.3-.8-9-2.3-14.3C9.3 49 4.6 46.4 4.6 40.7s4.7-8.3 6.1-13.6c1.5-5.3-1.2-10 2.3-14.3 3.4-4.3 8.3-1.9 13.6-3.5C31.9 7.7 34.3 3 40 3Z"
                    fill={theme.seal}
                  />
                  <path
                    d="M40 3c5.7 0 8.1 4.7 13.4 6.3 5.3 1.6 10.2-.8 13.6 3.5 3.5 4.3.8 9 2.3 14.3 1.4 5.3 6.1 7.9 6.1 13.6s-4.7 8.3-6.1 13.6c-1.5 5.3 1.2 10-2.3 14.3-3.4 4.3-8.3 1.9-13.6 3.5C48.1 73.7 45.7 78.4 40 78.4s-8.1-4.7-13.4-6.3c-5.3-1.6-10.2.8-13.6-3.5-3.5-4.3-.8-9-2.3-14.3C9.3 49 4.6 46.4 4.6 40.7s4.7-8.3 6.1-13.6c1.5-5.3-1.2-10 2.3-14.3 3.4-4.3 8.3-1.9 13.6-3.5C31.9 7.7 34.3 3 40 3Z"
                    fill="url(#wax-shine)"
                  />
                  <circle
                    cx="40"
                    cy="40.7"
                    r="24"
                    fill="none"
                    stroke={theme.sealInk}
                    strokeOpacity="0.32"
                  />
                  <text
                    x="40"
                    y="41.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={theme.sealInk}
                    fillOpacity="0.8"
                    style={{
                      fontFamily: "var(--t-display)",
                      fontSize: "19px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {monogram}
                  </text>
                </svg>
              </motion.button>
            </div>

            {/* ---------------- prompt ---------------- */}
            <motion.button
              type="button"
              onClick={press}
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.4 }}
              className="mt-9 rounded-full px-4 py-2"
              disabled={open}
            >
              <motion.span
                animate={reduce ? {} : { y: [0, -4, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="block text-[0.6875rem] uppercase tracking-[0.28em]"
                style={{ color: theme.accent, fontFamily: "var(--t-label)" }}
              >
                {copy.tapToOpen}
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
