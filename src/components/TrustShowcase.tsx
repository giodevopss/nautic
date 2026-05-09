"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { mediaUrl } from "@/lib/media";

/** Galeria de clientes — ordem misturada */
const CLIENT_GALLERY = [
  "/images/galeria-clientes/07.png",
  "/images/galeria-clientes/14.png",
  "/images/galeria-clientes/01.png",
  "/images/galeria-clientes/11.png",
  "/images/galeria-clientes/06.png",
  "/images/galeria-clientes/08.png",
  "/images/galeria-clientes/02.png",
  "/images/galeria-clientes/04.png",
  "/images/galeria-clientes/12.png",
  "/images/galeria-clientes/13.png",
  "/images/galeria-clientes/09.png",
  "/images/galeria-clientes/05.png",
] as const;

const TESTIMONIALS = [
  {
    name: "Mariana Alves",
    role: "Passeio em família · Guarujá",
    quote:
      "Organização impecável desde o primeiro contato. A lancha estava impecável e a tripulação nos deixou totalmente à vontade.",
    initials: "MA",
    photo: "/images/clientes/cliente-1.jpg",
    rating: 5,
  },
  {
    name: "João Santos",
    role: "Aniversário no mar",
    quote:
      "Reservamos com antecedência e valeu cada minuto. Voltaremos para experimentar o jetski também — recomendo demais.",
    initials: "JS",
    photo: "/images/clientes/cliente-2.jpg",
    rating: 5,
  },
  {
    name: "Carla & Ricardo",
    role: "Pôr do sol + filmagem",
    quote:
      "Experiência premium. Equipamento de som excelente e o passeio no final da tarde foi cinematográfico.",
    initials: "CR",
    photo: "/images/clientes/cliente-3.jpg",
    rating: 5,
  },
  {
    name: "Letícia Ferreira",
    role: "Jetski · fim de semana",
    quote:
      "Primeira vez de jetski e me senti super segura. Equipe explica tudo com calma e o equipamento é de primeira — já indiquei para as amigas.",
    initials: "LF",
    photo: "/images/clientes/cliente-4.jpg",
    rating: 5,
  },
  {
    name: "Roberto Mendes",
    role: "Mecânica náutica · motor de lancha",
    quote:
      "Levei o motor com falha intermitente e o diagnóstico foi direto ao ponto. Orçamento claro, peças alinhadas e entrega no prazo — minha lancha voltou redonda para a temporada.",
    initials: "RM",
    photo: "/images/clientes/cliente-5.jpg",
    rating: 5,
  },
  {
    name: "Fernanda Lima",
    role: "Habilitação náutica",
    quote:
      "Fiz o preparatório para a carteira e saí confiante para a prova. Explicação objetiva na parte teórica e dicas práticas que fazem diferença quando você assume o comando.",
    initials: "FL",
    photo: "/images/clientes/cliente-6.jpg",
    rating: 5,
  },
] as const;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-gold-light" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ClientPhoto({
  src,
  alt,
  initials,
}: {
  src: string;
  alt: string;
  initials: string;
}) {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean/50 to-navy-light font-[family-name:var(--font-poppins)] text-lg font-bold text-white/90 ring-2 ring-white/10"
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/10">
      <Image
        src={mediaUrl(src)}
        alt={alt}
        fill
        className="object-cover"
        sizes="64px"
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const galleryContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const galleryTile = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function TrustShowcase() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-navy-dark via-navy to-navy-dark py-24 lg:py-32">
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-ocean/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-ocean-light/5 blur-[90px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-ocean-light">
            Confiança & experiências reais
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Quem já embarcou,{" "}
            <span className="text-ocean-light">recomenda</span>
          </h2>
          <p className="mt-4 text-lg text-white/55">
            Transparência, frota amplia e o feedback de quem já embarcou com a gente.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              variants={item}
              className={`flex flex-col rounded-2xl border border-white/10 bg-navy-light/30 p-6 shadow-xl shadow-black/15 backdrop-blur-sm transition-colors duration-300 hover:border-ocean/25 ${
                i >= 3 ? "hidden sm:flex" : ""
              }`}
            >
              <div className="flex gap-4">
                <ClientPhoto src={t.photo} alt={`Foto de ${t.name}`} initials={t.initials} />
                <div className="min-w-0 flex-1">
                  <Stars n={t.rating} />
                  <p className="mt-3 text-sm leading-relaxed text-white/80">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-4 border-t border-white/10 pt-4">
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-ocean-light/90">{t.role}</div>
                  </footer>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={galleryContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px", amount: 0.05 }}
          className="relative mt-8 columns-2 gap-4 sm:mt-10 sm:columns-3 sm:gap-5 lg:mt-12 lg:columns-4 lg:gap-6 [column-fill:_balance]"
        >
          {CLIENT_GALLERY.map((src, i) => {
            const tilt = i % 2 === 0 ? "hover:-rotate-[0.6deg]" : "hover:rotate-[0.6deg]";
            const frame =
              i % 3 === 0
                ? "from-gold/25 via-white/[0.07] to-ocean/20"
                : i % 3 === 1
                  ? "from-ocean/30 via-white/[0.06] to-navy-light/40"
                  : "from-white/15 via-ocean/10 to-white/5";
            return (
              <motion.figure
                key={src}
                variants={galleryTile}
                className={`group mb-4 break-inside-avoid sm:mb-5 ${tilt}`}
              >
                <div
                  className={`rounded-2xl bg-gradient-to-br p-px shadow-lg shadow-black/30 ring-0 ring-transparent transition-all duration-500 ease-out ${frame} group-hover:shadow-xl group-hover:shadow-ocean/20 group-hover:ring-2 group-hover:ring-ocean/25`}
                >
                  <div className="overflow-hidden rounded-[15px] bg-navy-dark ring-1 ring-white/5">
                    <div className="relative overflow-hidden">
                      <Image
                        src={mediaUrl(src)}
                        alt={`Clientes Clube Náutico — momento ${i + 1}`}
                        width={900}
                        height={1200}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/50 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40"
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
              </motion.figure>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
