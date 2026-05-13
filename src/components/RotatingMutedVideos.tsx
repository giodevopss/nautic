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
  /**
   * stacked: um <video> por clipe (crossfade; só o 1.º faz preload agressivo).
   * double-buffer: no máx. 2 streams — ideal para hero (carrega muito mais rápido).
   */
  mode?: "stacked" | "double-buffer";
  /** Só em modo stacked: preload do primeiro clipe */
  preloadFirst?: "auto" | "metadata" | "none";
  "aria-hidden"?: boolean;
  "aria-label"?: string;
};

function fadeClass(fadeMs: RotatingMutedVideosProps["fadeMs"]) {
  const f = fadeMs ?? 1800;
  if (f === 700) return "duration-700";
  if (f === 1000) return "duration-1000";
  if (f === 1200) return "duration-[1200ms]";
  if (f === 1500) return "duration-1500";
  return "duration-[1800ms]";
}

/** Hero / above-fold: só 2 elementos <video>, nunca n fetches em paralelo */
function DoubleBufferRotating({
  clips,
  maxClipMs,
  fadeMs,
  videoClassName,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: Omit<RotatingMutedVideosProps, "mode" | "preloadFirst">) {
  const n = clips.length;
  const [clipIndex, setClipIndex] = useState(0);
  /** Qual slot (0|1) está visível e a tocar */
  const [frontSlot, setFrontSlot] = useState<0 | 1>(0);
  const refs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([
    null,
    null,
  ]);

  const advance = useCallback(() => {
    if (n <= 1) return;
    setClipIndex((i) => (i + 1) % n);
    setFrontSlot((f) => (f === 0 ? 1 : 0));
  }, [n]);

  /* Frente: play; trás: pausa */
  useEffect(() => {
    const frontEl = refs.current[frontSlot];
    const backEl = refs.current[frontSlot === 0 ? 1 : 0];
    if (!frontEl) return;
    frontEl.muted = true;
    frontEl.playsInline = true;
    frontEl.currentTime = 0;
    frontEl.play().catch(() => {});
    if (backEl) {
      backEl.pause();
      backEl.currentTime = 0;
    }
  }, [clipIndex, frontSlot]);

  useEffect(() => {
    if (n <= 1) return;
    const frontEl = refs.current[frontSlot];
    let done = false;
    const next = () => {
      if (done) return;
      done = true;
      advance();
    };
    const cap = window.setTimeout(next, maxClipMs);
    const onEnded = () => next();
    frontEl?.addEventListener("ended", onEnded);
    return () => {
      window.clearTimeout(cap);
      frontEl?.removeEventListener("ended", onEnded);
    };
  }, [clipIndex, frontSlot, advance, maxClipMs, n]);

  const fc = fadeClass(fadeMs);

  if (n === 0) return null;

  if (n === 1) {
    const c = clips[0]!;
    return (
      <video
        key={c.label ?? c.src}
        className={`${videoClassName} ${fc} opacity-100`}
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
      >
        <source src={mediaUrl(c.src)} type={sourceMime(c.src)} />
      </video>
    );
  }

  const frontSrc = mediaUrl(clips[clipIndex]!.src);
  const backSrc = mediaUrl(clips[(clipIndex + 1) % n]!.src);

  return (
    <>
      {[0, 1].map((slot) => {
        const isFront = frontSlot === slot;
        const src = isFront ? frontSrc : backSrc;
        return (
          <video
            key={`slot-${slot}`}
            ref={(el) => {
              refs.current[slot as 0 | 1] = el;
            }}
            className={`${videoClassName} transition-opacity ease-in-out ${fc} ${
              isFront ? "z-[2] opacity-100" : "z-[1] opacity-0"
            }`}
            muted
            playsInline
            preload={isFront ? "auto" : "metadata"}
            src={src}
            aria-hidden={ariaHidden}
            aria-label={ariaLabel}
          />
        );
      })}
    </>
  );
}

function StackedRotating({
  clips,
  maxClipMs,
  fadeMs,
  videoClassName,
  preloadFirst,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: Omit<RotatingMutedVideosProps, "mode">) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const firstPreload = preloadFirst ?? "metadata";

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

  const fc = fadeClass(fadeMs);

  if (clips.length === 0) return null;

  return (
    <>
      {clips.map((clip, i) => {
        const isActive = activeIndex === i;
        const key = clip.label ?? `${i}-${clip.src}`;
        const preload =
          i === activeIndex
            ? i === 0
              ? firstPreload
              : "metadata"
            : "none";
        return (
          <video
            key={key}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className={`${videoClassName} transition-opacity ease-in-out ${fc} ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            muted
            playsInline
            loop={clips.length <= 1}
            preload={preload}
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

export default function RotatingMutedVideos({
  clips,
  maxClipMs,
  fadeMs = 1800,
  videoClassName,
  mode = "stacked",
  preloadFirst = "metadata",
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: RotatingMutedVideosProps) {
  if (mode === "double-buffer") {
    return (
      <DoubleBufferRotating
        clips={clips}
        maxClipMs={maxClipMs}
        fadeMs={fadeMs}
        videoClassName={videoClassName}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <StackedRotating
      clips={clips}
      maxClipMs={maxClipMs}
      fadeMs={fadeMs}
      videoClassName={videoClassName}
      preloadFirst={preloadFirst}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    />
  );
}
