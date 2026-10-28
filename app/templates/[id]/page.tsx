import Link from "next/link";
import { socialMetadata } from "@/lib/social-metadata";
import { getCategory } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TEMPLATES, TEMPLATE_MAP } from "@/lib/templates";
import type { TemplateId } from "@/lib/types";
import { demoInvitation } from "@/lib/defaults";
import { InvitationView } from "@/components/invitation/view";
import { PreviewBar } from "@/components/templates/preview-bar";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const template = TEMPLATE_MAP[id as TemplateId];
  if (!template) return { title: "Template not found" };
  return {
    title: `${template.name} — ${template.tagline}`,
    description: template.description,
    alternates: { canonical: `/templates/${template.id}` },
    ...socialMetadata(`${template.name} invitation template`, template.description, `/templates/${template.id}`),
  };
}

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = TEMPLATE_MAP[id as TemplateId];
  if (!template) notFound();

  /* Use the real invitation renderer with sample content. Keep the envelope
     open so visitors and crawlers can read the template details immediately. */
  const invitation = demoInvitation(template.id);
  invitation.options.envelope = false;

  return (
    <>
      <PreviewBar template={template} />
      <main id="main">
        <Breadcrumbs items={[{ name: "Templates", path: "/templates" }, { name: template.name, path: `/templates/${template.id}` }]} />
        <section className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
          <p className="eyebrow">Free invitation template</p>
          <h1 className="mt-4 text-display font-light">{template.name} invitation template</h1>
          <p className="mt-5 font-serif text-xl">{template.tagline}</p>
          <p className="mt-5 max-w-2xl leading-relaxed">{template.description}</p>
          <p className="mt-5 max-w-2xl leading-relaxed">Customize the sample names, event details and invitation sections. This is a sample event preview; a free host account is required to save and publish your own invitation.</p>
          <ul className="mt-6 flex flex-wrap gap-3 text-sm">{template.features.map(feature => <li key={feature} className="rounded-full border border-[var(--color-line)] px-4 py-2">{feature}</li>)}</ul>
          <nav aria-label="Suitable occasions" className="mt-6 flex flex-wrap gap-4 text-sm underline underline-offset-4">{template.bestFor.map(occasion => <Link key={occasion} href={['wedding', 'birthday', 'baby-shower', 'nikah'].includes(occasion) ? `/invitations/${occasion}` : `/templates?occasion=${occasion}`}>{getCategory(occasion).label} invitations</Link>)}</nav>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild><Link prefetch={false} href={`/create?template=${template.id}`}>Use {template.name}</Link></Button>
            <Button asChild variant="outline"><a href="#template-preview">View sample invitation</a></Button>
          </div>
        </section>
        <section id="template-preview" aria-label={`${template.name} sample invitation`} className="scroll-mt-20">
        <InvitationView headingLevel="h2" invitation={invitation} publicUrl={absoluteUrl(`/templates/${template.id}`)} />
        </section>
      </main>
    </>
  );
}
