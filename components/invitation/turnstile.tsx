"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return resolve();
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(el);
  });
  return scriptPromise;
}

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; theme?: string; size?: string },
  ) => string;
  remove: (id: string) => void;
}

/**
 * Cloudflare Turnstile, rendered only when a site key is configured.
 *
 * The widget writes a hidden `cf-turnstile-response` input, which the storage
 * layer picks up and forwards to the `submit-response` Edge Function; the
 * secret half of the pair lives only in that function. With no site key set
 * this renders nothing and submissions carry no token — the function then
 * skips the check, so the app works either way.
 */
export function Turnstile() {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !boxRef.current) return;
    let cancelled = false;
    const box = boxRef.current;

    loadScript()
      .then(() => {
        if (cancelled || !box) return;
        const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
        if (!api) return;
        widgetId.current = api.render(box, {
          sitekey: SITE_KEY,
          theme: "auto",
          size: "flexible",
        });
      })
      .catch(() => {
        /* Offline or blocked — the submission simply carries no token. */
      });

    return () => {
      cancelled = true;
      const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (api && widgetId.current) {
        try {
          api.remove(widgetId.current);
        } catch {
          /* already gone */
        }
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={boxRef} className="mt-1" />;
}
