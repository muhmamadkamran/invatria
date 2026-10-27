import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path),
        })),
      }).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="relative z-10 mx-auto max-w-7xl px-5 pt-24 text-sm">
        <ol className="flex flex-wrap gap-2">
          {trail.map((item, index) => (
            <li key={item.path} className="flex gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === trail.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
