"use client";

import { useState } from "react";

export function CopyWording({ text }: { text: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. Replace the bracketed details with your own.");
    } catch {
      setMessage("Select the sample text above and copy it manually.");
    }
  }
  return (
    <div className="mt-5">
      <button type="button" onClick={copy} className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm hover:border-gold focus-visible:outline-2 focus-visible:outline-gold">Copy sample wording</button>
      <p role="status" className="mt-3 min-h-6 text-sm text-charcoal-400">{message}</p>
    </div>
  );
}
