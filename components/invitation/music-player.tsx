"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import type { Invitation, LangCode } from "@/lib/types";
import { mediaUrl } from "@/lib/storage";
import { t } from "@/lib/i18n";

/** A single, always-reachable control. Music fades in over two seconds rather
 *  than arriving at full volume, and never starts without a gesture unless the
 *  browser explicitly allows it. */
export function MusicPlayer({
  music,
  language = "en",
  started,
}: {
  music: Invitation["music"];
  language?: LangCode;
  /** True once the envelope has been opened — the gesture we can act on. */
  started: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState("");
  const [playing, setPlaying] = useState(false);
  const copy = t(language);

  useEffect(() => {
    let alive = true;
    mediaUrl(music.source).then((u) => alive && setSrc(u));
    return () => {
      alive = false;
    };
  }, [music.source]);

  const fadeTo = (target: number) => {
    const el = audioRef.current;
    if (!el) return;
    const step = (target - el.volume) / 40;
    let n = 0;
    const id = setInterval(() => {
      if (!audioRef.current || n++ >= 40) return clearInterval(id);
      audioRef.current.volume = Math.min(1, Math.max(0, audioRef.current.volume + step));
    }, 50);
  };

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      fadeTo(0);
      setTimeout(() => el.pause(), 550);
      setPlaying(false);
    } else {
      el.volume = 0;
      try {
        await el.play();
        fadeTo(0.7);
        setPlaying(true);
      } catch {
        /* blocked by the browser — the button stays available */
      }
    }
  };

  useEffect(() => {
    if (!started || !music.autoplay || !src || playing) return;
    void toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, src]);

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={playing ? copy.pauseMusic : copy.playMusic}
        aria-pressed={playing}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed bottom-5 right-5 z-50 grid size-12 place-items-center rounded-full border shadow-lg backdrop-blur-xl transition-transform duration-300 hover:scale-105"
        style={{
          borderColor: "var(--t-line)",
          background: "color-mix(in oklab, var(--t-surface) 82%, transparent)",
          color: "var(--t-accent)",
        }}
      >
        {playing ? (
          <Pause className="size-4" strokeWidth={1.6} />
        ) : (
          <Play className="ml-0.5 size-4" strokeWidth={1.6} />
        )}
        {playing ? (
          <span
            className="absolute inset-0 -z-10 animate-ping rounded-full opacity-25"
            style={{ background: "var(--t-accent)" }}
          />
        ) : null}
      </motion.button>
    </>
  );
}
