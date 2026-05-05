"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type ServiceItem = {
  title: string;
  description: string;
  reserveHref: string;
  alt: string;
  image?: string;
  video?: string;
  /** Se omitido, usa “Reservar online” */
  linkLabel?: string;
};

const services: ServiceItem[] = [
  {
    title: "Aluguel de Lanchas",
    description:
      "Navegue com estilo e conforto em nossas lanchas premium. Ideal para passeios em família, eventos ou momentos especiais no mar.",
    video: "/videos/aluguel-lancha.mp4",
    alt: "Vídeo — passeio de lancha no mar",
    reserveHref: "/reservar?tipo=lancha",
  },
  {
    title: "Aluguel de Jetski",
    description:
      "Sinta a adrenalina e a liberdade em nossos PWC (personal watercraft). Passeio em jet ski aquático com total segurança.",
    video: "/videos/aluguel-jetski.mp4",
    alt: "Vídeo — passeio de jetski no mar",
    reserveHref: "/reservar?tipo=jetski",
  },
  {
    title: "Passeios Personalizados",
    description:
      "Roteiros exclusivos sob medida para você. Celebrações, pôr do sol no mar ou expedições — nós planejamos tudo.",
    video: "/videos/passeios-personalizados.mp4",
    alt: "Vídeo — passeios personalizados e experiências no mar",
    reserveHref: "/reservar",
  },
  {
    title: "Mecânica náutica",
    description:
      "Manutenção e reparo de embarcações e motores aquáticos. Diagnóstico, revisão preventiva e suporte para sua frota ou lancha particular com profissionais experientes.",
    video: "/videos/mecanica-nautica.mp4",
    alt: "Vídeo — mecânica náutica e manutenção de embarcações",
    reserveHref: "/#contato",
    linkLabel: "Fale conosco",
  },
  {
    title: "Habilitação náutica",
    description:
      "Preparação para obter sua habilitação (carteira náutica) com orientação prática e teórica. Atenda à legislação e pilote com segurança e confiança.",
    video: "/videos/habn.mp4",
    alt: "Vídeo — habilitação e formação náutica",
    reserveHref: "/#contato",
    linkLabel: "Fale conosco",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function ServiceCard({
  service,
  compact,
}: {
  service: ServiceItem;
  /** Cartões um pouco menores (segunda fila) */
  compact?: boolean;
}) {
  const shell = compact
    ? "mx-auto w-full max-w-sm rounded-2xl border border-white/5 sm:max-w-[22rem]"
    : "rounded-2xl border border-white/5";

  const lift = compact ? "hover:-translate-y-1" : "hover:-translate-y-2";

  return (
    <motion.div
      variants={cardVariants}
      className={`group relative w-full overflow-hidden bg-navy-light/50 backdrop-blur-sm transition-all duration-500 hover:border-ocean/30 hover:shadow-2xl hover:shadow-ocean/10 ${lift} ${shell}`}
    >
      <div
        className={`relative overflow-hidden ${compact ? "h-52 sm:h-56" : "h-64"}`}
      >
        {service.video ? (
          <video
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={service.alt}
          >
            <source
              src={service.video}
              type={
                service.video.toLowerCase().endsWith(".mov")
                  ? "video/quicktime"
                  : "video/mp4"
              }
            />
          </video>
        ) : (
          <Image
            src={service.image!}
            alt={service.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes={
              compact
                ? "(max-width: 640px) 100vw, 352px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-light to-transparent" />
      </div>

      <div className={compact ? "p-5" : "p-6"}>
        <h3
          className={`font-[family-name:var(--font-poppins)] font-bold text-white ${
            compact ? "text-lg" : "text-xl"
          }`}
        >
          {service.title}
        </h3>
        <p
          className={`leading-relaxed text-white/60 ${
            compact ? "mt-2 text-sm" : "mt-3 text-sm"
          }`}
        >
          {service.description}
        </p>
        <a
          href={service.reserveHref}
          className={`inline-flex items-center gap-2 font-semibold text-ocean-light transition-colors duration-300 hover:text-white ${
            compact ? "mt-5 text-sm" : "mt-6 text-sm"
          }`}
        >
          {service.linkLabel ?? "Reservar online"}
          <svg
            width={compact ? 15 : 16}
            height={compact ? 15 : 16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <section id="servicos" className="relative bg-navy-dark py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean-light">
            O que oferecemos
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-4xl font-bold text-white md:text-5xl">
            Nossos <span className="text-ocean-light">Serviços</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Escolha a experiência ideal para você e embarque em momentos
            inesquecíveis.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/45 md:text-base">
            Aluguel, passeios, mecânica náutica e cursos para habilitação — fale conosco para
            combinar marinheiro, som, filmagem com drone ou manutenção da sua embarcação.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 flex flex-col gap-8 lg:gap-10"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>
          <div className="flex flex-col items-stretch gap-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2 md:gap-3">
            {services.slice(3).map((service) => (
              <ServiceCard key={service.title} service={service} compact />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
