import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/invitation/pattern";
import { TEMPLATES } from "@/lib/templates";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="paper grid min-h-[80vh] place-items-center px-5 pt-32">
        <div className="max-w-md text-center">
          <Ornament template={TEMPLATES[4]} width={200} className="opacity-60" />
          <p className="eyebrow mt-8">Error 404</p>
          <h1 className="mt-4 text-display font-light">
            Nothing is <span className="italic text-gilt">at this address</span>
          </h1>
          <p className="mt-5 text-pretty text-sm leading-relaxed text-charcoal-400">
            The page you were looking for has moved, or never existed. Neither is
            your fault.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">Back to the start</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/templates">Browse templates</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
