"use client";

import { useEffect, useState } from "react";
import type { FxId } from "@/lib/templates";
import { seeded } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** CSS custom properties are legal in `style`, but React's typings stop at the
 *  known properties — this widens them without reaching for `any`. */
type Styles = React.CSSProperties & Record<`--${string}`, string | number>;

/* ============================================================================
   Ambient effects.

   Everything here is CSS-transform driven and seeded from a deterministic
   PRNG, so a field renders identically on the server and the client (no
   hydration drift) and costs no JS per frame. `data-fx` lets the global
   reduced-motion rule remove all of it in one line.
   ========================================================================= */

/** Fewer particles on small screens; none until after first paint. */
function useFxScale() {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const compute = () => setScale(window.innerWidth < 640 ? 0.45 : 1);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

const Layer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    data-fx
    aria-hidden
    className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
  >
    {children}
  </div>
);

/* --- Gold dust ------------------------------------------------------------ */

export function GoldDust({ count = 46, color = "#d4af37" }: { count?: number; color?: string }) {
  const scale = useFxScale();
  const n = Math.round(count * scale);
  if (!n) return null;

  return (
    <Layer>
      {Array.from({ length: n }, (_, i) => {
        const size = 1.5 + seeded(i * 3.1) * 4;
        const dur = 16 + seeded(i * 5.7) * 22;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${seeded(i * 1.7) * 100}%`,
              top: "-8vh",
              width: size,
              height: size,
              background: `radial-gradient(circle, ${color} 0%, ${color}00 72%)`,
              opacity: 0.25 + seeded(i * 9.3) * 0.6,
              "--drift": `${(seeded(i * 4.4) - 0.5) * 220}px`,
              "--spin": "0deg",
              animation: `fall ${dur}s linear ${-seeded(i * 2.2) * dur}s infinite, twinkle ${
                3 + seeded(i * 6.1) * 4
              }s ease-in-out infinite`,
            } as Styles}
          />
        );
      })}
    </Layer>
  );
}

/* --- Rose petals ---------------------------------------------------------- */

const PETAL_COLORS = ["#f3c7bd", "#e8ab9d", "#f7dcd6", "#dd9a92"];

export function Petals({ count = 22 }: { count?: number }) {
  const scale = useFxScale();
  const n = Math.round(count * scale);
  if (!n) return null;

  return (
    <Layer>
      {Array.from({ length: n }, (_, i) => {
        const size = 10 + seeded(i * 2.9) * 14;
        const dur = 14 + seeded(i * 7.3) * 16;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${seeded(i * 1.3) * 100}%`,
              top: "-10vh",
              width: size,
              height: size,
              opacity: 0.5 + seeded(i * 8.1) * 0.45,
              "--drift": `${(seeded(i * 3.7) - 0.5) * 300}px`,
              "--spin": `${seeded(i * 5.2) > 0.5 ? 720 : -720}deg`,
              animation: `fall ${dur}s linear ${-seeded(i * 4.9) * dur}s infinite`,
            } as Styles}
          >
            <path
              d="M12 2c4.2 2.4 7 6 7 9.6 0 4.2-3.1 7.4-7 10.4-3.9-3-7-6.2-7-10.4C5 8 7.8 4.4 12 2Z"
              fill={PETAL_COLORS[i % PETAL_COLORS.length]}
            />
            <path
              d="M12 3.4c-2.4 3.2-3.4 6-3.4 8.6 0 2.8 1.2 5.4 3.4 8"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="0.7"
              fill="none"
            />
          </svg>
        );
      })}
    </Layer>
  );
}

/* --- Hearts --------------------------------------------------------------- */

export function Hearts({ count = 10, color = "#d79b8e" }: { count?: number; color?: string }) {
  const scale = useFxScale();
  const n = Math.round(count * scale);
  if (!n) return null;

  return (
    <Layer>
      {Array.from({ length: n }, (_, i) => {
        const size = 9 + seeded(i * 4.2) * 11;
        const dur = 11 + seeded(i * 6.6) * 11;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${5 + seeded(i * 2.4) * 90}%`,
              bottom: "-6vh",
              width: size,
              height: size,
              opacity: 0.55,
              animation: `rise-heart ${dur}s ease-in ${-seeded(i * 3.3) * dur}s infinite`,
            }}
          >
            <path
              d="M12 21s-7.5-4.7-9.4-9A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 9.4 5.4C19.5 16.3 12 21 12 21Z"
              fill={color}
            />
          </svg>
        );
      })}
    </Layer>
  );
}

/* --- Stars + shooting star ------------------------------------------------ */

export function Stars({ count = 90, color = "#e9f0ff" }: { count?: number; color?: string }) {
  const scale = useFxScale();
  const n = Math.round(count * scale);
  if (!n) return null;

  return (
    <Layer>
      {Array.from({ length: n }, (_, i) => {
        const size = 1 + seeded(i * 3.4) * 2.4;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${seeded(i * 1.9) * 100}%`,
              top: `${seeded(i * 2.6) * 100}%`,
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 ${size * 3}px ${color}`,
              animation: `twinkle ${2.4 + seeded(i * 5.5) * 5}s ease-in-out ${
                -seeded(i * 7.7) * 6
              }s infinite`,
            }}
          />
        );
      })}
      {/* two shooting stars on a long, unhurried loop */}
      {[0, 1].map((i) => (
        <span
          key={`shoot-${i}`}
          className="absolute h-px w-24 origin-left"
          style={{
            left: `${12 + i * 46}%`,
            top: `${10 + i * 22}%`,
            background: `linear-gradient(90deg, ${color}, transparent)`,
            rotate: "18deg",
            animation: `shoot ${9 + i * 5}s ease-in ${i * 6.5}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </Layer>
  );
}

/* --- Fairy lights --------------------------------------------------------- */

export function FairyLights({ bulbs = 18, color = "#ffe6a8" }: { bulbs?: number; color?: string }) {
  return (
    <Layer className="h-40">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-28 w-full"
      >
        <path
          d="M0 8 Q 150 74 300 20 T 600 24 T 900 20 T 1200 12"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1.4"
          className="text-white"
        />
      </svg>
      {Array.from({ length: bulbs }, (_, i) => {
        const p = i / (bulbs - 1);
        const sag = Math.sin(p * Math.PI * 4) * 22 + 26;
        return (
          <span
            key={i}
            className="absolute size-[7px] rounded-full"
            style={{
              left: `${p * 100}%`,
              top: sag,
              background: color,
              boxShadow: `0 0 12px ${color}, 0 0 26px ${color}88`,
              animation: `twinkle ${2.6 + seeded(i * 4.1) * 3}s ease-in-out ${
                -seeded(i * 2.8) * 4
              }s infinite`,
            }}
          />
        );
      })}
    </Layer>
  );
}

/* --- Candles -------------------------------------------------------------- */

function Candle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={cn("absolute bottom-0", className)}>
      <div className="relative flex flex-col items-center">
        {/* the halo the flame throws onto the dark */}
        <span
          className="absolute -top-8 size-24 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,190,90,0.28), transparent 68%)",
            animation: `flicker ${3.6 + delay}s ease-in-out ${delay}s infinite`,
          }}
        />
        <svg
          viewBox="0 0 16 30"
          className="relative h-8 w-4"
          style={{
            transformOrigin: "50% 100%",
            animation: `flicker ${2.4 + delay}s ease-in-out ${delay}s infinite`,
          }}
        >
          <defs>
            <radialGradient id={`flame-${delay}`} cx="50%" cy="72%" r="62%">
              <stop offset="0%" stopColor="#fff6d8" />
              <stop offset="34%" stopColor="#ffcf6b" />
              <stop offset="68%" stopColor="#ff9422" />
              <stop offset="100%" stopColor="#e2560b" stopOpacity="0.75" />
            </radialGradient>
          </defs>
          {/* teardrop: narrow tip, full shoulders, tucked base */}
          <path
            d="M8 0.5c3.4 5.4 6.2 9.4 6.2 14.3C14.2 21.5 11.4 26 8 29.5 4.6 26 1.8 21.5 1.8 14.8 1.8 9.9 4.6 5.9 8 .5Z"
            fill={`url(#flame-${delay})`}
          />
          <path
            d="M8 9c1.6 3 2.8 5.2 2.8 7.7 0 3.4-1.3 5.7-2.8 7.5-1.5-1.8-2.8-4.1-2.8-7.5C5.2 14.2 6.4 12 8 9Z"
            fill="#fffdf2"
            fillOpacity="0.85"
          />
        </svg>
        <span className="-mt-0.5 block h-px w-[3px] bg-[#2b2317]" />
        <span
          className="block h-24 w-6 rounded-t-[3px]"
          style={{
            background:
              "linear-gradient(90deg, #cbb894 0%, #f7eddb 26%, #fffdf6 46%, #e6d8bd 68%, #b9a687 100%)",
          }}
        />
      </div>
    </div>
  );
}

export function Candles() {
  return (
    <Layer className="h-full">
      <Candle className="left-[4%] hidden md:block" delay={0} />
      <Candle className="left-[9%] hidden lg:block" delay={0.6} />
      <Candle className="right-[4%] hidden md:block" delay={0.3} />
      <Candle className="right-[9%] hidden lg:block" delay={0.9} />
    </Layer>
  );
}

/* --- Leaves --------------------------------------------------------------- */

const LEAF_COLORS = ["#7d9b6f", "#a3bd93", "#5d7f52", "#c3d6b8"];

export function Leaves({ count = 16 }: { count?: number }) {
  const scale = useFxScale();
  const n = Math.round(count * scale);
  if (!n) return null;

  return (
    <Layer>
      {Array.from({ length: n }, (_, i) => {
        const size = 12 + seeded(i * 3.8) * 16;
        const dur = 17 + seeded(i * 6.2) * 15;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${seeded(i * 2.1) * 100}%`,
              top: "-10vh",
              width: size,
              height: size,
              opacity: 0.45 + seeded(i * 7.4) * 0.4,
              "--drift": `${(seeded(i * 4.6) - 0.5) * 260}px`,
              "--spin": `${seeded(i * 8.3) > 0.5 ? 540 : -540}deg`,
              animation: `fall ${dur}s linear ${-seeded(i * 5.1) * dur}s infinite`,
            } as Styles}
          >
            <path
              d="M21 3C11 3 3 8.5 3 16c0 2.4.8 4 .8 4S8 12 21 3Z"
              fill={LEAF_COLORS[i % LEAF_COLORS.length]}
            />
            <path d="M20 4C12 8 6.5 13 4.2 19" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.7" fill="none" />
          </svg>
        );
      })}
    </Layer>
  );
}

/* --- Butterflies ---------------------------------------------------------- */

export function Butterflies({ count = 4 }: { count?: number }) {
  const scale = useFxScale();
  const n = Math.max(2, Math.round(count * scale));

  return (
    <Layer>
      {Array.from({ length: n }, (_, i) => {
        const dur = 22 + seeded(i * 4.7) * 16;
        const size = 16 + seeded(i * 2.3) * 12;
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: "-8%",
              top: `${12 + seeded(i * 3.6) * 66}%`,
              animation: `flutter ${dur}s linear ${-seeded(i * 6.9) * dur}s infinite`,
            }}
          >
            <svg
              viewBox="0 0 32 24"
              style={{
                width: size,
                height: size * 0.75,
                animation: `flap ${0.42 + seeded(i * 5.4) * 0.3}s ease-in-out infinite`,
              }}
            >
              <path d="M16 12C13 4 7 2 4 5s0 12 12 7Z" fill={i % 2 ? "#b9a7cf" : "#e8b4c4"} opacity="0.85" />
              <path d="M16 12c3-8 9-10 12-7s0 12-12 7Z" fill={i % 2 ? "#cbbde0" : "#f3cdd8"} opacity="0.85" />
              <rect x="15.2" y="7" width="1.6" height="11" rx="0.8" fill="#5b4a52" opacity="0.7" />
            </svg>
          </span>
        );
      })}
    </Layer>
  );
}

/* --- Blurred orbs (Modern Luxury) ----------------------------------------- */

export function Orbs({
  colors = ["#e3d2ae", "#f0e2c8", "#d9c9b0"],
}: {
  colors?: string[];
}) {
  return (
    <Layer>
      {colors.map((c, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${[8, 62, 34][i % 3]}%`,
            top: `${[12, 44, 74][i % 3]}%`,
            width: `${[30, 24, 20][i % 3]}rem`,
            height: `${[30, 24, 20][i % 3]}rem`,
            background: `radial-gradient(circle at 35% 35%, ${c}, transparent 68%)`,
            filter: "blur(60px)",
            opacity: 0.55,
            animation: `float-slow ${16 + i * 5}s ease-in-out ${i * 2}s infinite`,
          }}
        />
      ))}
    </Layer>
  );
}

/* --- Hanging lanterns (Royal Mughal) -------------------------------------- */

function Lantern({
  left,
  drop,
  delay,
  glow,
  metal,
}: {
  left: string;
  drop: number;
  delay: number;
  glow: string;
  metal: string;
}) {
  return (
    <div
      className="absolute top-0 origin-top"
      style={{ left, animation: `sway ${5 + delay}s ease-in-out ${delay}s infinite` }}
    >
      <span className="mx-auto block w-px" style={{ height: drop, background: metal, opacity: 0.5 }} />
      <svg viewBox="0 0 40 64" className="w-9" style={{ filter: `drop-shadow(0 0 16px ${glow}66)` }}>
        <path d="M17 0h6v6h-6z" fill={metal} />
        <path d="M20 6c8 0 13 6 13 15v14c0 12-5 20-13 20S7 47 7 35V21C7 12 12 6 20 6Z" fill={glow} opacity="0.22" />
        <path
          d="M20 6c8 0 13 6 13 15v14c0 12-5 20-13 20S7 47 7 35V21C7 12 12 6 20 6Z"
          fill="none"
          stroke={metal}
          strokeWidth="1.4"
        />
        <path d="M7 20h26M7 42h26" stroke={metal} strokeWidth="1.1" opacity="0.8" />
        <path d="M20 6v49M13 9v43M27 9v43" stroke={metal} strokeWidth="0.7" opacity="0.5" />
        <ellipse cx="20" cy="33" rx="6" ry="9" fill={glow} opacity="0.55">
          <animate attributeName="opacity" values="0.4;0.72;0.4" dur="3.4s" repeatCount="indefinite" />
        </ellipse>
        <path d="M17 55h6l-3 8z" fill={metal} />
      </svg>
    </div>
  );
}

export function Lanterns({
  glow = "#f3d089",
  metal = "#c8a668",
}: {
  glow?: string;
  metal?: string;
}) {
  const spots = [
    { left: "6%", drop: 46, delay: 0 },
    { left: "22%", drop: 88, delay: 0.8 },
    { left: "76%", drop: 66, delay: 0.4 },
    { left: "91%", drop: 104, delay: 1.2 },
  ];
  return (
    <Layer className="h-72">
      {spots.map((s, i) => (
        <Lantern key={i} {...s} glow={glow} metal={metal} />
      ))}
    </Layer>
  );
}

/* --- Dispatcher ----------------------------------------------------------- */

export function TemplateFx({
  fx,
  accent,
  accentSoft,
}: {
  fx: FxId[];
  accent: string;
  accentSoft: string;
}) {
  return (
    <>
      {fx.includes("gold-dust") ? <GoldDust color={accent} /> : null}
      {fx.includes("petals") ? <Petals /> : null}
      {fx.includes("hearts") ? <Hearts color={accent} /> : null}
      {fx.includes("stars") ? <Stars color={accentSoft} /> : null}
      {fx.includes("fairy-lights") ? <FairyLights color={accentSoft} /> : null}
      {fx.includes("leaves") ? <Leaves /> : null}
      {fx.includes("butterflies") ? <Butterflies /> : null}
      {fx.includes("orbs") ? <Orbs colors={[accentSoft, accent, accentSoft]} /> : null}
      {fx.includes("lanterns") ? <Lanterns glow={accentSoft} metal={accent} /> : null}
      {fx.includes("candles") ? <Candles /> : null}
    </>
  );
}
