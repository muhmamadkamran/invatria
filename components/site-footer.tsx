import Link from "next/link";
import { Wordmark } from "./brand";
import { CATEGORIES } from "@/lib/categories";
import { TEMPLATES } from "@/lib/templates";

const COLUMNS = [
  {
    title: "Create",
    links: [
      { href: "/create", label: "Start an invitation" },
      { href: "/templates", label: "All templates" },
      { href: "/my-invitations", label: "My invitations" },
      { href: "/demo", label: "See a live example" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/about", label: "About Invitra" },
      { href: "/about#product-facts", label: "Features and product facts" },
      { href: "/invitations", label: "Invitation wording and ideas" },
      { href: "/tools/whatsapp-invitation-message", label: "WhatsApp invitation message tool" },
      { href: "/#features", label: "Features" },
      { href: "/#how", label: "How it works" },
      { href: "/#faq", label: "Questions" },
      { href: "/#occasions", label: "Occasions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="paper relative overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-surface-sunken)]">
      {/* a single hairline of gold, the last thing you see */}
      <div className="rule-gold absolute inset-x-0 top-0" />

      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-5 text-sm leading-relaxed text-charcoal-400">
              Invitra, also known as Invatria, is a free digital invitation
              studio. Customize an invitation card, share a link and collect
              replies online.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/6 px-4 py-2 font-label text-[0.625rem] uppercase tracking-[0.22em] text-gold-deep dark:text-gold-light">
              <span className="size-1.5 rounded-full bg-gold" />
              Free forever · Ad supported
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-label text-[0.625rem] uppercase tracking-[0.28em] text-charcoal-400">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      prefetch={l.href === "/create" || l.href === "/my-invitations" ? false : undefined}
                      className="text-sm text-charcoal-600 transition-colors duration-300 hover:text-gold-deep dark:text-charcoal-200 dark:hover:text-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Designs">
            <h3 className="font-label text-[0.625rem] uppercase tracking-[0.28em] text-charcoal-400">
              Designs
            </h3>
            <ul className="mt-5 space-y-3">
              {TEMPLATES.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/templates/${t.id}`}
                    className="text-sm text-charcoal-600 transition-colors duration-300 hover:text-gold-deep dark:text-charcoal-200 dark:hover:text-gold-light"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Occasion index — genuinely useful for search, and for browsing */}
        <div className="mt-16 border-t border-[var(--color-line)] pt-8">
          <h3 className="font-label text-[0.625rem] uppercase tracking-[0.28em] text-charcoal-400">
            Every occasion
          </h3>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={["wedding", "birthday", "baby-shower", "nikah"].includes(c.id) ? `/invitations/${c.id}` : `/templates?occasion=${c.id}`}
                  className="text-[0.8125rem] text-charcoal-400 transition-colors duration-300 hover:text-gold-deep dark:hover:text-gold-light"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-line)] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-charcoal-400">
            © {new Date().getFullYear()} Invitra. Made for the people who still
            send invitations.
          </p>
          <p className="text-xs text-charcoal-400">
            No pricing. No subscriptions. No locked features.
          </p>
        </div>
      </div>
    </footer>
  );
}
