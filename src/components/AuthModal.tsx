"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthModal, type AuthUser } from "@/context/AuthModalContext";
import {
  describePublicApiFetchFailure,
  getPublicApiUrl,
  mixedContentBlockMessage,
  publicApiUrl,
} from "@/lib/api";

export default function AuthModal() {
  const { modal, closeModal, openLogin, openRegister, authSuccess } = useAuthModal();
  const apiBase = getPublicApiUrl();
  const panelRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vipSent, setVipSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!modal) {
      setError(null);
      setPassword("");
      setVipSent(false);
    }
  }, [modal]);

  useEffect(() => {
    if (modal === "login") {
      setVipSent(false);
      setError(null);
    }
  }, [modal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (modal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  useEffect(() => {
    if (modal && panelRef.current) {
      const el = panelRef.current.querySelector<HTMLElement>(
        "input:not([type=hidden])",
      );
      el?.focus();
    }
  }, [modal, vipSent]);

  const submitVipLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (apiBase === undefined) {
      setError("API não configurada.");
      return;
    }
    const mc = mixedContentBlockMessage(apiBase);
    if (mc) {
      setError(mc);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(publicApiUrl(apiBase, "/api/auth/vip-lead"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      setVipSent(true);
    } catch (e) {
      setError(describePublicApiFetchFailure(e));
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (apiBase === undefined) {
      setError("API não configurada.");
      return;
    }
    const mc = mixedContentBlockMessage(apiBase);
    if (mc) {
      setError(mc);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(publicApiUrl(apiBase, "/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await r.json()) as { error?: string; token?: string; customer?: AuthUser };
      if (!r.ok) {
        setError(data.error ?? "Erro ao entrar.");
        return;
      }
      if (data.token && data.customer) authSuccess(data.token, data.customer);
    } catch (e) {
      setError(describePublicApiFetchFailure(e));
    } finally {
      setBusy(false);
    }
  };

  if (!mounted) return null;

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-navy px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-ocean";

  const node = (
    <AnimatePresence mode="sync">
      {modal ? (
        <motion.div
          key="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/75 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="max-h-[min(92dvh,680px)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-navy-light via-navy-dark to-navy-dark shadow-2xl shadow-black/60"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2
                id="auth-modal-title"
                className="font-[family-name:var(--font-poppins)] text-lg font-bold text-white"
              >
                {modal === "register" ? "Clube VIP" : "Entrar na sua conta"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-b border-white/10 px-5 py-3">
              <div className="flex rounded-xl bg-black/25 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    openRegister();
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    modal === "register"
                      ? "bg-gradient-to-r from-gold/90 to-gold-light/90 text-navy-dark shadow-md"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  Clube VIP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    openLogin();
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    modal === "login"
                      ? "bg-ocean text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  Login
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              {error && (
                <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              )}

              {modal === "register" ? (
                vipSent ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <p className="font-[family-name:var(--font-poppins)] text-xl font-bold text-white">
                      Você entrou para o Clube VIP!
                    </p>
                    <p className="text-sm leading-relaxed text-white/65">
                      Em breve você recebe no e-mail ofertas, descontos e novidades exclusivas.
                      Combine sua próxima experiência no mar com vantagens de membro.
                    </p>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full rounded-full bg-ocean py-3.5 text-sm font-semibold uppercase tracking-widest text-white hover:bg-ocean-light"
                    >
                      Fechar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/15 via-ocean/10 to-transparent px-5 py-6 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-light">
                        Oferta para novos membros
                      </p>
                      <p className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-black leading-none text-white">
                        <span className="bg-gradient-to-r from-gold-light to-ocean-light bg-clip-text text-transparent">
                          Desconto exclusivo
                        </span>
                      </p>
                      <p className="mt-2 text-sm font-medium text-white/85">
                        no seu próximo passeio
                      </p>
                      <p className="mx-auto mt-4 max-w-[280px] text-xs leading-relaxed text-white/55">
                        Faça parte do nosso{" "}
                        <strong className="text-gold-light">Clube VIP</strong> para mais descontos,
                        prioridade em datas e experiências reservadas.
                      </p>
                    </div>

                    <form onSubmit={submitVipLead} className="space-y-4">
                      <div>
                        <label
                          htmlFor="auth-vip-email"
                          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50"
                        >
                          Seu melhor e-mail
                        </label>
                        <input
                          id="auth-vip-email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="voce@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                        />
                        <p className="mt-2 text-[11px] text-white/40">
                          Sem spam — só benefícios e convites especiais.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={busy}
                        className="w-full rounded-full bg-gradient-to-r from-gold to-gold-light py-4 text-sm font-bold uppercase tracking-[0.2em] text-navy-dark shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:opacity-50"
                      >
                        {busy ? "Enviando…" : "Quero fazer parte do Clube VIP"}
                      </button>
                    </form>
                  </div>
                )
              ) : (
                <form onSubmit={submitLogin} className="space-y-4">
                  <div>
                    <label htmlFor="auth-email-l" className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                      E-mail
                    </label>
                    <input
                      id="auth-email-l"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-pass-l" className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                      Senha
                    </label>
                    <input
                      id="auth-pass-l"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-full bg-ocean py-3.5 text-sm font-semibold uppercase tracking-widest text-white hover:bg-ocean-light disabled:opacity-50"
                  >
                    {busy ? "Entrando…" : "Entrar"}
                  </button>
                </form>
              )}

              {modal === "login" && (
                <p className="mt-4 text-center text-xs text-white/40">
                  Ainda não tem conta com senha?{" "}
                  <button
                    type="button"
                    className="font-medium text-gold-light hover:underline"
                    onClick={() => {
                      setError(null);
                      openRegister();
                    }}
                  >
                    Entre no Clube VIP
                  </button>
                  {" · "}
                  <a href="/reservar" className="text-ocean-light hover:underline" onClick={closeModal}>
                    Reservar online
                  </a>
                </p>
              )}

              {modal === "register" && !vipSent && (
                <p className="mt-5 text-center text-xs text-white/40">
                  Já tem login e senha?{" "}
                  <button
                    type="button"
                    className="font-medium text-ocean-light hover:underline"
                    onClick={() => {
                      setError(null);
                      openLogin();
                    }}
                  >
                    Acessar conta
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}
