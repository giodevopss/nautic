"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";

const CTA_REGISTER_KEY = "nautic_cta_register_prompt";

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const { openRegister } = useAuthModal();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === "undefined") return;
    if (sessionStorage.getItem(CTA_REGISTER_KEY) === "1") return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          // Não usar só intersectionRatio: secções altas (py + conteúdo) quase nunca chegam a 35% visíveis.
          const visiblePx = e.intersectionRect.height;
          const vh = window.innerHeight;
          if (visiblePx >= Math.min(200, vh * 0.22)) {
            sessionStorage.setItem(CTA_REGISTER_KEY, "1");
            openRegister();
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.5, 0.75, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [openRegister]);

  return (
    <section ref={sectionRef} id="contato" className="relative overflow-hidden py-32">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-navy-dark/80 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean-light">
            Não perca tempo
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Pronto para viver essa{" "}
            <span className="text-ocean-light">experiência</span>?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
            Reserve pelo site ou fale com a gente no WhatsApp — seu momento no mar
            começa aqui.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a
              href="/reservar"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 rounded-full bg-ocean px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-ocean/30 transition-colors duration-300 hover:bg-ocean-light"
            >
              Reservar online
            </motion.a>
            <motion.a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 rounded-full border-2 border-white/35 px-10 py-5 text-lg font-bold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
