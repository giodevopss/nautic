"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/media";

export type RotatingClip = {
  src: string;
  /** Fallback key se não definido */
  label?: string;
};

function sourceMime(path: string): string {
  return path.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

type RotatingMutedVideosProps = {
  clips: readonly RotatingClip[];
  /** Avança ao terminar ou após este tempo (ms) */
  maxClipMs: number;
  /** Duração do crossfade (ms) — classes Tailwind arbitrárias */
  fadeMs?: 700 | 1000 | 1200 | 1500 | 1800;
  /** Classes no <video> (posição, object-cover, etc.) */
  videoClassName: string;
  /** Primeiro clipe: hero precisa de `auto` */
  preloadFirst?: "auto" | "metadata";
  "aria-hidden"?: boolean;
  "aria-label"?: string;
};

export default function RotatingMutedVideos({
  clips,
  maxClipMs,
  fadeMs = 1800,
  videoClassName,
  preloadFirst = "metadata",
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: RotatingMutedVideosProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const advance = useCallback(() => {
    if (clips.length <= 1) return;
    setActiveIndex((i) => (i + 1) % clips.length);
  }, [clips.length]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex) {
        v.currentTime = 0;
        v.muted = true;
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    const v = videoRefs.current[activeIndex];
    let done = false;

    const next = () => {
      if (done || clips.length <= 1) return;
      done = true;
      advance();
    };

    const cap =
      clips.length > 1 ? window.setTimeout(next, maxClipMs) : undefined;

    const onEnded = () => next();
    v?.addEventListener("ended", onEnded);

    return () => {
      if (cap !== undefined) window.clearTimeout(cap);
      v?.removeEventListener("ended", onEnded);
    };
  }, [activeIndex, advance, clips.length, maxClipMs]);

  const fadeClass =
    fadeMs === 700
      ? "duration-700"
      : fadeMs === 1000
        ? "duration-1000"
        : fadeMs === 1200
          ? "duration-[1200ms]"
          : fadeMs === 1500
            ? "duration-1500"
            : "duration-[1800ms]";

  if (clips.length === 0) return null;

  return (
    <>
      {clips.map((clip, i) => {
        const isActive = activeIndex === i;
        const key = clip.label ?? `${i}-${clip.src}`;
        return (
          <video
            key={key}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className={`${videoClassName} transition-opacity ease-in-out ${fadeClass} ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            muted
            playsInline
            loop={clips.length <= 1}
            preload={i === 0 ? preloadFirst : "metadata"}
            aria-hidden={ariaHidden}
            aria-label={ariaLabel}
          >
            <source src={mediaUrl(clip.src)} type={sourceMime(clip.src)} />
          </video>
        );
      })}
    </>
  );
}
