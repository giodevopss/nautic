/**
 * Prisma MongoDB exige nome da base no connection string (/dbname após host:port).
 * Railway costuma dar só host:port — isto acrescenta o segmento antes de ? ou #.
 */
export function normalizeMongoDatabaseUrl(raw: string, dbName: string): string {
  const name = dbName.trim() || "nautic";
  if (!raw?.trim()) return raw;

  try {
    const u = new URL(raw);
    const firstSegment = u.pathname.replace(/^\//, "").split("/")[0] ?? "";

    const hasExplicitDatabase = firstSegment.length > 0;
    if (hasExplicitDatabase) return raw;

    u.pathname = `/${name}`;
    return u.href;
  } catch {
    return raw;
  }
}
