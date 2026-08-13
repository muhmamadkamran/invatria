"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Renders the invitation's public link as a QR code, coloured from the theme
 *  so it sits inside the design rather than on top of it. */
export function QrCode({
  value,
  size = 148,
  dark = "#111111",
  light = "#ffffff",
  className,
}: {
  value: string;
  size?: number;
  dark?: string;
  light?: string;
  className?: string;
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!value) return;
    let alive = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark, light },
    })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(""));
    return () => {
      alive = false;
    };
  }, [value, size, dark, light]);

  if (!src) {
    return (
      <span
        className={className}
        style={{ width: size, height: size, display: "block", background: light, borderRadius: 12 }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`QR code linking to ${value}`}
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: 12 }}
    />
  );
}
