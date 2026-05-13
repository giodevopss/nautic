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
  "Configure a API no Railway: no serviço **Web**, defina **NEXT_PUBLIC_API_URL** com a URL pública da API (sem barra final) e faça um **novo deploy** (a variável entra no build). Alternativa: **API_UPSTREAM_URL** no build para o Next encaminhar `/api/*` à API — ver RAILWAY.md.";
