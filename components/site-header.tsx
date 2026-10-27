"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
  } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Wordmark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { AccountButton } from "./auth/account-button";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/templates", label: "Templates" },
  { href: "/#features", label: "Features" },
  { href: "/#occasions", label: "Occasions" },
  { href: "/#how", label: "How it works" },
  { href: "/my-invitations", label: "My Invitations" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
        }
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "mx-auto flex h-[4.5rem] max-w-[86rem] items-center justify-between gap-6 px-5 transition-all duration-500 ease-[var(--ease-luxe)] sm:px-8",
            scrolled &&
              "mt-3 h-16 max-w-[80rem] rounded-full border border-[color-mix(in_oklab,white_55%,transparent)] bg-[color-mix(in_oklab,var(--color-surface)_78%,transparent)] px-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:px-6 dark:border-white/8 dark:bg-[color-mix(in_oklab,var(--color-surface)_82%,transparent)]",
          )}
        >
          <Link href="/" aria-label="Invitra home" className="shrink-0">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={item.href === "/my-invitations" ? false : undefined}
                  className={cn(
                    "group relative rounded-full px-4 py-2 font-label text-[0.7rem] uppercase tracking-[0.16em] transition-colors duration-300",
                    active
                      ? "text-[var(--color-heading)]"
                      : "text-charcoal-400 hover:text-[var(--color-heading)]",
                  )}
                >
                  {item.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-gold/70 transition-transform duration-400 ease-[var(--ease-luxe)] group-hover:scale-x-100" />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <AccountButton className="hidden lg:inline-flex" />
            <ThemeToggle className="hidden sm:grid" />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link prefetch={false} href="/create">
                Create Invitation
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-heading)] lg:hidden"
            >
              <Menu strokeWidth={1.3} className="size-[1.1rem]" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-[var(--color-surface)]/92 backdrop-blur-2xl"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col px-6 pb-10 pt-6"
            >
              <div className="flex items-center justify-between">
                <Wordmark />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-10 place-items-center rounded-full border border-[var(--color-line)]"
                >
                  <X strokeWidth={1.3} className="size-[1.1rem]" />
                </button>
              </div>

              <nav aria-label="Mobile" className="mt-14 flex flex-col">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                  prefetch={item.href === "/my-invitations" ? false : undefined}
                      className="block border-b border-[var(--color-line)] py-5 font-display text-3xl font-light text-[var(--color-heading)]"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-3 pt-8">
                <AccountButton className="w-full justify-center" />
                <div className="flex items-center gap-3">
                  <Button asChild size="lg" className="flex-1">
                    <Link prefetch={false} href="/create">Create Invitation</Link>
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
