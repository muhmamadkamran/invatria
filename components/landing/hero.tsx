"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  } from "framer-motion";
import { ArrowRight, LayoutGrid, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldDust } from "@/components/fx";
import { CardPreview } from "@/components/invitation/card-preview";
import { TEMPLATES } from "@/lib/templates";
import { demoInvitation } from "@/lib/defaults";
import { clamp } from "@/lib/utils";

const SHELF = [
  { template: TEMPLATES[1], rotate: -9, x: "-58%", y: 34, z: 1, scale: 0.86 },
  { template: TEMPLATES[0], rotate: 0, x: "0%", y: 0, z: 3, scale: 1 },
  { template: TEMPLATES[5], rotate: 9, x: "58%", y: 34, z: 1, scale: 0.86 },
] as const;

const PROMISES = ["Free account", "No pricing, ever", "Unlimited guests"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const shelfY = useTransform(scrollYProgress, [0, 1], [0, 130]);

  /* Pointer parallax — small, slow, and spring-damped so it feels like weight
     rather than a cursor-follower gimmick. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  function onPointerMove(e: React.PointerEvent) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(clamp((e.clientX - r.left - r.width / 2) / r.width, -0.5, 0.5));
    py.set(clamp((e.clientY - r.top - r.height / 2) / r.height, -0.5, 0.5));
  }

  const tiltX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const tiltY = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  /** Entrance props for the hero's staged copy. Reduced-motion visitors get
   *  the finished state immediately rather than a slow, delayed fade. */
  const entrance = (delay: number, y = 18) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.95, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      className="paper relative isolate overflow-hidden pb-0 pt-32 sm:pt-40"
      aria-labelledby="hero-heading"
    >
      {/* --- background --------------------------------------------------- */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,var(--color-champagne)_0%,var(--color-cream)_38%,var(--color-ivory)_72%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#2a2415_0%,#1c1910_42%,var(--color-surface)_78%)]" />
        {/* two slow silk washes */}
        <motion.div
          className="absolute -left-[15%] top-[-10%] size-[46rem] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, color-mix(in oklab, var(--color-rosegold-light) 55%, transparent), transparent 68%)",
          }}
          animate={reduce ? {} : { x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[12%] top-[6%] size-[40rem] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, color-mix(in oklab, var(--color-gold-light) 48%, transparent), transparent 68%)",
          }}
          animate={reduce ? {} : { x: [0, -50, 0], y: [0, 55, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <GoldDust count={38} />

      {/* --- copy ---------------------------------------------------------- */}
      <motion.div
        style={{ y: reduce ? 0 : copyY, opacity: reduce ? 1 : copyOpacity }}
        className="relative z-10 mx-auto max-w-[62rem] px-5 text-center sm:px-8"
      >
        <motion.p
          {...entrance(0.15, 14)}
          className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-[color-mix(in_oklab,white_60%,transparent)] px-4 py-2 backdrop-blur-md dark:bg-white/5"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
          </span>
          <span className="font-label text-[0.625rem] uppercase tracking-[0.26em] text-gold-deep dark:text-gold-light">
            Every feature free · forever
          </span>
        </motion.p>

        <h1
          id="hero-heading"
          className="mt-7 text-hero font-light text-[var(--color-heading)]"
        >
          Create Free
          <br />
          <span className="italic">
            <span className="text-gilt">Invitation Cards</span>
          </span>
          <br />
          in Minutes
        </h1>

        <motion.p
          {...entrance(0.85)}
          className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-charcoal-600 sm:text-[1.0625rem] dark:text-charcoal-200"
        >
          Make a free digital invitation card for your wedding, birthday, baby shower
          or another event. Share a link and collect RSVPs online. Guests can
          reply without an account.
        </motion.p>

        <motion.div
          {...entrance(1)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="primary" className="group w-full sm:w-auto">
            <Link prefetch={false} href="/create">
              Create Invitation
              <ArrowRight className="transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/templates">
              <LayoutGrid />
              Browse Templates
            </Link>
          </Button>
        </motion.div>

        <motion.ul
          {...entrance(1.2, 0)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2"
        >
          {PROMISES.map((p) => (
            <li
              key={p}
              className="flex items-center gap-2 font-label text-[0.6875rem] uppercase tracking-[0.16em] text-charcoal-400"
            >
              <Check className="size-3 text-gold" strokeWidth={2} />
              {p}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* --- the shelf ------------------------------------------------------ */}
      <motion.div
        style={{ y: reduce ? 0 : shelfY }}
        className="relative z-0 mt-16 sm:mt-20"
      >
        <div className="mask-fade-b mx-auto max-w-[74rem] px-5 pb-4 sm:px-8">
          <motion.div
            style={{
              perspective: 1600,
              rotateX: reduce ? 0 : tiltX,
              rotateY: reduce ? 0 : tiltY,
            }}
            className="relative mx-auto flex h-[26rem] max-w-[36rem] items-start justify-center preserve-3d sm:h-[34rem] sm:max-w-[44rem]"
          >
            {SHELF.map((item, i) => (
              <motion.div
                key={item.template.id}
                initial={
                  reduce
                    ? false
                    : { opacity: 0, y: 90, rotate: item.rotate * 2.2, scale: 0.8 }
                }
                animate={{ opacity: 1, y: item.y, rotate: item.rotate, scale: item.scale }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 1.4, delay: 1.15 + i * 0.13, ease: [0.22, 1, 0.36, 1] }
                }
                whileHover={reduce ? undefined : { y: item.y - 18, scale: item.scale * 1.03 }}
                className="absolute top-0 w-[58%] max-w-[19rem] origin-bottom sm:w-[54%]"
                style={{
                  left: "50%",
                  translateX: `calc(-50% + ${item.x})`,
                  zIndex: item.z,
                }}
              >
                <div className="overflow-hidden rounded-[1.35rem] shadow-[var(--shadow-float)] ring-1 ring-black/5">
                  <CardPreview invitation={demoInvitation(item.template.id)} template={item.template} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
