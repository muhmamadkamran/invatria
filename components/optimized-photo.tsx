"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

/** Keep local draft/data URLs working; optimize supported public media on demand. */
export function OptimizedPhoto({ src, alt, sizes, priority = false, className, style }: {
  src: string; alt: string; sizes: string; priority?: boolean; className?: string; style?: CSSProperties;
}) {
  let optimize = false;
  try {
    const url = new URL(src);
    optimize = url.protocol === "https:" && (
      url.hostname === "images.unsplash.com" ||
      (url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/object/public/")) ||
      (url.origin === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.local").origin && url.pathname.startsWith("/storage/v1/object/public/"))
    );
  } catch { /* Draft URLs can be relative or use a local browser scheme. */ }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!optimize} className={className} style={style} />;
}
