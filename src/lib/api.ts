/**
 * URL completa para `fetch` no browser.
 * Normaliza `NEXT_PUBLIC_API_URL` se vier com sufixo `/api` por engano.
 */
export function publicApiUrl(apiBase: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (apiBase === "") return p;
  const trimmed = apiBase.replace(/\/$/, "");
  const root = trimmed.replace(/\/api\/?$/i, "");
  return `${root}${p}`;
}

/** Site em HTTPS + API em HTTP → o browser bloqueia (mixed content). */
export function mixedContentBlockMessage(apiBase: string): string | null {
  if (apiBase === "") return null;
  if (typeof window === "undefined") return null;
  if (window.location.protocol !== "https:") return null;
  try {
    if (new URL(apiBase).protocol === "http:") {
      return "O site está em HTTPS mas a URL da API usa HTTP — o navegador bloqueia. No Railway use a URL https:// do serviço da API (não use http://).";
    }
  } catch {
    return "NEXT_PUBLIC_API_URL parece inválida (use uma URL completa, ex.: https://api-xxx.up.railway.app).";
  }
  return null;
}

export function describePublicApiFetchFailure(err: unknown): string {
  const hints =
    "Confirme no Railway: serviço da API em execução, URL pública correta, e NEXT_PUBLIC_API_URL com https:// (a mesma que abre no browser). Se a URL terminar em /api, remova — o código já acrescenta /api/... .";
  if (err instanceof TypeError) {
    const m = err.message || "";
    if (/fetch|network|load failed|failed to fetch/i.test(m)) {
      return `Não foi possível contactar a API. ${hints}`;
    }
    return `Erro: ${m}. ${hints}`;
  }
  if (err instanceof Error) return `${err.message}. ${hints}`;
  return hints;
}

/**
 * Base da API para o browser.
 * - `string` (não vazio): URL absoluta, ex. https://api-xxx.up.railway.app
 * - `""`: mesmo domínio do site — pedidos vão a `/api/...` (Next reescreve para `API_UPSTREAM_URL` no build)
 * - `undefined`: não configurado (mostrar erro em produção)
 */
export function getPublicApiUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "").trim();
  if (explicit) return explicit;
  if (process.env.NEXT_PUBLIC_API_SAME_ORIGIN === "1") return "";
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001";
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3001";
  }
  return undefined;
}

/** Mensagem quando `getPublicApiUrl()` é `undefined` em produção */
export const PUBLIC_API_CONFIG_MESSAGE_PT =
  "Configure a API no Railway: no serviço Web, defina NEXT_PUBLIC_API_URL com a URL pública da API (sem barra no fim) e faça um novo deploy antes do build. Alternativa: API_UPSTREAM_URL no build para o Next encaminhar /api/* à API — ver RAILWAY.md.";
