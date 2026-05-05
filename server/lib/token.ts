import { createHmac } from "crypto";

function secret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    "dev-only-change-auth-secret"
  );
}

/** Token compacto assinado (7 dias). */
export function issueSessionToken(customerId: string): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = Buffer.from(JSON.stringify({ sub: customerId, exp }), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { sub: string } | null {
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (sig.length !== expected.length || sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub: string;
      exp: number;
    };
    if (!data.sub || typeof data.exp !== "number") return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}
