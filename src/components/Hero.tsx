"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";

const HERO_STATS = [
  {
    target: 10,
    suffix: "+",
    title: "Anos de experiência",
    subtitle: "Operação contínua no litoral",
  },
  {
    target: 500,
    suffix: "+",
    title: "Clientes satisfeitos",
    subtitle: "Passeios e eventos memoráveis",
  },
  {
    target: 15,
    suffix: "+",
    title: "Embarcações na frota",
  },
] satisfies ReadonlyArray<{
  target: number;
  suffix: string;
  title: string;
  subtitle?: string;
}>;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function StatCounter({
  target,
  suffix,
  title,
  subtitle,
  durationMs,
  delayMs,
}: {
  target: number;
  suffix: string;
  title: string;
  subtitle?: string;
  durationMs: number;
  delayMs: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px", amount: 0.3 });
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startAt = performance.now() + delayMs;
    let frame: number;

    const tick = (now: number) => {
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startAt;
      const t = Math.min(1, elapsed / durationMs);
      const n = Math.round(easeOutCubic(t) * target);
      setDisplay(n);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, durationMs, delayMs]);

  return (
    <div
      ref={ref}
      className="flex min-w-0 flex-1 flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 text-center backdrop-blur-sm sm:px-5 sm:py-6 md:max-w-[14rem] md:py-7"
    >
      <span className="font-[family-name:var(--font-poppins)] text-3xl font-bold tabular-nums tracking-tight text-ocean-light sm:text-4xl md:text-[2.75rem]">
        {display}
        {suffix}
      </span>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 sm:text-xs sm:tracking-[0.14em]">
        {title}
      </span>
      {subtitle ? (
        <span className="mt-1.5 max-w-[12rem] text-[10px] leading-snug text-white/50 sm:text-xs">
          {subtitle}
        </span>
      ) : (
        <span className="mt-1.5 min-h-[2.5rem] sm:min-h-[2.75rem]" aria-hidden />
      )}
    </div>
  );
}

const HERO_VIDEOS = [
  { src: "/videos/vid-20251215-151804.mp4", label: "vid-20251215" },
  { src: "/videos/vid-20251207-164840.mp4", label: "vid-20251207" },
  { src: "/videos/lanchas1.mp4", label: "lanchas1" },
  { src: "/videos/pwc.mp4", label: "pwc" },
] as const;

/** Teto por clipe — vídeos longos não ficam eternos */
const MAX_CLIP_MS = 15_000;

export default function Hero() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % HERO_VIDEOS.length);
  }, []);

  /* Play/pause: só o ativo toca */
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

  /* Avança quando o clipe termina OU atinge o teto */
  useEffect(() => {
    const v = videoRefs.current[activeIndex];
    let done = false;

    const next = () => {
      if (done) return;
      done = true;
      advance();
    };

    const cap = window.setTimeout(next, MAX_CLIP_MS);

    const onEnded = () => next();
    v?.addEventListener("ended", onEnded);

    return () => {
      window.clearTimeout(cap);
      v?.removeEventListener("ended", onEnded);
    };
  }, [activeIndex, advance]);

  const reveal = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px", amount: 0.2 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <>
      <section
        id="inicio"
        className="relative isolate h-[100dvh] min-h-[100dvh] w-full max-w-full overflow-x-clip bg-black"
      >
        {/* --- Camada 1: vídeos empilhados --- */}
        <div className="absolute inset-0 overflow-hidden">
          {HERO_VIDEOS.map((video, i) => {
            const isActive = activeIndex === i;
            return (
              <video
                key={video.label}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                muted
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                aria-hidden
              >
                <source src={video.src} type="video/mp4" />
              </video>
            );
          })}
        </div>

        {/* --- Camada 2: máscara — fundo preto + texto branco + mix-blend-multiply --- */}
        {/* preto × vídeo = preto (esconde). branco × vídeo = vídeo (revela dentro das letras). */}
        <div className="absolute inset-0 flex items-center justify-center overflow-x-clip bg-black mix-blend-multiply px-4 pb-28 pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:px-5 sm:pb-24 sm:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] md:px-6 md:pb-20 md:pt-0 lg:px-8">
          <h1
            className="w-full min-w-0 max-w-full select-none text-center font-[family-name:var(--font-poppins)] font-black uppercase leading-[0.8] tracking-tight text-white sm:leading-[0.76] md:leading-[0.72] lg:leading-[0.7]"
            style={{
              fontSize:
                "clamp(2.75rem, min(16vw + 3.5dvh, calc((100svw - 2.75rem) / 5.35)), min(44dvh, 36rem))",
            }}
          >
            CLUBE
            <br />
            NÁUTICO
          </h1>
        </div>

        {/* Vinheta sutil */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.45)]" />

        {/* Scroll hint */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] flex justify-center md:bottom-8">
          <div className="animate-scroll flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">
              Role para continuar
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white/45"
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </div>
        </div>
      </section>

      {/* --- Faixa abaixo do hero --- */}
      <div className="relative z-20 border-t border-white/10 bg-navy-dark px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:px-6 sm:py-12 md:py-16 md:pb-20">
        <motion.p
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.05 }}
          className="mx-auto mb-5 max-w-2xl text-sm font-light leading-relaxed tracking-wide text-white/85 sm:mb-6 sm:text-base md:text-xl"
        >
          Experiências exclusivas no mar, com conforto, segurança e liberdade.
        </motion.p>

        <motion.div
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.12 }}
          className="mb-6 flex max-w-md flex-col items-stretch gap-2 sm:mx-auto sm:mb-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3"
        >
          {[
            "Frota revisada",
            "Tripulação experiente",
            "Reserva 100% online",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.14em] text-white/55 backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.2em]"
            >
              {label}
            </span>
          ))}
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.2 }}
          className="mx-auto flex w-full max-w-3xl flex-col items-stretch justify-center gap-3 sm:max-w-5xl sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 lg:max-w-6xl lg:gap-5"
        >
          {HERO_STATS.map((stat, i) => (
            <StatCounter
              key={stat.title}
              target={stat.target}
              suffix={stat.suffix}
              title={stat.title}
              subtitle={stat.subtitle}
              durationMs={700}
              delayMs={i * 70}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
}
