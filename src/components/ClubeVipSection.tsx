"use client";

import { motion } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";

const perks = [
  {
    title: "Descontos exclusivos",
    body: "Condições especiais em aluguel de lanchas, jetski e experiências — só para quem está na lista.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <path d="M7 7h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Sorteios e brindes",
    body: "Participação em sorteios de passeios, upgrades e surpresas ao longo do ano.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M5 19h14M8 17v2M12 17v2M16 17v2" />
      </svg>
    ),
  },
  {
    title: "Prioridade em datas",
    body: "Aviso antecipado de feriados e fins de semana cheios — mais chance de garantir seu dia no mar.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Novidades em primeira mão",
    body: "Novos equipamentos, roteiros e parcerias chegam primeiro ao seu e-mail, sem spam.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ClubeVipSection() {
  const { openRegister } = useAuthModal();

  return (
    <section
      id="clube-vip"
      className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-navy-dark via-navy to-navy-dark py-24 lg:py-32"
    >
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-ocean/15 blur-[90px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block rounded-full border border-gold-light/35 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            Clube VIP
          </span>
          <h2 className="mt-6 font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Benefícios para quem{" "}
            <span className="bg-gradient-to-r from-gold-light to-ocean-light bg-clip-text text-transparent">
              navega com a gente
            </span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            O Clube VIP é gratuito: você deixa seu melhor e-mail e recebe ofertas, convites e vantagens que não
            publicamos no site. Quanto mais perto estamos, melhor cuidamos da sua próxima experiência no mar.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:gap-8"
        >
          {perks.map((p) => (
            <motion.article
              key={p.title}
              variants={item}
              className="rounded-2xl border border-white/10 bg-navy-light/35 p-6 shadow-lg shadow-black/20 backdrop-blur-sm transition-colors duration-300 hover:border-gold-light/25 lg:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-ocean/20 text-gold-light">
                {p.icon}
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-poppins)] text-xl font-bold text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55 lg:text-base">{p.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mx-auto mt-14 max-w-2xl rounded-2xl border border-gold-light/20 bg-gradient-to-br from-gold/[0.08] via-navy-light/40 to-ocean/[0.06] p-8 text-center lg:mt-16 lg:p-10"
        >
          <p className="text-sm leading-relaxed text-white/70 lg:text-base">
            Cadastro em poucos segundos. Você pode sair da lista quando quiser — e continuar reservando normalmente
            pelo site.
          </p>
          <button
            type="button"
            onClick={() => openRegister()}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-4 text-sm font-bold uppercase tracking-[0.15em] text-navy-dark shadow-lg shadow-gold/25 transition hover:brightness-110 sm:w-auto sm:px-12"
          >
            Entrar no Clube VIP
          </button>
        </motion.div>
      </div>
    </section>
  );
}
