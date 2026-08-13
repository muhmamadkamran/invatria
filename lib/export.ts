"use client";

import type { Invitation } from "./types";
import { slugify } from "./utils";

function filename(inv: Invitation) {
  const names = [inv.hostPrimary, inv.hostSecondary].filter(Boolean).join("-");
  return slugify(names || "invitation") || "invitation";
}

/** Renders the on-screen card at 3× for a print-quality raster.
 *  The rasteriser is ~140 kB, so it loads on click rather than on page load. */
async function render(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`No element #${elementId}`);
  const { toPng } = await import("html-to-image");
  return toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    /* html-to-image inlines computed styles; skipping fonts avoids a CORS
       round-trip to the font CDN that would otherwise abort the render. */
    skipFonts: false,
  });
}

export async function downloadCardImage(elementId: string, inv: Invitation) {
  const dataUrl = await render(elementId);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename(inv)}.png`;
  a.click();
}

export async function downloadCardPdf(elementId: string, inv: Invitation) {
  const dataUrl = await render(elementId);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  /* A5 portrait is the closest standard stock to a 5:7 invitation card. */
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = img.width / img.height;

  let w = pageW;
  let h = w / ratio;
  if (h > pageH) {
    h = pageH;
    w = h * ratio;
  }

  pdf.addImage(dataUrl, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h, undefined, "FAST");
  pdf.save(`${filename(inv)}.pdf`);
}
