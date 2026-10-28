"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 10 },
  down: { x: 0, y: -10 },
  left: { x: 12, y: 0 },
  right: { x: -12, y: 0 },
  none: { x: 0, y: 0 },
};

/** A small scroll entrance that keeps server-rendered content readable even
 *  without JavaScript or an intersection-observer callback. */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.85,
  direction = "up",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduce = useReducedMotion();
  const off = OFFSET[direction];
  const Cmp = motion[as] as typeof motion.div;

  if (reduce) return <Cmp className={className}>{children}</Cmp>;

  return (
    <Cmp
      className={className}
      initial={off}
      whileInView={{ x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Cmp>
  );
}

/** Stagger container — pair with <RevealChild>. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { y: 10 },
  show: {
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Stagger({
  children,
  className,
  amount = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

/** Keep every headline word visible before hydration and viewport detection. */
export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ show: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={cn("inline-block", wordClassName)}
            variants={{
              hidden: { y: "0%", opacity: 1 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
