"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";

const navLinks = [
  { href: "/#inicio", label: "Início" },
  { href: "/#quem-somos", label: "Quem Somos" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/reservar", label: "Reservas" },
  { href: "/#contato", label: "Contato" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, openLogin, openRegister, logout } = useAuthModal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 right-0 left-0 z-50 w-full max-w-full overflow-x-clip pt-[env(safe-area-inset-top,0px)] transition-all duration-500 ${
        scrolled
          ? "bg-navy/90 shadow-lg shadow-black/20 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3 py-2 sm:min-h-20 sm:py-0">
          <a
            href="/#inicio"
            className="min-w-0 flex-1 pr-2 sm:flex-none sm:pr-0"
            onClick={() => setMobileOpen(false)}
          >
            <span className="block font-[family-name:var(--font-poppins)] text-sm font-bold tracking-wide text-white sm:text-base sm:truncate md:text-lg md:tracking-wide lg:text-xl lg:tracking-wider">
              CLUBE <span className="text-ocean-light">NÁUTICO</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wide text-white/70 transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="max-w-[140px] truncate text-xs text-white/60" title={user.name}>
                  Olá, {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:border-white hover:text-white"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openRegister()}
                  className="rounded-full border border-gold-light/40 px-4 py-2.5 text-sm font-semibold text-gold-light transition-all duration-300 hover:border-gold-light hover:bg-gold-light/10"
                >
                  Clube VIP
                </button>
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-ocean-light hover:shadow-lg hover:shadow-ocean/25"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-transparent hover:bg-white/5 md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                mobileOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                mobileOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 bg-navy/98 shadow-inner backdrop-blur-xl md:hidden"
          >
            <nav
              className="max-h-[min(70dvh,calc(100dvh-5rem))] overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-6"
              aria-label="Menu principal"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3.5 text-base font-medium text-white/85 transition-colors active:bg-white/10 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                {user ? (
                  <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                    <p className="text-sm text-white/70">Olá, {user.name.split(" ")[0]}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="w-full rounded-full border border-white/25 py-2.5 text-sm font-semibold text-white"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        openRegister();
                      }}
                      className="w-full rounded-full border border-gold-light/45 py-3.5 text-center text-base font-semibold text-gold-light transition-all hover:bg-gold-light/10"
                    >
                      Clube VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        openLogin();
                      }}
                      className="w-full rounded-full bg-ocean px-6 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-ocean-light"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
