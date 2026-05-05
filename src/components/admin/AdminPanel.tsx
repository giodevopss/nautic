"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicApiUrl } from "@/lib/api";
import { jetskiProductLabel } from "@/lib/jetski-pricing";

const TOKEN_KEY = "nautic_admin_token";

type Tab = "reservas" | "clientes" | "disponibilidade" | "frota";

const FLEET_LABEL: Record<string, string> = {
  AVAILABLE: "Disponível",
  IN_USE: "Em uso",
  MAINTENANCE: "Manutenção",
};

const RES_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function fmtMoney(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtReservationExtras(row: {
  jetskiProductKey?: string | null;
  optMarinerPilot?: boolean;
  optDroneFilming?: boolean;
  optChurrasco?: boolean;
  optCooler?: boolean;
  optSom?: boolean;
}) {
  const bits: string[] = [];
  if (row.jetskiProductKey) {
    bits.push(`Jetski: ${jetskiProductLabel(row.jetskiProductKey)}`);
  }
  if (row.optMarinerPilot) bits.push("Mar./piloto");
  if (row.optDroneFilming && !row.jetskiProductKey) bits.push("Drone");
  if (row.optChurrasco) bits.push("Churrasco");
  if (row.optCooler) bits.push("Cooler");
  if (row.optSom) bits.push("Som");
  return bits.length ? bits.join(", ") : "—";
}

export default function AdminPanel() {
  const apiBase = getPublicApiUrl();
  const [token, setToken] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("reservas");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;
    setToken(t);
  }, []);

  const authHeaders = useCallback(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const adminFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const baseH = authHeaders();
      const extra = init?.headers;
      const headers = new Headers(baseH);
      if (extra instanceof Headers) {
        extra.forEach((v, k) => headers.set(k, v));
      } else if (extra && typeof extra === "object") {
        Object.entries(extra).forEach(([k, v]) => {
          if (v != null) headers.set(k, String(v));
        });
      }
      const r = await fetch(`${apiBase}${path}`, { ...init, headers });
      return r;
    },
    [apiBase, authHeaders],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const t = loginInput.trim();
    if (!t) {
      setLoginError("Informe o segredo de administrador.");
      return;
    }
    try {
      const r = await fetch(`${apiBase}/api/admin/vehicles`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (r.status === 401 || r.status === 503) {
        setLoginError(
          r.status === 503
            ? "API sem ADMIN_SECRET configurado."
            : "Segredo inválido.",
        );
        return;
      }
      if (!r.ok) {
        setLoginError("Não foi possível validar o acesso.");
        return;
      }
    } catch {
      setLoginError("Não foi possível conectar à API.");
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setLoginInput("");
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!apiBase) {
    return (
      <div className="min-h-screen bg-navy-dark px-6 py-16 text-white">
        <p className="text-center text-white/60">
          Defina NEXT_PUBLIC_API_URL para usar o painel.
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-dark px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-light/50 p-8">
          <h1 className="text-center font-[family-name:var(--font-poppins)] text-2xl font-bold text-white">
            Painel administrativo
          </h1>
          <p className="mt-2 text-center text-sm text-white/50">
            Use o mesmo valor definido em{" "}
            <code className="text-ocean-light">ADMIN_SECRET</code> na API.
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Segredo administrativo"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-navy-dark px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-ocean"
            />
            {loginError && (
              <p className="text-sm text-red-300" role="alert">
                {loginError}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-ocean py-3 text-sm font-semibold uppercase tracking-widest text-white hover:bg-ocean-light"
            >
              Entrar
            </button>
          </form>
          <a
            href="/"
            className="mt-6 block text-center text-sm text-white/45 hover:text-white"
          >
            ← Voltar ao site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-dark text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-navy/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="font-[family-name:var(--font-poppins)] text-lg font-bold">
              Painel administrativo
            </h1>
            <p className="mt-0.5 text-xs text-white/45">
              Reservas, clientes, disponibilidade e bloqueio manual de datas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["reservas", "Reservas"],
                ["clientes", "Clientes"],
                ["disponibilidade", "Disponibilidade"],
                ["frota", "Frota"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setMsg(null);
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  tab === id
                    ? "bg-ocean text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:border-white/40"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {msg && (
          <p className="mb-6 rounded-lg border border-ocean/40 bg-ocean/10 px-4 py-2 text-sm text-ocean-light">
            {msg}
          </p>
        )}
        {tab === "reservas" && (
          <ReservasTab adminFetch={adminFetch} setBusy={setBusy} busy={busy} setMsg={setMsg} />
        )}
        {tab === "clientes" && (
          <ClientesTab adminFetch={adminFetch} setBusy={setBusy} busy={busy} setMsg={setMsg} />
        )}
        {tab === "disponibilidade" && (
          <DisponibilidadeTab
            adminFetch={adminFetch}
            setBusy={setBusy}
            busy={busy}
            setMsg={setMsg}
          />
        )}
        {tab === "frota" && (
          <FrotaTab adminFetch={adminFetch} setBusy={setBusy} busy={busy} setMsg={setMsg} />
        )}
      </main>
    </div>
  );
}

type AdminFetch = (path: string, init?: RequestInit) => Promise<Response>;

function ReservasTab({
  adminFetch,
  setBusy,
  busy,
  setMsg,
}: {
  adminFetch: AdminFetch;
  setBusy: (v: boolean) => void;
  busy: boolean;
  setMsg: (s: string | null) => void;
}) {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      status: string;
      startDate: string;
      endDate: string;
      totalPrice: number;
      notes: string | null;
      jetskiProductKey?: string | null;
      optMarinerPilot?: boolean;
      optDroneFilming?: boolean;
      optChurrasco?: boolean;
      optCooler?: boolean;
      optSom?: boolean;
      customer: { name: string; email: string; phone: string };
      vehicle: { name: string; type: string };
    }>
  >([]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/reservations");
      if (r.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        window.location.reload();
        return;
      }
      if (!r.ok) throw new Error();
      setRows(await r.json());
    } finally {
      setBusy(false);
    }
  }, [adminFetch, setBusy]);

  useEffect(() => {
    load();
  }, [load]);

  const patchStatus = async (id: string, status: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminFetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setMsg(j.error ?? "Falha ao atualizar.");
        return;
      }
      setMsg("Reserva atualizada.");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Reservas</h2>
        <button
          type="button"
          disabled={busy}
          onClick={() => load()}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-white/10 bg-navy-light/80 text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Embarcação</th>
              <th className="px-4 py-3">Opcionais</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white/80">
                  {fmtDate(row.startDate)} — {fmtDate(row.endDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.customer.name}</div>
                  <div className="text-xs text-white/45">{row.customer.email}</div>
                  <div className="text-xs text-white/45">{row.customer.phone}</div>
                </td>
                <td className="px-4 py-3 text-white/80">
                  {row.vehicle.name}{" "}
                  <span className="text-white/40">({row.vehicle.type})</span>
                </td>
                <td className="max-w-[200px] px-4 py-3 text-xs text-white/55">
                  {fmtReservationExtras(row)}
                </td>
                <td className="px-4 py-3">{fmtMoney(row.totalPrice)}</td>
                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    disabled={busy}
                    onChange={(e) => patchStatus(row.id, e.target.value)}
                    className="rounded-lg border border-white/15 bg-navy-dark px-2 py-1 text-xs outline-none focus:border-ocean"
                  >
                    {Object.entries(RES_LABEL).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-white/45">Nenhuma reserva.</p>
        )}
      </div>
    </div>
  );
}

function ClientesTab({
  adminFetch,
  setBusy,
  busy,
  setMsg,
}: {
  adminFetch: AdminFetch;
  setBusy: (v: boolean) => void;
  busy: boolean;
  setMsg: (s: string | null) => void;
}) {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      _count: { reservations: number };
    }>
  >([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/customers");
      if (r.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        window.location.reload();
        return;
      }
      if (!r.ok) throw new Error();
      setRows(await r.json());
    } finally {
      setBusy(false);
    }
  }, [adminFetch, setBusy]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (row: (typeof rows)[0]) => {
    setEditing(row.id);
    setForm({ name: row.name, email: row.email, phone: row.phone });
  };

  const save = async (id: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminFetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setMsg(j.error ?? "Falha ao salvar.");
        return;
      }
      setEditing(null);
      setMsg("Cliente atualizado.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este cliente? Só é permitido se não houver reservas.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminFetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (r.status === 409) {
        setMsg("Cliente com reservas não pode ser excluído.");
        return;
      }
      if (!r.ok) {
        setMsg("Falha ao excluir.");
        return;
      }
      setMsg("Cliente excluído.");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Clientes</h2>
        <button
          type="button"
          disabled={busy}
          onClick={() => load()}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          Atualizar
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-navy-light/80 text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Reservas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                {editing === row.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded border border-white/15 bg-navy-dark px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full rounded border border-white/15 bg-navy-dark px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full rounded border border-white/15 bg-navy-dark px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-white/50">{row._count.reservations}</td>
                    <td className="space-x-2 px-4 py-2 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => save(row.id)}
                        className="text-ocean-light hover:underline"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="text-white/45 hover:underline"
                      >
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-white/70">{row.email}</td>
                    <td className="px-4 py-3 text-white/70">{row.phone}</td>
                    <td className="px-4 py-3 text-white/50">{row._count.reservations}</td>
                    <td className="space-x-3 px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="text-ocean-light hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={busy || row._count.reservations > 0}
                        onClick={() => remove(row.id)}
                        className="text-red-300 hover:underline disabled:opacity-30"
                      >
                        Excluir
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-white/45">Nenhum cliente.</p>
        )}
      </div>
    </div>
  );
}

function startOfLocalDayYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function endOfLocalDayYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function DisponibilidadeTab({
  adminFetch,
  setBusy,
  busy,
  setMsg,
}: {
  adminFetch: AdminFetch;
  setBusy: (v: boolean) => void;
  busy: boolean;
  setMsg: (s: string | null) => void;
}) {
  const [data, setData] = useState<{
    reservations: Array<{
      id: string;
      startDate: string;
      endDate: string;
      status: string;
      vehicle: { name: string };
      customer: { name: string };
    }>;
    blocks: Array<{
      id: string;
      startDate: string;
      endDate: string;
      reason: string | null;
      vehicle: { name: string } | null;
    }>;
    vehicles: Array<{ id: string; name: string }>;
  } | null>(null);

  const [vehicleId, setVehicleId] = useState("");
  const [blockMode, setBlockMode] = useState<"datetime" | "daterange">("daterange");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/availability");
      if (r.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        window.location.reload();
        return;
      }
      if (!r.ok) throw new Error();
      setData(await r.json());
    } finally {
      setBusy(false);
    }
  }, [adminFetch, setBusy]);

  useEffect(() => {
    load();
  }, [load]);

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    let startDateIso: string;
    let endDateIso: string;
    if (blockMode === "datetime") {
      if (!startLocal || !endLocal) {
        setErr("Informe início e fim.");
        return;
      }
      const s = new Date(startLocal);
      const en = new Date(endLocal);
      if (en.getTime() <= s.getTime()) {
        setErr("O fim deve ser depois do início.");
        return;
      }
      startDateIso = s.toISOString();
      endDateIso = en.toISOString();
    } else {
      if (!startDay || !endDay) {
        setErr("Informe a data inicial e a final.");
        return;
      }
      if (endDay < startDay) {
        setErr("A data final não pode ser anterior à inicial.");
        return;
      }
      startDateIso = startOfLocalDayYmd(startDay).toISOString();
      endDateIso = endOfLocalDayYmd(endDay).toISOString();
    }
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/blocks", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: vehicleId || null,
          startDate: startDateIso,
          endDate: endDateIso,
          reason: reason || undefined,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error ?? "Falha ao criar bloqueio.");
        return;
      }
      setReason("");
      setMsg("Bloqueio criado.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const delBlock = async (id: string) => {
    if (!confirm("Remover este bloqueio?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminFetch(`/api/admin/blocks/${id}`, { method: "DELETE" });
      if (r.ok) setMsg("Bloqueio removido.");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">Disponibilidade</h2>
        <p className="mt-1 text-sm text-white/50">
          Visão dos próximos 30 dias: reservas ativas (pendente/confirmada), bloqueios manuais por
          embarcação ou para toda a frota.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => load()}
          className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          Atualizar
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold text-ocean-light">Reservas no período</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {(data?.reservations ?? []).map((r) => (
              <li key={r.id} className="rounded-lg bg-white/5 px-3 py-2">
                <div className="font-medium">{r.vehicle.name}</div>
                <div className="text-white/55">
                  {fmtDate(r.startDate)} — {fmtDate(r.endDate)}
                </div>
                <div className="text-xs text-white/40">
                  {r.customer.name} · {RES_LABEL[r.status] ?? r.status}
                </div>
              </li>
            ))}
          </ul>
          {(data?.reservations ?? []).length === 0 && (
            <p className="mt-4 text-white/45">Nenhuma reserva neste intervalo.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold text-ocean-light">Bloqueios ativos</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {(data?.blocks ?? []).map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-amber-500/10 px-3 py-2"
              >
                <div>
                  <div className="font-medium text-amber-100">
                    {b.vehicle ? b.vehicle.name : "Toda a frota"}
                  </div>
                  <div className="text-white/55">
                    {fmtDate(b.startDate)} — {fmtDate(b.endDate)}
                  </div>
                  {b.reason && (
                    <div className="text-xs text-white/45">{b.reason}</div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => delBlock(b.id)}
                  className="text-xs text-red-300 hover:underline"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
          {(data?.blocks ?? []).length === 0 && (
            <p className="mt-4 text-white/45">Nenhum bloqueio neste intervalo.</p>
          )}
        </div>
      </div>

      <form
        onSubmit={addBlock}
        className="rounded-xl border border-white/10 bg-navy-light/30 p-6"
      >
        <h3 className="font-semibold">Bloquear datas manualmente</h3>
        <p className="mt-1 text-sm text-white/45">
          Impede novas reservas no intervalo no site. Deixe a embarcação em branco para bloquear toda
          a frota.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["daterange", "Por dia(s)"],
              ["datetime", "Horário exato"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setBlockMode(id);
                setErr(null);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                blockMode === id
                  ? "bg-ocean text-white"
                  : "bg-white/5 text-white/55 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-white/45">
              Embarcação (opcional)
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            >
              <option value="">Toda a frota</option>
              {data?.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          {blockMode === "daterange" ? (
            <>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">De (dia)</label>
                <input
                  type="date"
                  required
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Até (dia)</label>
                <input
                  type="date"
                  required
                  value={endDay}
                  onChange={(e) => setEndDay(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm [color-scheme:dark]"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Início</label>
                <input
                  type="datetime-local"
                  required
                  value={startLocal}
                  onChange={(e) => setStartLocal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Fim</label>
                <input
                  type="datetime-local"
                  required
                  value={endLocal}
                  onChange={(e) => setEndLocal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm [color-scheme:dark]"
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-white/45">Motivo</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: Manutenção programada, evento interno…"
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm placeholder:text-white/30"
            />
          </div>
        </div>
        {err && (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded-full bg-ocean px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-ocean-light disabled:opacity-50"
        >
          Criar bloqueio
        </button>
      </form>
    </div>
  );
}

function FrotaTab({
  adminFetch,
  setBusy,
  busy,
  setMsg,
}: {
  adminFetch: AdminFetch;
  setBusy: (v: boolean) => void;
  busy: boolean;
  setMsg: (s: string | null) => void;
}) {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      fleetStatus: string;
      pricePerHour: number;
      capacity: number;
      description: string | null;
      _count: { reservations: number };
    }>
  >([]);

  const [form, setForm] = useState({
    name: "",
    type: "LANCHA" as "LANCHA" | "JETSKI",
    pricePerHour: "",
    capacity: "6",
    description: "",
    fleetStatus: "AVAILABLE" as string,
  });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/vehicles");
      if (r.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        window.location.reload();
        return;
      }
      if (!r.ok) throw new Error();
      setRows(await r.json());
    } finally {
      setBusy(false);
    }
  }, [adminFetch, setBusy]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/vehicles", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          pricePerHour: Number(form.pricePerHour),
          capacity: Number(form.capacity) || 1,
          description: form.description || undefined,
          fleetStatus: form.fleetStatus,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setMsg(j.error ?? "Falha ao cadastrar.");
        return;
      }
      setForm({
        name: "",
        type: "LANCHA",
        pricePerHour: "",
        capacity: "6",
        description: "",
        fleetStatus: "AVAILABLE",
      });
      setMsg("Embarcação cadastrada.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const patchFleet = async (id: string, fleetStatus: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminFetch(`/api/admin/vehicles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ fleetStatus }),
      });
      if (!r.ok) {
        setMsg("Falha ao atualizar status.");
        return;
      }
      setMsg("Status da frota atualizado.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta embarcação? Só permitido sem reservas no histórico.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await adminFetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
      if (r.status === 409) {
        setMsg("Não é possível excluir: há reservas vinculadas.");
        return;
      }
      if (!r.ok) {
        setMsg("Falha ao excluir.");
        return;
      }
      setMsg("Embarcação excluída.");
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Frota</h2>
          <button
            type="button"
            disabled={busy}
            onClick={() => load()}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Atualizar
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-white/10 bg-navy-light/80 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Preço/h</th>
                <th className="px-4 py-3">Cap.</th>
                <th className="px-4 py-3">Reservas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-white/60">{row.type}</td>
                  <td className="px-4 py-3">{fmtMoney(row.pricePerHour)}</td>
                  <td className="px-4 py-3">{row.capacity}</td>
                  <td className="px-4 py-3 text-white/45">{row._count.reservations}</td>
                  <td className="px-4 py-3">
                    <select
                      value={row.fleetStatus}
                      disabled={busy}
                      onChange={(e) => patchFleet(row.id, e.target.value)}
                      className="rounded-lg border border-white/15 bg-navy-dark px-2 py-1 text-xs outline-none focus:border-ocean"
                    >
                      {Object.entries(FLEET_LABEL).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busy || row._count.reservations > 0}
                      onClick={() => remove(row.id)}
                      className="text-xs text-red-300 hover:underline disabled:opacity-30"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-8 text-center text-white/45">Nenhuma embarcação.</p>
          )}
        </div>
      </div>

      <form
        onSubmit={create}
        className="rounded-xl border border-white/10 bg-navy-light/30 p-6"
      >
        <h3 className="font-semibold">Nova embarcação</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-white/45">Nome</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/45">Tipo</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as "LANCHA" | "JETSKI" }))
              }
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            >
              <option value="LANCHA">Lancha</option>
              <option value="JETSKI">Jetski</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/45">Status inicial</label>
            <select
              value={form.fleetStatus}
              onChange={(e) => setForm((f) => ({ ...f, fleetStatus: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            >
              {Object.entries(FLEET_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/45">Preço / hora</label>
            <input
              required
              type="number"
              min={0}
              step={0.01}
              value={form.pricePerHour}
              onChange={(e) => setForm((f) => ({ ...f, pricePerHour: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/45">Capacidade</label>
            <input
              required
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-white/45">Descrição</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-navy-dark px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded-full bg-ocean px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-ocean-light disabled:opacity-50"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}
