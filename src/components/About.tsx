"use client";

import { motion } from "framer-motion";

import RotatingMutedVideos from "./RotatingMutedVideos";

/** Ciclo ao lado do texto “Quem somos” — acrescente mais paths em `public/videos/` */
const ABOUT_VIDEOS = [
  { src: "/videos/quem-somos-lancha.mp4", label: "about-1" },
  { src: "/videos/lanchas1.mp4", label: "about-2" },
  { src: "/videos/vid-20251207-164840.mp4", label: "about-3" },
  { src: "/videos/passeios-personalizados.mp4", label: "about-4" },
] as const;

const ABOUT_CLIP_MS = 14_000;

export default function About() {
  return (
    <section id="quem-somos" className="relative overflow-x-clip bg-navy py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean-light">
              Sobre nós
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-4xl leading-tight font-bold text-white md:text-5xl">
              Quem <span className="text-ocean-light">somos</span>
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/70">
              <p>
                O <strong className="text-white">Clube Náutico</strong> é
                referência em experiências de alto padrão no mar. Oferecemos
                aluguel de lanchas e jetskis com total conforto, segurança e
                atendimento premium.
              </p>
              <p>
                Nossa frota é moderna e cuidadosamente mantida, garantindo que
                cada momento no mar seja inesquecível. Desde passeios tranquilos
                até aventuras cheias de adrenalina, proporcionamos liberdade e
                exclusividade para nossos clientes.
              </p>
              <p>
                Com uma equipe experiente e apaixonada pelo mar, estamos prontos
                para transformar seu dia em uma experiência única.
              </p>
            </div>
          </motion.div>

          {/* Vídeos em ciclo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy-dark">
              <RotatingMutedVideos
                clips={ABOUT_VIDEOS}
                maxClipMs={ABOUT_CLIP_MS}
                fadeMs={1500}
                preloadFirst="auto"
                videoClassName="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-2xl border-2 border-ocean/30" />
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-2xl bg-ocean/10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
