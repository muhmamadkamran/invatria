import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyWording } from "@/components/copy-wording";
import { CardPreview } from "@/components/invitation/card-preview";
import { Button } from "@/components/ui/button";
import { INVITATION_GUIDES, getInvitationGuide } from "@/lib/invitation-guides";
import { getCategory } from "@/lib/categories";
import { demoInvitation } from "@/lib/defaults";
import { TEMPLATES } from "@/lib/templates";

export const dynamicParams = false;
export function generateStaticParams() {
  return INVITATION_GUIDES.map(guide => ({ occasion: guide.slug }));
}
type Props = { params: Promise<{ occasion: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getInvitationGuide((await params).occasion);
  if (!guide) notFound();
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/invitations/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `/invitations/${guide.slug}` },
    twitter: { title: guide.title, description: guide.description },
  };
}

export default async function OccasionPage({ params }: Props) {
  const guide = getInvitationGuide((await params).occasion);
  if (!guide) notFound();
  const category = getCategory(guide.category);
  const createUrl = `/create?occasion=${guide.category}&template=${category.suggested}`;
  const templates = TEMPLATES.filter(template => template.bestFor.includes(guide.category)).slice(0, 3);
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Breadcrumbs items={[{ name: "Invitation ideas", path: "/invitations" }, { name: guide.label, path: `/invitations/${guide.slug}` }]} />
        <article className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <header className="max-w-3xl">
            <p className="eyebrow">Templates, wording and planning details</p>
            <h1 className="mt-4 text-display font-light">{guide.title}</h1>
            <p className="mt-7 text-lg leading-relaxed">{guide.intro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg"><Link prefetch={false} href={createUrl}>Create your invitation</Link></Button>
              <Button asChild variant="outline" size="lg"><a href="#designs">Browse designs</a></Button>
            </div>
            <p className="mt-4 text-sm text-charcoal-400">Browse without signing in. Free account to save and publish. Guests reply without an account.</p>
          </header>

          <section id="designs" className="mt-20 scroll-mt-24" aria-labelledby="designs-heading">
            <h2 id="designs-heading" className="text-title font-light">Choose a design for your {category.label.toLowerCase()}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => (
                <li key={template.id} className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-6">
                  <div className="mx-auto max-w-60"><CardPreview invitation={demoInvitation(template.id, guide.category)} /></div>
                  <h3 className="mt-6 font-serif text-xl">{template.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-400">{template.tagline}</p>
                  <div className="mt-5 flex flex-wrap gap-5 text-sm underline underline-offset-4">
                    <Link href={`/templates/${template.id}`}>Preview design</Link>
                    <Link prefetch={false} href={`/create?occasion=${guide.category}&template=${template.id}`}>Use {template.name}</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-20 grid gap-14 lg:grid-cols-[1fr_1.25fr]">
            <section aria-labelledby="checklist-heading">
              <h2 id="checklist-heading" className="text-title font-light">What to include</h2>
              <ul className="mt-6 list-disc space-y-4 pl-5 leading-relaxed">{guide.checklist.map(item => <li key={item}>{item}</li>)}</ul>
            </section>
            <section aria-labelledby="wording-heading" className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-7">
              <h2 id="wording-heading" className="text-title font-light">{category.label} invitation wording</h2>
              <p className="mt-5 select-text whitespace-pre-line leading-relaxed">{guide.wording}</p>
              <CopyWording text={guide.wording} />
            </section>
          </div>

          <div className="mt-20 max-w-3xl space-y-12">
            {guide.sections.map(section => <section key={section.heading}><h2 className="text-title font-light">{section.heading}</h2><p className="mt-5 leading-relaxed">{section.text}</p></section>)}
            <section aria-labelledby="guide-faq-heading">
              <h2 id="guide-faq-heading" className="text-title font-light">Questions about {guide.label.toLowerCase()}</h2>
              <div className="mt-6">{guide.faqs.map(faq => <details key={faq.question} className="border-b border-[var(--color-line)] py-5"><summary className="cursor-pointer font-medium">{faq.question}</summary><p className="mt-4 leading-relaxed">{faq.answer}</p></details>)}</div>
            </section>
          </div>

          <section className="mt-16 rounded-3xl border border-[var(--color-line)] p-7">
            <h2 className="text-title font-light">Ready to put your invitation together?</h2>
            <p className="mt-4 leading-relaxed">Choose a design, replace the sample names and details, then review the finished invitation before publishing.</p>
            <Button asChild className="mt-6"><Link prefetch={false} href={createUrl}>Start with {category.label.toLowerCase()}</Link></Button>
          </section>
          <footer className="mt-14 border-t border-[var(--color-line)] pt-7 text-sm">
            <p>Published by <Link href="/about" className="underline underline-offset-4">Invitra</Link>.</p>
            <nav aria-label="More invitation ideas" className="mt-5 flex flex-wrap gap-5">{INVITATION_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/invitations/${item.slug}`} className="underline underline-offset-4">{item.label}</Link>)}</nav>
          </footer>
        </article>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: guide.faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
      }).replace(/</g, "\u003c") }} />
    </>
  );
}
