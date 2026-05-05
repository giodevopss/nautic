"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getPublicApiUrl } from "@/lib/api";
import {
  JETSKI_CATEGORY_LABEL,
  JETSKI_MODELS_LINE,
  type JetskiCategory,
  jetskiProductsInCategory,
  getJetskiProduct,
} from "@/lib/jetski-pricing";
import {
  LANCHA_DURATION_OPTIONS,
  getLanchaPackagePrice,
  getLanchaPackagesSummary,
  isLanchaDuration,
} from "@/lib/lancha-pricing";

type Vehicle = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  pricePerHour: number;
  capacity: number;
};

type Experience = "LANCHA" | "JETSKI";

const JETSKI_CATEGORY_ORDER: JetskiCategory[] = [
  "PASSEIO",
  "PASSEIO_DRONE",
  "ALUGUEL",
  "ALUGUEL_DRONE",
];

function todayLocalISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildStartISO(date: string, time: string): string | null {
  if (!date || !time) return null;
  const local = new Date(`${date}T${time}`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

export default function Booking() {
  const searchParams = useSearchParams();
  const apiBase = getPublicApiUrl();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [experience, setExperience] = useState<Experience>("LANCHA");
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState(todayLocalISODate);
  const [time, setTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState<number>(4);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [optMarinerPilot, setOptMarinerPilot] = useState(false);
  const [optDroneFilming, setOptDroneFilming] = useState(false);
  const [optChurrasco, setOptChurrasco] = useState(false);
  const [optCooler, setOptCooler] = useState(false);
  const [optSom, setOptSom] = useState(false);
  const [jetskiCategory, setJetskiCategory] =
    useState<JetskiCategory>("PASSEIO");
  const [jetskiProductKey, setJetskiProductKey] = useState(() => {
    const first = jetskiProductsInCategory("PASSEIO")[0];
    return first?.key ?? "";
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const tipo = searchParams.get("tipo");
    if (tipo === "jetski" || tipo === "jet") setExperience("JETSKI");
    else if (tipo === "lancha") setExperience("LANCHA");
  }, [searchParams]);

  useEffect(() => {
    if (experience === "JETSKI") {
      setOptChurrasco(false);
      setOptCooler(false);
      setOptSom(false);
      setOptDroneFilming(false);
    }
  }, [experience]);

  useEffect(() => {
    if (experience !== "JETSKI") return;
    const list = jetskiProductsInCategory(jetskiCategory);
    if (!list.some((p) => p.key === jetskiProductKey)) {
      setJetskiProductKey(list[0]?.key ?? "");
    }
  }, [experience, jetskiCategory, jetskiProductKey]);

  useEffect(() => {
    if (!apiBase) {
      setLoadError(
        "Configure NEXT_PUBLIC_API_URL (ex.: http://localhost:3001) e inicie a API.",
      );
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${apiBase}/api/vehicles`);
        if (!r.ok) throw new Error("Falha ao carregar embarcações.");
        const data = (await r.json()) as Vehicle[];
        if (!cancelled) {
          setVehicles(data);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Não foi possível conectar à API. Verifique se ela está rodando.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.type === experience),
    [vehicles, experience],
  );

  useEffect(() => {
    if (!vehicleId || !filteredVehicles.some((v) => v.id === vehicleId)) {
      setVehicleId(filteredVehicles[0]?.id ?? "");
    }
  }, [filteredVehicles, vehicleId]);

  useEffect(() => {
    if (experience !== "LANCHA") return;
    if (isLanchaDuration(durationHours)) return;
    setDurationHours(LANCHA_DURATION_OPTIONS[0]);
  }, [experience, durationHours]);

  const selected = useMemo(
    () => filteredVehicles.find((v) => v.id === vehicleId),
    [filteredVehicles, vehicleId],
  );

  const jetskiProduct = useMemo(
    () => (jetskiProductKey ? getJetskiProduct(jetskiProductKey) : undefined),
    [jetskiProductKey],
  );

  const estimatedTotal = useMemo(() => {
    if (!selected) return null;
    if (experience === "JETSKI") {
      return jetskiProduct?.priceBRL ?? null;
    }
    return getLanchaPackagePrice(selected.id, durationHours);
  }, [
    selected,
    experience,
    jetskiProduct,
    durationHours,
  ]);

  const minTimeToday = useMemo(() => {
    if (date !== todayLocalISODate()) return "06:00";
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }, [date]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setSuccessId(null);
      if (!apiBase) {
        setFormError("API não configurada.");
        return;
      }
      const startAt = buildStartISO(date, time);
      if (!startAt) {
        setFormError("Data ou horário inválidos.");
        return;
      }
      if (date === todayLocalISODate() && time < minTimeToday) {
        setFormError("Escolha um horário pelo menos ~45 minutos à frente.");
        return;
      }
      if (!vehicleId) {
        setFormError("Nenhuma embarcação disponível para este passeio.");
        return;
      }
      if (experience === "JETSKI" && !jetskiProductKey) {
        setFormError("Escolha um pacote de jetski (rota ou tempo).");
        return;
      }

      setSubmitting(true);
      try {
        const r = await fetch(`${apiBase}/api/reservations/book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleId,
            startAt,
            durationHours:
              experience === "JETSKI"
                ? 1
                : durationHours,
            jetskiProductKey:
              experience === "JETSKI" ? jetskiProductKey : undefined,
            customer: { name, email, phone },
            notes: notes.trim() || undefined,
            optMarinerPilot,
            optDroneFilming: experience === "LANCHA" ? optDroneFilming : false,
            optChurrasco: experience === "LANCHA" ? optChurrasco : false,
            optCooler: experience === "LANCHA" ? optCooler : false,
            optSom: experience === "LANCHA" ? optSom : false,
          }),
        });
        const data = (await r.json()) as { error?: string; id?: string };
        if (!r.ok) {
          setFormError(data.error ?? "Erro ao reservar.");
          return;
        }
        setSuccessId(data.id ?? "ok");
        setNotes("");
        setOptMarinerPilot(false);
        setOptDroneFilming(false);
        setOptChurrasco(false);
        setOptCooler(false);
        setOptSom(false);
      } catch {
        setFormError("Falha de rede. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      apiBase,
      date,
      time,
      durationHours,
      vehicleId,
      name,
      email,
      phone,
      notes,
      minTimeToday,
      optMarinerPilot,
      optDroneFilming,
      optChurrasco,
      optCooler,
      optSom,
      experience,
      jetskiProductKey,
    ],
  );

  const priceFmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section className="scroll-mt-24 border-t border-white/10 bg-navy py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean-light">
            Reserva online
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-poppins)] text-3xl font-bold text-white md:text-4xl">
            Agende seu <span className="text-ocean-light">passeio</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Lancha: horas e valor por embarcação. Jetski: pacotes com valores da
            tabela (passeio, aluguel por tempo ou com drone). Confirmação por
            e-mail.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mt-12 rounded-2xl border border-white/10 bg-navy-light/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm md:p-10"
        >
          {loadError && (
            <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {loadError}
            </p>
          )}

          {successId && (
            <p className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Reserva registrada com sucesso (pendente de confirmação). Guarde o
              protocolo: <strong className="text-white">{successId}</strong>.
            </p>
          )}

          <form onSubmit={submit} className="space-y-8">
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-white/50">
                Passeio
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: "LANCHA" as const, label: "Lancha" },
                    { id: "JETSKI" as const, label: "Jetski" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExperience(opt.id)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all ${
                      experience === opt.id
                        ? "border-ocean bg-ocean/20 text-white"
                        : "border-white/15 text-white/70 hover:border-white/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {experience === "JETSKI" && (
              <div className="space-y-4 rounded-xl border border-ocean/25 bg-ocean/5 p-4">
                <p className="text-xs leading-relaxed text-white/55">
                  {JETSKI_MODELS_LINE}
                </p>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
                    Tipo de serviço
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {JETSKI_CATEGORY_ORDER.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setJetskiCategory(cat)}
                        className={`rounded-lg border px-2 py-2.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide transition-all sm:text-[11px] ${
                          jetskiCategory === cat
                            ? "border-ocean bg-ocean/25 text-white"
                            : "border-white/15 text-white/65 hover:border-white/30"
                        }`}
                      >
                        {JETSKI_CATEGORY_LABEL[cat]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
                    Pacote e valor
                  </label>
                  <div className="flex flex-col gap-2">
                    {jetskiProductsInCategory(jetskiCategory).map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setJetskiProductKey(p.key)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          jetskiProductKey === p.key
                            ? "border-ocean bg-ocean/15 text-white"
                            : "border-white/12 text-white/80 hover:border-white/25"
                        }`}
                      >
                        <span>{p.label}</span>
                        <span className="shrink-0 font-semibold text-ocean-light">
                          {priceFmt(p.priceBRL)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="booking-vehicle"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50"
              >
                Embarcação
              </label>
              <select
                id="booking-vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={!filteredVehicles.length}
                className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white outline-none focus:border-ocean focus:ring-1 focus:ring-ocean disabled:opacity-50"
              >
                {filteredVehicles.length === 0 ? (
                  <option value="">Carregando…</option>
                ) : (
                  filteredVehicles.map((v) => {
                    const capLabel = `até ${v.capacity} ${v.capacity === 1 ? "pessoa" : "pessoas"}`;
                    let line: string;
                    if (v.type === "LANCHA") {
                      const pkg = getLanchaPackagesSummary(v.id, priceFmt);
                      line = pkg
                        ? `${v.name} — ${pkg} · ${capLabel}`
                        : `${v.name} — ${priceFmt(v.pricePerHour)}/h · ${capLabel}`;
                    } else if (v.type === "JETSKI" && v.pricePerHour <= 0) {
                      line = `${v.name} · ${capLabel}`;
                    } else {
                      line = `${v.name} — ${priceFmt(v.pricePerHour)}/h · ${capLabel}`;
                    }
                    return (
                      <option key={v.id} value={v.id}>
                        {line}
                      </option>
                    );
                  })
                )}
              </select>
              {selected?.description && (
                <p className="mt-2 text-sm text-white/45">{selected.description}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50"
                >
                  Data
                </label>
                <input
                  id="booking-date"
                  type="date"
                  min={todayLocalISODate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white outline-none focus:border-ocean focus:ring-1 focus:ring-ocean [color-scheme:dark]"
                />
              </div>
              <div>
                <label
                  htmlFor="booking-time"
                  className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50"
                >
                  Horário de início
                </label>
                <input
                  id="booking-time"
                  type="time"
                  min={date === todayLocalISODate() ? minTimeToday : undefined}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white outline-none focus:border-ocean focus:ring-1 focus:ring-ocean [color-scheme:dark]"
                />
              </div>
            </div>

            {experience === "LANCHA" && (
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-white/50">
                  Duração
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANCHA_DURATION_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDurationHours(h)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        durationHours === h
                          ? "border-ocean bg-ocean text-white"
                          : "border-white/15 text-white/70 hover:border-white/35"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-white/10 pt-8">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-white/50">
                Opcionais do passeio
              </label>
              <p className="mb-4 text-xs text-white/40">
                Valores dos opcionais são confirmados no retorno da nossa equipe após o pedido.
              </p>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-navy-dark/40 p-4 transition-colors hover:border-white/20">
                <input
                  type="checkbox"
                  checked={optMarinerPilot}
                  onChange={(e) => setOptMarinerPilot(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-navy-dark text-ocean focus:ring-ocean"
                />
                <span>
                  <span className="font-medium text-white">Marinheiro / Piloto</span>
                  <span className="mt-0.5 block text-xs text-white/45">
                    Profissional a bordo para condução e apoio na embarcação.
                  </span>
                </span>
              </label>

              {experience === "JETSKI" && jetskiProduct?.includesDrone && (
                <p className="rounded-xl border border-ocean/30 bg-ocean/10 px-4 py-3 text-xs text-white/75">
                  Este pacote já inclui <strong className="text-white">filmagem com drone</strong>{" "}
                  no valor acima.
                </p>
              )}

              {experience === "LANCHA" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-navy-dark/40 p-4 transition-colors hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={optDroneFilming}
                    onChange={(e) => setOptDroneFilming(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-navy-dark text-ocean focus:ring-ocean"
                  />
                  <span>
                    <span className="font-medium text-white">Filmagem com drone</span>
                    <span className="mt-0.5 block text-xs text-white/45">
                      Registro aéreo do passeio (sujeito às condições climáticas e à regulação local).
                    </span>
                  </span>
                </label>
              )}

              {experience === "LANCHA" && (
                <>
                  <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-ocean-light/90">
                    Extras para lancha
                  </p>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-navy-dark/40 p-4 transition-colors hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={optChurrasco}
                      onChange={(e) => setOptChurrasco(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-navy-dark text-ocean focus:ring-ocean"
                    />
                    <span>
                      <span className="font-medium text-white">Churrasco</span>
                      <span className="mt-0.5 block text-xs text-white/45">
                        Estrutura para churrasco a bordo (detalhes combinados na confirmação).
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-navy-dark/40 p-4 transition-colors hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={optCooler}
                      onChange={(e) => setOptCooler(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-navy-dark text-ocean focus:ring-ocean"
                    />
                    <span>
                      <span className="font-medium text-white">Cooler</span>
                      <span className="mt-0.5 block text-xs text-white/45">
                        Caixa térmica para bebidas e gelo.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-navy-dark/40 p-4 transition-colors hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={optSom}
                      onChange={(e) => setOptSom(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-navy-dark text-ocean focus:ring-ocean"
                    />
                    <span>
                      <span className="font-medium text-white">Som</span>
                      <span className="mt-0.5 block text-xs text-white/45">
                        Sistema de som a bordo para sua playlist.
                      </span>
                    </span>
                  </label>
                </>
              )}
            </div>

            {estimatedTotal != null && (
              <p className="text-center text-lg text-white/80">
                {experience === "JETSKI" ? (
                  <>
                    Valor do pacote:{" "}
                    <span className="font-semibold text-ocean-light">
                      {priceFmt(estimatedTotal)}
                    </span>
                  </>
                ) : (
                  <>
                    Valor estimado (embarcação):{" "}
                    <span className="font-semibold text-ocean-light">
                      {priceFmt(estimatedTotal)}
                    </span>
                  </>
                )}
              </p>
            )}

            <div className="space-y-4 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Seus dados
              </p>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-ocean"
              />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-ocean"
              />
              <input
                type="tel"
                required
                autoComplete="tel"
                placeholder="Telefone / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-ocean"
              />
              <textarea
                rows={2}
                placeholder="Observações (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-ocean"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-300" role="alert">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !!loadError || !filteredVehicles.length}
              className="w-full rounded-full bg-ocean py-4 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-ocean-light hover:shadow-lg hover:shadow-ocean/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Confirmar reserva"}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
