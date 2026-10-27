"use client";

import { useEffect } from "react";

/** Typography must not prevent the first render of the page's text. */
export function DeferredFonts({ href }: { href: string }) {
  useEffect(() => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
    return () => stylesheet.remove();
  }, [href]);

  return (
    <>
      <link rel="preload" as="style" href={href} />
      <noscript><link rel="stylesheet" href={href} /></noscript>
    </>
  );
}
