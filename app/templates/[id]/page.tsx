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
    openGraph: { title: `${template.name} · Invitra`, description: template.description },
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

  /* The preview is the real thing — same renderer, same envelope, same
     motion. Only the content is ours. */
  const invitation = demoInvitation(template.id);

  return (
    <>
      <PreviewBar template={template} />
      <main id="main">
        <Breadcrumbs items={[{ name: "Templates", path: "/templates" }, { name: template.name, path: `/templates/${template.id}` }]} />
        <InvitationView invitation={invitation} publicUrl={absoluteUrl(`/templates/${template.id}`)} />
      </main>
    </>
  );
}
